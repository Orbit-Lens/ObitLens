// web-backend/src/config/passport.ts
// Google OAuth 2.0 strategy — feature-flagged behind GOOGLE_CLIENT_ID env var.
// If the env var is absent the strategy is not registered and Google login is disabled.
// Blueprint §1 — Auth: Google OAuth + Email/Password.

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export function configurePassport(): void {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    logger.info('Google OAuth not configured — GOOGLE_CLIENT_ID not set, skipping strategy');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      // The actual user lookup / upsert is handled in auth.service.ts via googleCallbackHandler.
      // We pass the raw profile as the "user" object; the controller extracts email/id from it.
      (_accessToken, _refreshToken, profile, done) => {
        done(null, profile as unknown as Express.User);
      }
    )
  );

  logger.info('Google OAuth strategy configured');
}
