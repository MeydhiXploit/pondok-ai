import { Preset, StackConfig } from './schema.js';

/**
 * Default Docker images for each service.
 */
export const DEFAULT_IMAGES = {
  ollama: 'ollama/ollama:latest',
  openwebui: 'ghcr.io/open-webui/open-webui:main',
  postgres: 'postgres:16-alpine',
  qdrant: 'qdrant/qdrant:latest',
  api: 'local-ai-stack-api:latest',
  n8n: 'n8nio/n8n:latest',
} as const;

/**
 * Default port mappings for each service.
 */
export const DEFAULT_PORTS = {
  ollama: 11434,
  openwebui: 3000,
  postgres: 5432,
  qdrant: 6333,
  api: 8000,
  n8n: 5678,
} as const;

/**
 * Services included in each preset.
 */
export const PRESET_SERVICES: Record<Preset, string[]> = {
  minimal: ['ollama', 'openwebui'],
  standard: ['ollama', 'openwebui', 'postgres', 'qdrant', 'api'],
  full: ['ollama', 'openwebui', 'postgres', 'qdrant', 'api', 'n8n'],
};

/**
 * Human-readable preset descriptions.
 */
export const PRESET_DESCRIPTIONS: Record<Preset, string> = {
  minimal: 'Ollama + Open WebUI — Quick chat and experimentation',
  standard: 'Minimal + PostgreSQL, Qdrant, API Gateway — Development & RAG',
  full: 'Standard + n8n — Workflow automation and production-like setup',
};

/**
 * Generate a default configuration for a given preset.
 */
export function getDefaultConfig(preset: Preset): StackConfig {
  const enabledServices = PRESET_SERVICES[preset];

  return {
    version: 1,
    preset,
    projectName: 'local-ai-stack',
    services: {
      ollama: {
        enabled: enabledServices.includes('ollama'),
        port: DEFAULT_PORTS.ollama,
        image: DEFAULT_IMAGES.ollama,
        gpuEnabled: false,
      },
      openwebui: {
        enabled: enabledServices.includes('openwebui'),
        port: DEFAULT_PORTS.openwebui,
        image: DEFAULT_IMAGES.openwebui,
      },
      postgres: {
        enabled: enabledServices.includes('postgres'),
        port: DEFAULT_PORTS.postgres,
        image: DEFAULT_IMAGES.postgres,
        database: 'localaistack',
        username: 'localaistack',
      },
      qdrant: {
        enabled: enabledServices.includes('qdrant'),
        port: DEFAULT_PORTS.qdrant,
        image: DEFAULT_IMAGES.qdrant,
      },
      api: {
        enabled: enabledServices.includes('api'),
        port: DEFAULT_PORTS.api,
        image: DEFAULT_IMAGES.api,
      },
      n8n: {
        enabled: enabledServices.includes('n8n'),
        port: DEFAULT_PORTS.n8n,
        image: DEFAULT_IMAGES.n8n,
      },
    },
    network: {
      bindAddress: '127.0.0.1',
    },
  };
}
