import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password or admin key using bcryptjs.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Verifies a plain text password or admin key against a stored bcrypt hash.
 * Returns false if plain text or hash is empty/invalid.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) {
    return false;
  }
  return bcrypt.compare(plain, hash);
}

/**
 * Generates a cryptographically secure random admin key (32-character hex).
 */
export function generateAdminKey(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generates an HMAC session unlock token for password-protected sessions.
 */
export function getSessionUnlockToken(sessionId: string, passwordHash: string): string {
  return crypto.createHmac('sha256', passwordHash).update(sessionId).digest('hex');
}

