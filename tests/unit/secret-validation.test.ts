import { describe, expect, it } from 'vitest';
import { GeneratedEnv } from '../../src/config/schema.js';
import { findInvalidRequiredSecrets } from '../../src/config/secrets.js';

const validEnv: GeneratedEnv = {
  POSTGRES_PASSWORD: 'postgres-password',
  API_SECRET_KEY: 'api-secret-key',
  N8N_ENCRYPTION_KEY: 'n8n-encryption-key',
};

describe('required secret validation', () => {
  it('accepts populated generated secret values', () => {
    expect(findInvalidRequiredSecrets(validEnv)).toEqual([]);
  });

  it.each([
    ['POSTGRES_PASSWORD', ''],
    ['API_SECRET_KEY', '   '],
    ['N8N_ENCRYPTION_KEY', 'replace_with_32_character_encryption_key'],
  ] as const)('rejects an empty or placeholder %s value', (key, value) => {
    const env = { ...validEnv, [key]: value };

    expect(findInvalidRequiredSecrets(env)).toEqual([key]);
  });
});
