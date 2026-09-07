import bcrypt from 'bcryptjs';
import { User, IUser } from '../users/user.model.js';
import { AuditLog } from '../audit/audit.model.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function register(input: RegisterInput, ipAddress?: string): Promise<AuthTokens> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    await AuditLog.create({
      userEmail: input.email,
      action: 'USER_REGISTER',
      status: 'FAILED',
      details: 'Email conflict - user already exists',
      ipAddress,
    }).catch(() => {});
    const err: any = new Error('User with this email already exists');
    err.statusCode = 409;
    err.code = 'CONFLICT';
    throw err;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(input.password, salt);

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    role: input.role || 'user',
    lastLoginAt: new Date(),
    loginCount: 1,
  });

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const refreshToken = signRefreshToken({ userId: user._id.toString() });
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenHash = refreshHash;
  await user.save();

  await AuditLog.create({
    userId: user._id,
    userEmail: user.email,
    action: 'USER_REGISTER',
    status: 'SUCCESS',
    details: `User registered successfully with role '${user.role}'`,
    ipAddress,
  }).catch(() => {});

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function login(input: LoginInput, ipAddress?: string): Promise<AuthTokens> {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    await AuditLog.create({
      userEmail: input.email,
      action: 'USER_LOGIN',
      status: 'FAILED',
      details: 'Invalid email address',
      ipAddress,
    }).catch(() => {});
    const err: any = new Error('Invalid email or password');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  if (user.isLocked()) {
    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_LOGIN',
      status: 'FAILED',
      details: 'Account temporarily locked',
      ipAddress,
    }).catch(() => {});
    const err: any = new Error('Account temporarily locked due to multiple failed login attempts. Please try again later.');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    await user.incLoginAttempts();
    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_LOGIN',
      status: 'FAILED',
      details: 'Password mismatch',
      ipAddress,
    }).catch(() => {});
    const err: any = new Error('Invalid email or password');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  await user.resetLoginLock();

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const refreshToken = signRefreshToken({ userId: user._id.toString() });
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenHash = refreshHash;
  user.lastLoginAt = new Date();
  user.loginCount = (user.loginCount || 0) + 1;
  await user.save();

  await AuditLog.create({
    userId: user._id,
    userEmail: user.email,
    action: 'USER_LOGIN',
    status: 'SUCCESS',
    details: `User logged in successfully (Total logins: ${user.loginCount})`,
    ipAddress,
  }).catch(() => {});

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}


export async function refresh(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  let decoded: { userId: string };
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (error) {
    const err: any = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    err.code = 'TOKEN_INVALID';
    throw err;
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.refreshTokenHash) {
    const err: any = new Error('Unauthorized');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  // Verify stored hash matches
  const isMatch = await bcrypt.compare(oldRefreshToken, user.refreshTokenHash);
  if (!isMatch) {
    // Reuse detected! Invalidate all tokens for security
    user.refreshTokenHash = undefined;
    await user.save();
    const err: any = new Error('Refresh token reuse detected. Session invalidated.');
    err.statusCode = 401;
    err.code = 'TOKEN_INVALID';
    throw err;
  }

  // Rotate refresh token
  const newAccessToken = signAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = signRefreshToken({ userId: user._id.toString() });
  user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}
