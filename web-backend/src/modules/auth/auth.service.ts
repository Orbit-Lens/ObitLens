// web-backend/src/modules/auth/auth.service.ts
// Core authentication business logic.
// Blueprint §7 — bcrypt cost ≥ 10, refresh-token rotation with reuse detection,
//                account lockout, AES-256-GCM for Google OAuth tokens.

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, type IUser } from './auth.model.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { encrypt } from '../../utils/encryption.js';
import { createAppError } from '../../utils/ownershipCheck.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ── Registration ──────────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<IUser> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw createAppError('Email already registered', 409, 'CONFLICT');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    role: 'member',
  });

  return user;
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> {
  // Fetch with sensitive fields — needed for password + lockout check
  const user = await User.findOne({ email: input.email.toLowerCase() }).select(
    '+passwordHash +failedLoginAttempts +lockoutUntil +refreshTokenHash +refreshTokenFamily'
  );

  if (!user || !user.passwordHash) {
    // Perform a dummy hash to maintain constant-time response
    await bcrypt.hash('dummy_password_for_timing', BCRYPT_ROUNDS);
    throw createAppError('Invalid credentials', 401, 'UNAUTHORIZED');
  }

  // Check account lockout
  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    const retryAfterSec = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 1000);
    throw createAppError(
      `Account locked. Try again in ${retryAfterSec} seconds.`,
      401,
      'UNAUTHORIZED'
    );
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatch) {
    const newAttempts = (user.failedLoginAttempts ?? 0) + 1;
    const update: Partial<Pick<IUser, 'failedLoginAttempts' | 'lockoutUntil'>> = {
      failedLoginAttempts: newAttempts,
    };

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      update.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }

    await User.updateOne({ _id: user._id }, update);
    throw createAppError('Invalid credentials', 401, 'UNAUTHORIZED');
  }

  // Reset lockout on successful login
  const family = crypto.randomUUID();
  const refreshToken = signRefreshToken({ id: user._id.toString(), family });
  const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

  await User.updateOne(
    { _id: user._id },
    {
      failedLoginAttempts: 0,
      lockoutUntil: undefined,
      refreshTokenHash,
      refreshTokenFamily: family,
    }
  );

  const accessToken = signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return { user, tokens: { accessToken, refreshToken } };
}

// ── Refresh token rotation ────────────────────────────────────────────────────

export async function refreshTokens(rawToken: string): Promise<AuthTokens> {
  let payload: ReturnType<typeof verifyRefreshToken>;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw createAppError('Invalid or expired refresh token', 401, 'TOKEN_INVALID');
  }

  const user = await User.findById(payload.id).select(
    '+refreshTokenHash +refreshTokenFamily +role'
  );

  if (!user || !user.refreshTokenHash || !user.refreshTokenFamily) {
    throw createAppError('Session not found', 401, 'TOKEN_INVALID');
  }

  const tokenMatch = await bcrypt.compare(rawToken, user.refreshTokenHash);

  if (!tokenMatch) {
    // Refresh token reuse detected — revoke all sessions for this user
    await User.updateOne(
      { _id: user._id },
      { refreshTokenHash: undefined, refreshTokenFamily: undefined }
    );
    throw createAppError('Refresh token reuse detected — all sessions revoked', 401, 'TOKEN_INVALID');
  }

  // Validate family matches (extra guard)
  if (user.refreshTokenFamily !== payload.family) {
    await User.updateOne(
      { _id: user._id },
      { refreshTokenHash: undefined, refreshTokenFamily: undefined }
    );
    throw createAppError('Token family mismatch — sessions revoked', 401, 'TOKEN_INVALID');
  }

  // Issue new tokens with a new family
  const newFamily = crypto.randomUUID();
  const newRefreshToken = signRefreshToken({ id: user._id.toString(), family: newFamily });
  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, BCRYPT_ROUNDS);

  await User.updateOne(
    { _id: user._id },
    { refreshTokenHash: newRefreshTokenHash, refreshTokenFamily: newFamily }
  );

  const newAccessToken = signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout(userId: string): Promise<void> {
  await User.updateOne(
    { _id: userId },
    { refreshTokenHash: undefined, refreshTokenFamily: undefined }
  );
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

export async function handleGoogleCallback(
  googleProfile: { id: string; emails?: Array<{ value: string }> },
  googleAccessToken: string
): Promise<{ user: IUser; tokens: AuthTokens }> {
  const email = googleProfile.emails?.[0]?.value;
  if (!email) {
    throw createAppError('Google profile missing email', 400, 'VALIDATION_ERROR');
  }

  const encryptedToken = encrypt(googleAccessToken);

  let user = await User.findOne({ googleId: googleProfile.id });

  if (!user) {
    // Check if email already registered with password — link accounts
    user = await User.findOne({ email: email.toLowerCase() }) ?? null;
    if (user) {
      await User.updateOne({ _id: user._id }, { googleId: googleProfile.id, encryptedToken });
    } else {
      user = await User.create({
        email: email.toLowerCase(),
        googleId: googleProfile.id,
        googleTokenEncrypted: encryptedToken,
        role: 'member',
      });
    }
  } else {
    await User.updateOne({ _id: user._id }, { googleTokenEncrypted: encryptedToken });
  }

  const family = crypto.randomUUID();
  const refreshToken = signRefreshToken({ id: user._id.toString(), family });
  const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

  await User.updateOne({ _id: user._id }, { refreshTokenHash, refreshTokenFamily: family });

  const accessToken = signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return { user, tokens: { accessToken, refreshToken } };
}
