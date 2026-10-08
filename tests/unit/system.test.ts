import { describe, it, expect } from 'vitest';
import { checkRequirements, hasErrors } from '../../src/system/requirements.js';
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
    gpuInfo: 'Apple Silicon (Metal)',
    dockerInstalled: true,
    dockerRunning: true,
    dockerVersion: '24.0.0',
    dockerComposeVersion: '2.20.0',
    diskFreeGB: 100,
    ...overrides,
  };
}

describe('System Requirements', () => {
  it('should pass all checks for a well-equipped system', () => {
    const system = createMockSystem();
    const checks = checkRequirements(system);
    expect(hasErrors(checks)).toBe(false);
  });

  it('should fail when Docker is not installed', () => {
    const system = createMockSystem({
      dockerInstalled: false,
      dockerRunning: false,
      dockerVersion: null,
      dockerComposeVersion: null,
    });
    const checks = checkRequirements(system);
    expect(hasErrors(checks)).toBe(true);
    expect(checks.some((c) => c.name === 'Docker installed' && !c.passed)).toBe(true);
  });

  it('should fail when Docker is installed but not running', () => {
    const system = createMockSystem({ dockerRunning: false });
    const checks = checkRequirements(system);
    expect(hasErrors(checks)).toBe(true);
    expect(checks.some((c) => c.name === 'Docker running' && !c.passed)).toBe(true);
  });

  it('should fail when RAM is below minimum', () => {
    const system = createMockSystem({ totalMemoryGB: 2 });
    const checks = checkRequirements(system);
    expect(hasErrors(checks)).toBe(true);
    expect(checks.some((c) => c.name === 'Memory' && !c.passed)).toBe(true);
  });

  it('should warn when RAM is between minimum and recommended', () => {
    const system = createMockSystem({ totalMemoryGB: 6 });
    const checks = checkRequirements(system);
    expect(hasErrors(checks)).toBe(false);
    expect(checks.some((c) => c.name === 'Memory' && c.severity === 'warning')).toBe(true);
  });

  it('should fail when disk space is below minimum', () => {
    const system = createMockSystem({ diskFreeGB: 5 });
    const checks = checkRequirements(system);
    expect(hasErrors(checks)).toBe(true);
    expect(checks.some((c) => c.name === 'Disk space' && !c.passed)).toBe(true);
  });

  it('should warn when disk space is between minimum and recommended', () => {
    const system = createMockSystem({ diskFreeGB: 15 });
    const checks = checkRequirements(system);
    expect(hasErrors(checks)).toBe(false);
    expect(checks.some((c) => c.name === 'Disk space' && c.severity === 'warning')).toBe(true);
  });

  it('should warn when no GPU is available', () => {
    const system = createMockSystem({ gpuAvailable: false, gpuInfo: null });
    const checks = checkRequirements(system);
    expect(hasErrors(checks)).toBe(false); // GPU is never required
    expect(checks.some((c) => c.name === 'GPU' && c.severity === 'warning')).toBe(true);
  });

  it('should not check Docker running/compose if Docker is not installed', () => {
    const system = createMockSystem({
      dockerInstalled: false,
      dockerRunning: false,
      dockerVersion: null,
      dockerComposeVersion: null,
    });
    const checks = checkRequirements(system);
    expect(checks.filter((c) => c.name === 'Docker running')).toHaveLength(0);
    expect(checks.filter((c) => c.name === 'Docker Compose')).toHaveLength(0);
  });
});
