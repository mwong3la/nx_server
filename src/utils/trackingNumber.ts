import { randomBytes } from 'crypto';

const ALPHANUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateTrackingNumber(): string {
  let s = '';
  const buf = randomBytes(8);
  for (let i = 0; i < 8; i++) {
    s += ALPHANUM[buf[i]! % ALPHANUM.length];
  }
  return `NB-${s}`;
}

export function normalizeTrackingInput(raw: string): string {
  return String(raw).trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Value stored in DB is always `NB-` + 8 alphanumeric chars.
 * Accepts the same pasted from email, or just the 8 characters.
 */
export function canonicalTrackingLookupKey(raw: string): string {
  let s = normalizeTrackingInput(raw);
  if (!s) return '';
  if (/^[A-Z0-9]{8}$/.test(s)) {
    s = `NB-${s}`;
  }
  return s;
}
