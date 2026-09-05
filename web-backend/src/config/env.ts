// web-backend/src/config/env.ts
// Single source of truth for environment variables.
// Crashes at startup if any required variable is missing or malformed.
// Blueprint §3 — Zod-validated env pattern.

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(5000),

  // Database
  MONGODB_URI: z.string().url(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth (optional — feature-flagged)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // Frontend
  CLIENT_URL: z.string().url(),

  // CORS
  CORS_ORIGINS: z.string(),

  // Encryption (AES-256-GCM)
  ENCRYPTION_KEY: z.string().length(64),

  // Redis
  REDIS_URL: z.string().url(),

  // S3 / MinIO object storage
  S3_ENDPOINT: z.string().url(),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_REGION: z.string().default('us-east-1'),

  // Processing service (internal)
  PROCESSING_SERVICE_URL: z.string().url(),
  PROCESSING_SERVICE_API_KEY: z.string().min(16),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
