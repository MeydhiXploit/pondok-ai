import { randomBytes, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

/**
 * Generate a cryptographically secure random string.
 * Used for generating local credentials (database passwords, API keys, etc.)
 */
export function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('hex').slice(0, length);
}

/**
 * Generate a secure password suitable for database credentials.
 * Uses alphanumeric characters to avoid shell escaping issues.
 */
export function generatePassword(length: number = 24): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
}

/**
 * Compute SHA-256 hash of a string or Buffer.
 */
export function computeSha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Compute SHA-256 hash of a file synchronously.
 */
export function computeFileSha256(filePath: string): string {
  const buffer = readFileSync(filePath);
  return computeSha256(buffer);
}
