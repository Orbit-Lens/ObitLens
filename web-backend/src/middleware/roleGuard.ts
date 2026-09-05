// web-backend/src/middleware/roleGuard.ts
// Role-based access control middleware.
// Blueprint §7 — Minimum role: owner / admin / member / public.

import type { Request, Response, NextFunction } from 'express';
import { createAppError } from '../utils/ownershipCheck.js';

/**
 * Returns a middleware that checks req.user.role is in the allowedRoles list.
 * Must be used after requireAuth.
 */
export function roleGuard(...allowedRoles: Array<'admin' | 'member'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createAppError('Not authenticated', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(createAppError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    next();
  };
}
