// web-backend/src/modules/auth/auth.controller.ts
// HTTP handlers for auth routes.
// Blueprint §6 — Standard { success, data } response shape.

import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import type { Profile } from 'passport-google-oauth20';
import {
  register,
  login,
  refreshTokens,
  logout,
  handleGoogleCallback,
} from './auth.service.js';
import { env } from '../../config/env.js';

// Refresh token cookie name and options
const REFRESH_COOKIE = 'refreshToken';
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/api/v1/auth/refresh',     // Scope cookie to refresh endpoint only
};

// ── POST /api/v1/auth/register ────────────────────────────────────────────────

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await register(req.body);
    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/v1/auth/login ───────────────────────────────────────────────────

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, tokens } = await login(req.body);

    res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/v1/auth/refresh ─────────────────────────────────────────────────

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken = req.cookies[REFRESH_COOKIE] as string | undefined;

    if (!rawToken) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No refresh token' },
      });
      return;
    }

    const tokens = await refreshTokens(rawToken);

    res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);

    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/v1/auth/logout ──────────────────────────────────────────────────

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user) {
      await logout(req.user.id);
    }

    res.clearCookie(REFRESH_COOKIE, { path: cookieOptions.path });
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/v1/auth/google ───────────────────────────────────────────────────

export const googleAuthHandler = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

// ── GET /api/v1/auth/google/callback ─────────────────────────────────────────

export function googleCallbackHandler(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    'google',
    { session: false, failureRedirect: `${env.CLIENT_URL}/auth/login?error=google_failed` },
    async (err: Error | null, profile: Profile | null, accessToken: string) => {
      if (err || !profile) return next(err ?? new Error('Google auth failed'));

      try {
        const { tokens } = await handleGoogleCallback(profile, accessToken);

        res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);

        // Redirect to frontend with access token in URL fragment
        // (frontend reads it from the hash and stores in memory)
        res.redirect(`${env.CLIENT_URL}/auth/callback#token=${tokens.accessToken}`);
      } catch (callbackErr) {
        next(callbackErr);
      }
    }
  )(req, res, next);
}
