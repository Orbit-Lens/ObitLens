// web-backend/src/app.ts
// Express application — middleware stack in Blueprint §4 order.

import express from 'express';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env } from './config/env.js';
import { configurePassport } from './config/passport.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import imageRoutes from './modules/images/image.routes.js';
import jobRoutes from './modules/jobs/job.routes.js';
import metricsRoutes from './modules/metrics/metrics.routes.js';
import healthRoutes from './modules/health/health.routes.js';

// ── Sentry (must init before Express routes) ───────────────────────────────────
// Sentry v8+ no longer has Sentry.Handlers — use Sentry.init + setupExpressErrorHandler.
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    // Scrub sensitive fields before sending to Sentry
    beforeSend(event) {
      if (event.request?.cookies) {
        // cookies is Record<string, string> in Sentry v8
        event.request.cookies = { filtered: '[Filtered]' };
      }
      if (event.request?.headers?.['authorization']) {
        event.request.headers['authorization'] = '[Filtered]';
      }
      return event;
    },
  });
}

export function createApp(): express.Application {
  const app = express();

  // ── 1. Security headers ───────────────────────────────────────────────────
  app.use(helmet());

  // ── 2. CORS — explicit origin allowlist ──────────────────────────────────
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  // ── 3. Body parsing — 5mb limit, NO raw imagery (that goes via presigned URL)
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // ── Cookie parser (needed for refresh token HttpOnly cookie)
  app.use(cookieParser());

  // ── 4. NoSQL injection prevention
  app.use(mongoSanitize());

  // ── 5. Dev logging
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // ── 6. Rate limits — Blueprint §7 ────────────────────────────────────────
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many auth requests' } },
  });

  const jobCreationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many job creation requests' } },
  });

  app.use('/api', globalLimiter);
  app.use('/api/v1/auth', authLimiter);
  app.use('/api/v1/jobs', jobCreationLimiter);

  // ── Passport initialisation
  configurePassport();
  app.use(passport.initialize());

  // ── 7. Health routes (before route mounts so they're never throttled)
  app.use('/', healthRoutes);

  // ── Route mounts ──────────────────────────────────────────────────────────
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/images', imageRoutes);
  app.use('/api/v1/jobs', jobRoutes);
  app.use('/api/v1/metrics', metricsRoutes);

  // ── 8. Sentry error handler — must be before custom error handler ──────────
  // Sentry v8+: setupExpressErrorHandler replaces the old Sentry.Handlers.errorHandler()
  if (env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }

  // ── 9. Central error handler (always last) ────────────────────────────────
  app.use(errorHandler);

  return app;
}
