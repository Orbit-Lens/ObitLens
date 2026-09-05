// web-backend/src/utils/encryption.ts
// AES-256-GCM symmetric encryption for sensitive values stored at rest
// (e.g. Google OAuth tokens). Blueprint §7 — AES-256-GCM for stored OAuth tokens.

import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a base64-encoded string in the format: iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv) as crypto.CipherGCM;

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(
    ':'
  );
}

/**
 * Decrypts a value produced by encrypt().
 */
export function decrypt(encryptedValue: string): string {
  const [ivB64, authTagB64, dataB64] = encryptedValue.split(':');
  if (!ivB64 || !authTagB64 || !dataB64) throw new Error('Invalid encrypted value format');

  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv) as crypto.DecipherGCM;
  decipher.setAuthTag(authTag.slice(0, AUTH_TAG_LENGTH));

  return decipher.update(data).toString('utf8') + decipher.final('utf8');
}
