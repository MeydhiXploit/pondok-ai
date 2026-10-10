import { GeneratedEnv } from './schema.js';

export const REQUIRED_SECRET_KEYS = [
  'POSTGRES_PASSWORD',
  'API_SECRET_KEY',
  'N8N_ENCRYPTION_KEY',
] as const;

export type RequiredSecretKey = (typeof REQUIRED_SECRET_KEYS)[number];

/**
 * Return the required secrets that are empty or still contain an example value.
 */
export function findInvalidRequiredSecrets(
  env: Pick<GeneratedEnv, RequiredSecretKey>,
): RequiredSecretKey[] {
  return REQUIRED_SECRET_KEYS.filter((key) => {
    const value = env[key]?.trim();
    return !value || value.toLowerCase().startsWith('replace_with_');
  });
}
