import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../api/src/app.js';

const API_SECRET_KEY = 'test-api-secret';

let app: Awaited<ReturnType<typeof buildApp>> | undefined;

async function createGateway(): Promise<Awaited<ReturnType<typeof buildApp>>> {
  app = await buildApp({
    apiSecretKey: API_SECRET_KEY,
    logger: false,
    ollamaBaseUrl: 'http://ollama.test',
  });
  return app;
}

function authorizedHeaders(): Record<string, string> {
  return {
    authorization: `Bearer ${API_SECRET_KEY}`,
    host: 'localhost:8000',
  };
}

function expectOpenAiError(payload: unknown): void {
  expect(payload).toMatchObject({
    error: {
      message: expect.any(String),
      type: expect.any(String),
      code: expect.any(String),
    },
  });
}

afterEach(async () => {
  await app?.close();
  app = undefined;
  vi.unstubAllGlobals();
});

describe('gateway error responses', () => {
  it('uses the OpenAI error shape for upstream failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    const gateway = await createGateway();

    const response = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: authorizedHeaders(),
    });

    expect(response.statusCode).toBe(502);
    expectOpenAiError(response.json());
    expect(response.json().error.code).toBe('upstream_error');
  });

  it('uses the OpenAI error shape for validation failures', async () => {
    const gateway = await createGateway();

    const response = await gateway.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      headers: authorizedHeaders(),
      payload: { model: 'test-model' },
    });

    expect(response.statusCode).toBe(400);
    expectOpenAiError(response.json());
  });

  it('uses the OpenAI error shape for unknown endpoints', async () => {
    const gateway = await createGateway();

    const response = await gateway.inject({
      method: 'GET',
      url: '/missing-endpoint',
      headers: { host: 'localhost:8000' },
    });

    expect(response.statusCode).toBe(404);
    expectOpenAiError(response.json());
    expect(response.json().error.code).toBe('not_found');
  });
});
