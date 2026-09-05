// web-backend/src/utils/jwt.ts
// JWT sign/verify wrappers.
// Access token: 15min, sent in Authorization: Bearer header.
// Refresh token: 7d, stored in HttpOnly cookie, hashed at rest in MongoDB.
// Blueprint §1 — Token lifetime standard.

import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  id: string;
  family: string; // Token family UUID — used for reuse detection
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const expiresIn: StringValue = (env.JWT_ACCESS_EXPIRES_IN ?? '15m') as StringValue;
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn, algorithm: 'HS256' });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const expiresIn: StringValue = (env.JWT_REFRESH_EXPIRES_IN ?? '7d') as StringValue;
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn, algorithm: 'HS256' });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
