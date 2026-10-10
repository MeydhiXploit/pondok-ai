import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createOpenAiError } from '../errors.js';

interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export async function chatCompletionsRoute(app: FastifyInstance): Promise<void> {
  app.post(
    '/v1/chat/completions',
    {
      schema: {
        body: {
          type: 'object',
          required: ['model', 'messages'],
          properties: {
            model: { type: 'string' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                required: ['role', 'content'],
                properties: {
                  role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                  content: { type: 'string' },
                },
              },
            },
            temperature: { type: 'number', minimum: 0, maximum: 2 },
            max_tokens: { type: 'integer', minimum: 1 },
            top_p: { type: 'number', minimum: 0, maximum: 1 },
            stream: { type: 'boolean' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ChatCompletionRequest }>, reply: FastifyReply) => {
      const { model, messages, temperature, max_tokens, top_p, stream } = request.body;

      const ollamaUrl = `${app.config.ollamaBaseUrl}/api/chat`;

      const ollamaPayload = {
        model,
        messages,
        stream: stream ?? false,
        options: {
          ...(temperature !== undefined && { temperature }),
          ...(top_p !== undefined && { top_p }),
          ...(max_tokens !== undefined && { num_predict: max_tokens }),
        },
      };

      try {
        if (stream) {
          // Streaming response
          const response = await fetch(ollamaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...ollamaPayload, stream: true }),
          });

          if (!response.ok) {
            const error = await response.text();
            return reply
              .status(response.status)
              .send(
                createOpenAiError(`Ollama error: ${error}`, 'upstream_error', 'upstream_error'),
              );
          }

          reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          });

          const reader = response.body?.getReader();
          if (!reader) {
            return reply
              .status(500)
              .send(createOpenAiError('No response body', 'upstream_error', 'upstream_error'));
          }

          const decoder = new TextDecoder();
          const id = `chatcmpl-${Date.now()}`;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter((l) => l.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                const sseChunk = {
                  id,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model,
                  choices: [
                    {
                      index: 0,
                      delta: {
                        ...(data.message?.content && { content: data.message.content }),
                        ...(data.message?.role && { role: data.message.role }),
                      },
                      finish_reason: data.done ? 'stop' : null,
                    },
                  ],
                };

                reply.raw.write(`data: ${JSON.stringify(sseChunk)}\n\n`);

                if (data.done) {
                  reply.raw.write('data: [DONE]\n\n');
                }
              } catch {
                // Skip unparseable chunks
              }
            }
          }

          reply.raw.end();
        } else {
          // Non-streaming response
          const response = await fetch(ollamaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ollamaPayload),
          });

          if (!response.ok) {
            const error = await response.text();
            return reply
              .status(response.status)
              .send(
                createOpenAiError(`Ollama error: ${error}`, 'upstream_error', 'upstream_error'),
              );
          }

          const data = (await response.json()) as {
            message?: { role: string; content: string };
            total_duration?: number;
            prompt_eval_count?: number;
            eval_count?: number;
          };

          const completion = {
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [
              {
                index: 0,
                message: {
                  role: data.message?.role ?? 'assistant',
                  content: data.message?.content ?? '',
                },
                finish_reason: 'stop',
              },
            ],
            usage: {
              prompt_tokens: data.prompt_eval_count ?? 0,
              completion_tokens: data.eval_count ?? 0,
              total_tokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
            },
          };

          return reply.send(completion);
        }
      } catch (error) {
        app.log.error(error, 'Chat completion error');
        return reply
          .status(502)
          .send(
            createOpenAiError(
              'Failed to connect to Ollama. Make sure the model is running.',
              'upstream_error',
              'upstream_error',
            ),
          );
      }
    },
  );
}
