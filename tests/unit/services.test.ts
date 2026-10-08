import { describe, it, expect } from 'vitest';
import { SERVICE_REGISTRY, getHealthCheckableServices } from '../../src/services/registry.js';

describe('Service Registry', () => {
  it('should contain all expected services', () => {
    expect(SERVICE_REGISTRY).toHaveProperty('ollama');
    expect(SERVICE_REGISTRY).toHaveProperty('openwebui');
    expect(SERVICE_REGISTRY).toHaveProperty('postgres');
    expect(SERVICE_REGISTRY).toHaveProperty('qdrant');
    expect(SERVICE_REGISTRY).toHaveProperty('api');
    expect(SERVICE_REGISTRY).toHaveProperty('n8n');
  });

  it('should have a displayName for every service', () => {
    for (const [key, meta] of Object.entries(SERVICE_REGISTRY)) {
      expect(meta.displayName, `${key} should have displayName`).toBeTruthy();
    }
  });

  it('should have unique default ports', () => {
    const ports = Object.values(SERVICE_REGISTRY).map((s) => s.defaultPort);
    expect(new Set(ports).size).toBe(ports.length);
  });

  it('should mark postgres as internal', () => {
    expect(SERVICE_REGISTRY.postgres.isInternal).toBe(true);
  });

  it('should not mark user-facing services as internal', () => {
    expect(SERVICE_REGISTRY.ollama.isInternal).toBe(false);
    expect(SERVICE_REGISTRY.openwebui.isInternal).toBe(false);
    expect(SERVICE_REGISTRY.api.isInternal).toBe(false);
  });

  it('should have health endpoints for health-checkable services', () => {
    const healthCheckable = getHealthCheckableServices();
    expect(healthCheckable.length).toBeGreaterThan(0);
    for (const svc of healthCheckable) {
      expect(svc.healthEndpoint).toBeTruthy();
    }
  });

  it('should not include postgres in health-checkable services', () => {
    const healthCheckable = getHealthCheckableServices();
    expect(healthCheckable.some((s) => s.name === 'postgres')).toBe(false);
  });
});
