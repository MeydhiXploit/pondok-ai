import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createOpenAiError } from '../errors.js';
import { createUpstreamFailure, createUpstreamRequestContext } from '../upstream.js';

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
  app.get('/v1/models', async (request: FastifyRequest, reply: FastifyReply) => {
    const upstream = createUpstreamRequestContext(
      request,
      reply,
      app.config.ollamaRequestTimeoutMs,
    );

    try {
      const response = await fetch(`${app.config.ollamaBaseUrl}/api/tags`, {
        signal: upstream.signal,
      });

      if (!response.ok) {
        return reply
          .status(502)
          .send(
            createOpenAiError(
              'Failed to fetch models from Ollama',
              'upstream_error',
              'upstream_error',
            ),
          );
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
      if (!upstream.didClientDisconnect()) {
        app.log.error(error, 'Models list error');
      }

      if (upstream.didClientDisconnect()) {
        return;
      }

      const failure = createUpstreamFailure(upstream, 'Failed to connect to Ollama');
      return reply.status(failure.statusCode).send(failure.body);
    } finally {
      upstream.cleanup();
    }
  });

  // Direct models list (simpler format)
  app.get('/models', async (request: FastifyRequest, reply: FastifyReply) => {
    const upstream = createUpstreamRequestContext(
      request,
      reply,
      app.config.ollamaRequestTimeoutMs,
    );

    try {
      const response = await fetch(`${app.config.ollamaBaseUrl}/api/tags`, {
        signal: upstream.signal,
      });

      if (!response.ok) {
        return reply
          .status(502)
          .send(
            createOpenAiError(
              'Failed to fetch models from Ollama',
              'upstream_error',
              'upstream_error',
            ),
          );
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
      if (!upstream.didClientDisconnect()) {
        app.log.error(error, 'Models list error');
      }

      if (upstream.didClientDisconnect()) {
        return;
      }

      const failure = createUpstreamFailure(upstream, 'Failed to connect to Ollama');
      return reply.status(failure.statusCode).send(failure.body);
    } finally {
      upstream.cleanup();
    }
  });
}
