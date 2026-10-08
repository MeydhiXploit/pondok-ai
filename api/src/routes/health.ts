import { FastifyInstance } from 'fastify';

export async function healthRoute(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    const checks: Record<string, { status: string; message?: string }> = {
      api: { status: 'healthy' },
    };

    // Check Ollama
    try {
      const response = await fetch(`${app.config.ollamaBaseUrl}/`, { signal: AbortSignal.timeout(5000) });
      checks.ollama = {
        status: response.ok ? 'healthy' : 'unhealthy',
        message: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error) {
      checks.ollama = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }

    // Check Qdrant if configured
    if (app.config.qdrantUrl) {
      try {
        const response = await fetch(`${app.config.qdrantUrl}/healthz`, { signal: AbortSignal.timeout(5000) });
        checks.qdrant = {
          status: response.ok ? 'healthy' : 'unhealthy',
          message: response.ok ? undefined : `HTTP ${response.status}`,
        };
      } catch (error) {
        checks.qdrant = {
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Connection failed',
        };
      }
    }

    const allHealthy = Object.values(checks).every((c) => c.status === 'healthy');

    return reply.status(allHealthy ? 200 : 503).send({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    });
  });
}
