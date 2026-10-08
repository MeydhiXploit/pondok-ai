import { describe, it, expect } from 'vitest';
import { generateSecret, generatePassword } from '../../src/utils/crypto.js';
import { isNonEmpty, isValidPort, isValidPreset, isValidModelName } from '../../src/utils/validation.js';

describe('Crypto Utilities', () => {
  describe('generateSecret', () => {
    it('should generate a string of the specified length', () => {
      const secret = generateSecret(32);
      expect(secret).toHaveLength(32);
    });

    it('should generate hex characters only', () => {
      const secret = generateSecret(64);
      expect(secret).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate unique secrets', () => {
      const secrets = new Set(Array.from({ length: 10 }, () => generateSecret(32)));
      expect(secrets.size).toBe(10);
    });
  });

  describe('generatePassword', () => {
    it('should generate a string of the specified length', () => {
      const password = generatePassword(24);
      expect(password).toHaveLength(24);
    });

    it('should use only alphanumeric characters', () => {
      const password = generatePassword(100);
      expect(password).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should generate unique passwords', () => {
      const passwords = new Set(Array.from({ length: 10 }, () => generatePassword(24)));
      expect(passwords.size).toBe(10);
    });
  });
});

describe('Validation Utilities', () => {
  describe('isNonEmpty', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmpty('hello')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isNonEmpty('')).toBe(false);
      expect(isNonEmpty('   ')).toBe(false);
    });

    it('should return false for non-string types', () => {
      expect(isNonEmpty(null)).toBe(false);
      expect(isNonEmpty(undefined)).toBe(false);
      expect(isNonEmpty(42)).toBe(false);
    });
  });

  describe('isValidPort', () => {
    it('should accept valid port numbers', () => {
      expect(isValidPort(80)).toBe(true);
      expect(isValidPort(443)).toBe(true);
      expect(isValidPort(3000)).toBe(true);
      expect(isValidPort(65535)).toBe(true);
      expect(isValidPort(1)).toBe(true);
    });

    it('should reject invalid ports', () => {
      expect(isValidPort(0)).toBe(false);
      expect(isValidPort(-1)).toBe(false);
      expect(isValidPort(65536)).toBe(false);
      expect(isValidPort(3.14)).toBe(false);
    });

    it('should accept string ports', () => {
      expect(isValidPort('8080')).toBe(true);
      expect(isValidPort('0')).toBe(false);
    });
  });

  describe('isValidPreset', () => {
    it('should accept valid presets', () => {
      expect(isValidPreset('minimal')).toBe(true);
      expect(isValidPreset('standard')).toBe(true);
      expect(isValidPreset('full')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isValidPreset('MINIMAL')).toBe(true);
      expect(isValidPreset('Standard')).toBe(true);
    });

    it('should reject invalid presets', () => {
      expect(isValidPreset('invalid')).toBe(false);
      expect(isValidPreset('')).toBe(false);
    });
  });

  describe('isValidModelName', () => {
    it('should accept valid model names', () => {
      expect(isValidModelName('llama3.2')).toBe(true);
      expect(isValidModelName('mistral')).toBe(true);
      expect(isValidModelName('codellama:7b')).toBe(true);
      expect(isValidModelName('llama3.1:70b')).toBe(true);
    });

    it('should reject invalid model names', () => {
      expect(isValidModelName('')).toBe(false);
      expect(isValidModelName(' ')).toBe(false);
      expect(isValidModelName('model name')).toBe(false);
      expect(isValidModelName(':tag')).toBe(false);
    });
  });
});
