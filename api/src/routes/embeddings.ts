import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createOpenAiError } from '../errors.js';
import { createUpstreamFailure, createUpstreamRequestContext } from '../upstream.js';

interface EmbeddingRequest {
  model: string;
  input: string | string[];
}

export async function embeddingsRoute(app: FastifyInstance): Promise<void> {
  app.post(
    '/v1/embeddings',
    {
      schema: {
        body: {
          type: 'object',
          required: ['model', 'input'],
          properties: {
            model: { type: 'string' },
            input: {
              anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: EmbeddingRequest }>, reply: FastifyReply) => {
      const { model, input } = request.body;
      const inputs = Array.isArray(input) ? input : [input];
      const upstream = createUpstreamRequestContext(
        request,
        reply,
        app.config.ollamaRequestTimeoutMs,
      );

      try {
        const embeddingsData = await Promise.all(
          inputs.map(async (text, index) => {
            const response = await fetch(`${app.config.ollamaBaseUrl}/api/embeddings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: upstream.signal,
              body: JSON.stringify({
                model,
                prompt: text,
              }),
            });

            if (!response.ok) {
              const err = await response.text();
              throw new Error(`Ollama embedding error: ${err}`);
            }

            const data = (await response.json()) as { embedding: number[] };
            return {
              object: 'embedding',
              index,
              embedding: data.embedding,
            };
          }),
        );

        return reply.send({
          object: 'list',
          data: embeddingsData,
          model,
          usage: {
            prompt_tokens: 0,
            total_tokens: 0,
          },
        });
      } catch (error) {
        if (!upstream.didClientDisconnect()) {
          app.log.error(error, 'Embeddings generation error');
        }

        if (upstream.didClientDisconnect()) {
          return;
        }

        const failure = createUpstreamFailure(
          upstream,
          error instanceof Error ? error.message : 'Failed to generate embeddings',
        );
        return reply.status(failure.statusCode).send(failure.body);
      } finally {
        upstream.cleanup();
      }
    },
  );
}
