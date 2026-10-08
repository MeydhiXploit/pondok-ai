import { FastifyInstance } from 'fastify';

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export async function modelsRoute(app: FastifyInstance): Promise<void> {
  // OpenAI-compatible models endpoint
  app.get('/v1/models', async (_request, reply) => {
    try {
      const response = await fetch(`${app.config.ollamaBaseUrl}/api/tags`);

      if (!response.ok) {
        return reply.status(502).send({
          error: { message: 'Failed to fetch models from Ollama', type: 'upstream_error' },
        });
      }

      const data = (await response.json()) as { models: OllamaModel[] };

      const models = (data.models ?? []).map((m) => ({
        id: m.name,
        object: 'model',
        created: Math.floor(new Date(m.modified_at).getTime() / 1000),
        owned_by: 'local',
        permission: [],
        root: m.name,
        parent: null,
      }));

      return reply.send({
        object: 'list',
        data: models,
      });
    } catch (error) {
      app.log.error(error, 'Models list error');
      return reply.status(502).send({
        error: { message: 'Failed to connect to Ollama', type: 'upstream_error' },
      });
    }
  });

  // Direct models list (simpler format)
  app.get('/models', async (_request, reply) => {
    try {
      const response = await fetch(`${app.config.ollamaBaseUrl}/api/tags`);

      if (!response.ok) {
        return reply.status(502).send({
          error: { message: 'Failed to fetch models from Ollama', type: 'upstream_error' },
        });
      }

      const data = (await response.json()) as { models: OllamaModel[] };

      return reply.send({
        models: (data.models ?? []).map((m) => ({
          name: m.name,
          size: m.size,
          details: m.details,
        })),
      });
    } catch (error) {
      app.log.error(error, 'Models list error');
      return reply.status(502).send({
        error: { message: 'Failed to connect to Ollama', type: 'upstream_error' },
      });
    }
  });
}
