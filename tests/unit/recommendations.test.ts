import { describe, it, expect } from 'vitest';
import {
  evaluateModel,
  getModelRecommendations,
  validateModelFit,
  POPULAR_MODELS,
  ModelSpec,
} from '../../src/system/recommendations.js';
import { SystemInfo } from '../../src/system/detect.js';

function createMockSystem(overrides: Partial<SystemInfo> = {}): SystemInfo {
  return {
    os: 'macOS',
    arch: 'arm64',
    platform: 'darwin',
    totalMemoryGB: 16,
    freeMemoryGB: 8,
    cpuCount: 8,
    cpuModel: 'Apple M1',
    gpuAvailable: true,
    gpuType: 'metal',
    gpuName: 'Apple Silicon (Metal)',
    gpuInfo: 'Apple Silicon (Metal, ~12GB unified VRAM)',
    vramGB: 12,
    vramFreeGB: 6,
    dockerInstalled: true,
    dockerRunning: true,
    dockerVersion: '24.0.0',
    dockerComposeVersion: '2.20.0',
    diskFreeGB: 100,
    ...overrides,
  };
}

describe('Smart Hardware Detection & Model Recommendations', () => {
  describe('evaluateModel', () => {
    it('should classify lightweight models as compatible on standard hardware', () => {
      const system = createMockSystem({ totalMemoryGB: 16, diskFreeGB: 80 });
      const llama3b = POPULAR_MODELS.find((m) => m.name === 'llama3.2:3b')!;

      const result = evaluateModel(llama3b, system);
      expect(result.tier).toBe('compatible');
      expect(result.fitsInRam).toBe(true);
      expect(result.fitsInDisk).toBe(true);
    });

    it('should classify large models as incompatible when RAM is insufficient', () => {
      const system = createMockSystem({ totalMemoryGB: 8 });
      const llama70b = POPULAR_MODELS.find((m) => m.name === 'llama3.1:70b')!;

      const result = evaluateModel(llama70b, system);
      expect(result.tier).toBe('incompatible');
      expect(result.fitsInRam).toBe(false);
      expect(result.reason).toContain('Requires at least 48GB RAM');
    });

    it('should classify models as incompatible when disk space is insufficient', () => {
      const system = createMockSystem({ totalMemoryGB: 64, diskFreeGB: 3 });
      const mistral7b = POPULAR_MODELS.find((m) => m.name === 'mistral:7b')!;

      const result = evaluateModel(mistral7b, system);
      expect(result.tier).toBe('incompatible');
      expect(result.fitsInDisk).toBe(false);
      expect(result.reason).toContain('Insufficient disk space');
    });

    it('should classify models as tight when between min and recommended RAM', () => {
      const system = createMockSystem({ totalMemoryGB: 8, vramGB: null, diskFreeGB: 50 });
      const qwen7b = POPULAR_MODELS.find((m) => m.name === 'qwen2.5:7b')!; // minRam: 8, recRam: 12

      const result = evaluateModel(qwen7b, system);
      expect(result.tier).toBe('tight');
      expect(result.fitsInRam).toBe(true);
      expect(result.reason).toContain('prevent swapping');
    });
  });

  describe('getModelRecommendations', () => {
    it('should recommend a compact model for machines with < 8GB RAM', () => {
      const system = createMockSystem({ totalMemoryGB: 4, diskFreeGB: 30 });
      const report = getModelRecommendations(system);

      expect(report.recommendedDefault.name).toBe('llama3.2:1b');
      expect(report.compatibleModels.length).toBeGreaterThan(0);
      expect(report.incompatibleModels.some((m) => m.model.name === 'llama3.1:70b')).toBe(true);
    });

    it('should recommend 3B model for machines with 8GB-16GB RAM', () => {
      const system = createMockSystem({ totalMemoryGB: 16, diskFreeGB: 60 });
      const report = getModelRecommendations(system);

      expect(report.recommendedDefault.name).toBe('llama3.1:8b');
      expect(report.compatibleModels.some((m) => m.model.name === 'llama3.2:3b')).toBe(true);
    });

    it('should recommend larger models for workstations with 32GB+ RAM', () => {
      const system = createMockSystem({ totalMemoryGB: 64, diskFreeGB: 200 });
      const report = getModelRecommendations(system);

      expect(report.recommendedDefault.parameterSize).toMatch(/(14B|8B)/);
      expect(report.compatibleModels.some((m) => m.model.name === 'deepseek-r1:14b')).toBe(true);
    });
  });

  describe('validateModelFit', () => {
    it('should issue warnings when installing a model that exceeds system capacity', () => {
      const system = createMockSystem({ totalMemoryGB: 8, diskFreeGB: 50 });
      const fit = validateModelFit('llama3.1:70b', system);

      expect(fit.canRun).toBe(false);
      expect(fit.tier).toBe('incompatible');
      expect(fit.warning).toContain('Requires at least 48GB RAM');
    });

    it('should validate successfully for fitting models', () => {
      const system = createMockSystem({ totalMemoryGB: 16, diskFreeGB: 50 });
      const fit = validateModelFit('llama3.2:3b', system);

      expect(fit.canRun).toBe(true);
      expect(fit.tier).toBe('compatible');
      expect(fit.warning).toBeUndefined();
    });

    it('should handle fuzzy model names (e.g. base name matching)', () => {
      const system = createMockSystem({ totalMemoryGB: 16, diskFreeGB: 50 });
      const fit = validateModelFit('llama3.2:latest', system);

      expect(fit.spec).toBeDefined();
      expect(fit.spec?.name).toContain('llama3.2');
    });
  });
});
