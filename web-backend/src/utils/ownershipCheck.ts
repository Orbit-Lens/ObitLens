// web-backend/src/utils/ownershipCheck.ts
// Ownership assertion helper — Blueprint §4 exact pattern.
// Returns 404 (not 403) when a resource doesn't belong to the requesting user.
// This prevents resource enumeration attacks.

import { type Model, Types } from 'mongoose';

/**
 * Finds a document by ID + userId. Throws a 404 AppError if not found.
 * Use this in every controller that touches Image or Job resources.
 */
export async function assertOwnership<T>(
  ModelClass: Model<T>,
  resourceId: string,
  userId: string
): Promise<T> {
  if (!Types.ObjectId.isValid(resourceId)) {
    const err = new Error('Resource not found') as AppError;
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const doc = await ModelClass.findOne({
    _id: new Types.ObjectId(resourceId),
    userId: new Types.ObjectId(userId),
  });

  if (!doc) {
    const err = new Error('Resource not found') as AppError;
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  return doc;
}

export interface AppError extends Error {
  statusCode: number;
  code: string;
  fields?: Record<string, string[]>;
}

export function createAppError(
  message: string,
  statusCode: number,
  code: string,
  fields?: Record<string, string[]>
): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  if (fields) err.fields = fields;
  return err;
}
