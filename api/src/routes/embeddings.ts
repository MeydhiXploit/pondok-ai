import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

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
              anyOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } },
              ],
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: EmbeddingRequest }>,
      reply: FastifyReply,
    ) => {
      const { model, input } = request.body;
      const inputs = Array.isArray(input) ? input : [input];

      try {
        const embeddingsData = await Promise.all(
          inputs.map(async (text, index) => {
            const response = await fetch(`${app.config.ollamaBaseUrl}/api/embeddings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
        app.log.error(error, 'Embeddings generation error');
        return reply.status(502).send({
          error: {
            message: error instanceof Error ? error.message : 'Failed to generate embeddings',
            type: 'upstream_error',
          },
        });
      }
    },
  );
}
