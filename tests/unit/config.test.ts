import { describe, it, expect } from 'vitest';
import { getDefaultConfig, PRESET_SERVICES, PRESET_DESCRIPTIONS, DEFAULT_PORTS } from '../../src/config/defaults.js';
import { validateConfig } from '../../src/config/schema.js';

describe('Config Defaults', () => {
  describe('getDefaultConfig', () => {
    it('should generate a valid minimal config', () => {
      const config = getDefaultConfig('minimal');
      expect(config.version).toBe(1);
      expect(config.preset).toBe('minimal');
      expect(config.services.ollama.enabled).toBe(true);
      expect(config.services.openwebui.enabled).toBe(true);
      expect(config.services.postgres.enabled).toBe(false);
      expect(config.services.qdrant.enabled).toBe(false);
      expect(config.services.api.enabled).toBe(false);
      expect(config.services.n8n.enabled).toBe(false);
    });

    it('should generate a valid standard config', () => {
      const config = getDefaultConfig('standard');
      expect(config.preset).toBe('standard');
      expect(config.services.ollama.enabled).toBe(true);
      expect(config.services.openwebui.enabled).toBe(true);
      expect(config.services.postgres.enabled).toBe(true);
      expect(config.services.qdrant.enabled).toBe(true);
      expect(config.services.api.enabled).toBe(true);
      expect(config.services.n8n.enabled).toBe(false);
    });

    it('should generate a valid full config', () => {
      const config = getDefaultConfig('full');
      expect(config.preset).toBe('full');
      expect(config.services.ollama.enabled).toBe(true);
      expect(config.services.openwebui.enabled).toBe(true);
      expect(config.services.postgres.enabled).toBe(true);
      expect(config.services.qdrant.enabled).toBe(true);
      expect(config.services.api.enabled).toBe(true);
      expect(config.services.n8n.enabled).toBe(true);
    });

    it('should default GPU to disabled', () => {
      const config = getDefaultConfig('minimal');
      expect(config.services.ollama.gpuEnabled).toBe(false);
    });

    it('should bind to localhost by default', () => {
      const config = getDefaultConfig('standard');
      expect(config.network.bindAddress).toBe('127.0.0.1');
    });

    it('should use correct default ports', () => {
      const config = getDefaultConfig('full');
      expect(config.services.ollama.port).toBe(DEFAULT_PORTS.ollama);
      expect(config.services.openwebui.port).toBe(DEFAULT_PORTS.openwebui);
      expect(config.services.postgres.port).toBe(DEFAULT_PORTS.postgres);
      expect(config.services.qdrant.port).toBe(DEFAULT_PORTS.qdrant);
      expect(config.services.api.port).toBe(DEFAULT_PORTS.api);
      expect(config.services.n8n.port).toBe(DEFAULT_PORTS.n8n);
    });
  });

  describe('PRESET_SERVICES', () => {
    it('should have all three presets', () => {
      expect(Object.keys(PRESET_SERVICES)).toEqual(['minimal', 'standard', 'full']);
    });

    it('should have minimal as subset of standard', () => {
      for (const svc of PRESET_SERVICES.minimal) {
        expect(PRESET_SERVICES.standard).toContain(svc);
      }
    });

    it('should have standard as subset of full', () => {
      for (const svc of PRESET_SERVICES.standard) {
        expect(PRESET_SERVICES.full).toContain(svc);
      }
    });
  });

  describe('PRESET_DESCRIPTIONS', () => {
    it('should have descriptions for all presets', () => {
      expect(PRESET_DESCRIPTIONS.minimal).toBeDefined();
      expect(PRESET_DESCRIPTIONS.standard).toBeDefined();
      expect(PRESET_DESCRIPTIONS.full).toBeDefined();
    });
  });
});

describe('Config Validation', () => {
  it('should accept a valid config', () => {
    const config = getDefaultConfig('standard');
    const errors = validateConfig(config);
    expect(errors).toHaveLength(0);
  });

  it('should reject null', () => {
    const errors = validateConfig(null);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject wrong version', () => {
    const config = { ...getDefaultConfig('minimal'), version: 2 };
    const errors = validateConfig(config);
    expect(errors).toContain('Configuration version must be 1');
  });

  it('should reject invalid preset', () => {
    const config = { ...getDefaultConfig('minimal'), preset: 'invalid' };
    const errors = validateConfig(config);
    expect(errors.some((e) => e.includes('Invalid preset'))).toBe(true);
  });

  it('should reject empty projectName', () => {
    const config = { ...getDefaultConfig('minimal'), projectName: '' };
    const errors = validateConfig(config);
    expect(errors.some((e) => e.includes('projectName'))).toBe(true);
  });
});
