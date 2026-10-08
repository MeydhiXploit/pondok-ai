import Fastify from 'fastify';
import cors from '@fastify/cors';
import { chatCompletionsRoute } from './routes/chat.js';
import { modelsRoute } from './routes/models.js';
import { healthRoute } from './routes/health.js';
import { statusRoute } from './routes/status.js';
import { embeddingsRoute } from './routes/embeddings.js';

const PORT = parseInt(process.env.PORT ?? '8000', 10);
const HOST = process.env.HOST ?? '0.0.0.0';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://ollama:11434';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  requestTimeout: 120000, // 2 minutes for LLM responses
  bodyLimit: 10 * 1024 * 1024, // 10MB
});

// Register plugins
await app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

// Decorate with config
app.decorate('config', {
  ollamaBaseUrl: OLLAMA_BASE_URL,
  qdrantUrl: process.env.QDRANT_URL ?? '',
  apiSecretKey: process.env.API_SECRET_KEY ?? '',
});

// Register routes
app.register(healthRoute);
app.register(statusRoute);
app.register(modelsRoute);
app.register(chatCompletionsRoute);
app.register(embeddingsRoute);

// Global error handler
app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);

  const statusCode = error.statusCode ?? 500;

  reply.status(statusCode).send({
    error: {
      message: error.message,
      type: statusCode >= 500 ? 'internal_server_error' : 'invalid_request_error',
      code: error.code ?? null,
    },
  });
});

// Start server
try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`API Gateway listening on http://${HOST}:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

// Type augmentation
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      ollamaBaseUrl: string;
      qdrantUrl: string;
      apiSecretKey: string;
    };
  }
}
