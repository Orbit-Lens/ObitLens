// web-backend/src/middleware/requireAuth.ts
// JWT access-token verification middleware.
// Attaches req.user on success; throws typed error codes on failure.
// Blueprint §7 — Auth: access tokens short-lived (15min), sent in Authorization: Bearer header.

import type { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt.js';
import { createAppError } from '../utils/ownershipCheck.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(createAppError('No token provided', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role as 'admin' | 'member',
    };
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return next(createAppError('Access token expired', 401, 'TOKEN_EXPIRED'));
    }
    if (err instanceof JsonWebTokenError) {
      return next(createAppError('Invalid token', 401, 'TOKEN_INVALID'));
    }
    next(err);
  }
}
