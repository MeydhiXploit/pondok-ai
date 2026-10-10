import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../api/src/app.js';

const API_SECRET_KEY = 'test-api-secret';
const originalCorsOrigins = process.env.CORS_ORIGINS;

let app: Awaited<ReturnType<typeof buildApp>> | undefined;

async function createGateway(corsOrigins?: string): Promise<Awaited<ReturnType<typeof buildApp>>> {
  app = await buildApp({
    apiSecretKey: API_SECRET_KEY,
    corsOrigins,
    logger: false,
    ollamaBaseUrl: 'http://ollama.test',
  });
  return app;
}

function mockOllama(response: Response): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(response.clone()));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(async () => {
  await app?.close();
  app = undefined;
  vi.unstubAllGlobals();
  if (originalCorsOrigins === undefined) {
    delete process.env.CORS_ORIGINS;
  } else {
    process.env.CORS_ORIGINS = originalCorsOrigins;
  }
});

describe('API gateway security', () => {
  it('rejects a /v1 request without an API key', async () => {
    const gateway = await createGateway();

    const response = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: { host: 'localhost:8000' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: { code: 'invalid_api_key', type: 'authentication_error' },
    });
  });

  it('rejects a /v1 request with an incorrect API key', async () => {
    const gateway = await createGateway();

    const response = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: {
        authorization: 'Bearer incorrect-key',
        host: 'localhost:8000',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: { code: 'invalid_api_key', type: 'authentication_error' },
    });
  });

  it('allows a /v1 request with the configured API key', async () => {
    const fetchMock = mockOllama(
      new Response(JSON.stringify({ models: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const gateway = await createGateway();

    const response = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: {
        authorization: `Bearer ${API_SECRET_KEY}`,
        host: 'api:8000',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://ollama.test/api/tags',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('keeps /health available without an API key', async () => {
    mockOllama(new Response('', { status: 200 }));
    const gateway = await createGateway();

    const response = await gateway.inject({
      method: 'GET',
      url: '/health',
      headers: { host: '127.0.0.1:8000' },
    });

    expect(response.statusCode).toBe(200);
  });

  it('rejects an untrusted Host header', async () => {
    const gateway = await createGateway();

    const response = await gateway.inject({
      method: 'GET',
      url: '/health',
      headers: { host: 'untrusted.example' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: 'invalid_host', type: 'invalid_request_error' },
    });
  });

  it('emits CORS headers only for explicitly allowed origins', async () => {
    mockOllama(
      new Response(JSON.stringify({ models: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    let gateway = await createGateway();

    const disabledResponse = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: {
        authorization: `Bearer ${API_SECRET_KEY}`,
        host: 'localhost:8000',
        origin: 'https://client.example',
      },
    });

    expect(disabledResponse.headers['access-control-allow-origin']).toBeUndefined();

    await gateway.close();
    app = undefined;
    gateway = await createGateway('https://client.example');

    const allowedResponse = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: {
        authorization: `Bearer ${API_SECRET_KEY}`,
        host: 'localhost:8000',
        origin: 'https://client.example',
      },
    });

    expect(allowedResponse.statusCode).toBe(200);
    expect(allowedResponse.headers['access-control-allow-origin']).toBe('https://client.example');

    const disallowedResponse = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: {
        authorization: `Bearer ${API_SECRET_KEY}`,
        host: 'localhost:8000',
        origin: 'https://other.example',
      },
    });

    expect(disallowedResponse.statusCode).toBe(200);
    expect(disallowedResponse.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('reads the CORS allowlist from the gateway environment', async () => {
    process.env.CORS_ORIGINS = 'https://env-client.example';
    mockOllama(
      new Response(JSON.stringify({ models: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const gateway = await createGateway();

    const response = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: {
        authorization: `Bearer ${API_SECRET_KEY}`,
        host: 'localhost:8000',
        origin: 'https://env-client.example',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('https://env-client.example');
  });

  it('allows an allowlisted CORS preflight without an API key', async () => {
    const gateway = await createGateway('https://client.example');

    const response = await gateway.inject({
      method: 'OPTIONS',
      url: '/v1/models',
      headers: {
        host: 'localhost:8000',
        origin: 'https://client.example',
        'access-control-request-method': 'GET',
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('https://client.example');
  });
});
