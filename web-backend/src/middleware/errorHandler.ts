// web-backend/src/middleware/errorHandler.ts
// Central error handler — always the last middleware in app.ts.
// Blueprint §6 — Standard error response shape.
// Blueprint §7 — Never leaks stack traces in production.

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import type { AppError } from '../utils/ownershipCheck.js';

// HTTP status code → error code mapping
const codeToStatus: Record<string, number> = {
  VALIDATION_ERROR: 400,
  UNSUPPORTED_IMAGE_FORMAT: 400,
  INVALID_SENSOR_PAIR: 400,
  UNAUTHORIZED: 401,
  TOKEN_EXPIRED: 401,
  TOKEN_INVALID: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  REGISTRATION_LOW_CONFIDENCE: 422,
  RATE_LIMIT_EXCEEDED: 429,
  PROCESSING_SERVICE_UNAVAILABLE: 502,
  INTERNAL_ERROR: 500,
};

export function errorHandler(
  err: AppError | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const appErr = err as AppError;
  const code = appErr.code ?? 'INTERNAL_ERROR';
  const statusCode = appErr.statusCode ?? codeToStatus[code] ?? 500;
  const message = appErr.message ?? 'An unexpected error occurred';

  // Log server errors (5xx) at error level; client errors (4xx) at warn
  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      code,
      message,
      method: req.method,
      path: req.path,
      stack: env.NODE_ENV !== 'production' ? err.stack : undefined,
    });
  } else {
    logger.warn('Client error', { code, message, method: req.method, path: req.path });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      // Include field-level validation errors if present
      ...(appErr.fields ? { fields: appErr.fields } : {}),
      // Include stack only in non-production for debugging
      ...(env.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: err.stack } : {}),
    },
  });
}
