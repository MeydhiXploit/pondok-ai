import { buildApp } from './app.js';
import { validateGatewayEnvironment } from './environment.js';

const PORT = parseInt(process.env.PORT ?? '8000', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

async function main(): Promise<void> {
  validateGatewayEnvironment(process.env);

  const app = await buildApp();
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`API Gateway listening on http://${HOST}:${PORT}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Unable to start API Gateway');
  process.exit(1);
});
