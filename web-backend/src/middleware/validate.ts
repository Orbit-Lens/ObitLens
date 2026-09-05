// web-backend/src/middleware/validate.ts
// Generic Zod validation middleware factory.
// Blueprint §7 — Zod validation on every route body/query/params.

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { createAppError } from '../utils/ownershipCheck.js';

type Target = 'body' | 'query' | 'params';

/**
 * Returns an Express middleware that validates req[target] against the schema.
 * On failure: returns 400 VALIDATION_ERROR with field-level error messages.
 * On success: replaces req[target] with the parsed (coerced) data.
 */
export function validate<T>(schema: ZodSchema<T>, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const fields: Record<string, string[]> = {};

      for (const issue of zodError.issues) {
        const key = issue.path.join('.') || '_root';
        if (!fields[key]) fields[key] = [];
        fields[key]!.push(issue.message);
      }

      return next(createAppError('Validation failed', 400, 'VALIDATION_ERROR', fields));
    }

    // Replace with parsed/coerced data
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}
