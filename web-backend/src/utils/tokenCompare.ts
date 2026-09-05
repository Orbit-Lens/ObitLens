// web-backend/src/utils/tokenCompare.ts
// Timing-safe comparison for secrets and API keys.
// Blueprint §7 — crypto.timingSafeEqual() for all token/API-key comparisons.

import crypto from 'crypto';

/**
 * Compares two strings using a constant-time algorithm to prevent
 * timing-based side-channel attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');

    // Must be same length for timingSafeEqual; use a hmac comparison
    // approach that is always constant-time regardless of length.
    const hmacA = crypto.createHmac('sha256', 'orbitlens-compare').update(bufA).digest();
    const hmacB = crypto.createHmac('sha256', 'orbitlens-compare').update(bufB).digest();

    return crypto.timingSafeEqual(hmacA, hmacB);
  } catch {
    return false;
  }
}
