// web-backend/src/modules/health/health.controller.ts
// Liveness and readiness endpoints.
// Blueprint §7 — GET /health (liveness) and GET /ready (readiness) on both services.
// Health routes must NOT be behind the aggressive rate limiter.

import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { redisConnection } from '../../config/queue.js';
import { checkStorageReachable } from '../../config/storage.js';

// ── GET /health ───────────────────────────────────────────────────────────────
// Liveness: always 200 as long as the process is running.

export function healthHandler(_req: Request, res: Response): void {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
}

// ── GET /ready ────────────────────────────────────────────────────────────────
// Readiness: checks MongoDB, Redis, and S3/MinIO connectivity.

export async function readyHandler(_req: Request, res: Response): Promise<void> {
  const checks = await Promise.allSettled([
    // MongoDB — readyState 1 means connected
    Promise.resolve(mongoose.connection.readyState === 1),
    // Redis ping
    redisConnection.ping().then(() => true).catch(() => false),
    // S3/MinIO HeadBucket
    checkStorageReachable(),
  ]);

  const [mongoOk, redisOk, storageOk] = checks.map(
    (r) => r.status === 'fulfilled' && r.value === true
  );

  const allOk = mongoOk && redisOk && storageOk;

  res.status(allOk ? 200 : 503).json({
    success: allOk,
    data: {
      mongo: mongoOk ? 'ok' : 'unreachable',
      redis: redisOk ? 'ok' : 'unreachable',
      storage: storageOk ? 'ok' : 'unreachable',
      timestamp: new Date().toISOString(),
    },
  });
}
