import { buildApp } from './app.js';

const PORT = parseInt(process.env.PORT ?? '8000', 10);
const HOST = process.env.HOST ?? '0.0.0.0';
const app = await buildApp();

// Start server
try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`API Gateway listening on http://${HOST}:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
