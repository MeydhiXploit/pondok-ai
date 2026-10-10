import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../api/src/app.js';
import {
  DEFAULT_RATE_LIMIT_MAX_REQUESTS,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  FixedWindowRateLimiter,
  getRateLimitConfig,
  rateLimitKey,
} from '../../api/src/rate-limit.js';

const API_SECRET_KEY = 'test-api-secret';

let app: Awaited<ReturnType<typeof buildApp>> | undefined;

async function createGateway(
  options: {
    corsOrigins?: string;
    rateLimitMaxRequests?: number;
    rateLimitWindowMs?: number;
  } = {},
): Promise<Awaited<ReturnType<typeof buildApp>>> {
  app = await buildApp({
    apiSecretKey: API_SECRET_KEY,
    logger: false,
    ollamaBaseUrl: 'http://ollama.test',
    ...options,
  });
  return app;
}

function authorizedHeaders(): Record<string, string> {
  return {
    authorization: `Bearer ${API_SECRET_KEY}`,
    host: 'localhost:8000',
  };
}

function mockOllama(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ models: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ),
  );
}

afterEach(async () => {
  await app?.close();
  app = undefined;
  vi.unstubAllGlobals();
});

describe('gateway rate limit configuration', () => {
  it('uses safe defaults for absent or invalid environment values', () => {
    expect(getRateLimitConfig({})).toEqual({
      maxRequests: DEFAULT_RATE_LIMIT_MAX_REQUESTS,
      windowMs: DEFAULT_RATE_LIMIT_WINDOW_MS,
    });
    expect(
      getRateLimitConfig({
        RATE_LIMIT_MAX_REQUESTS: '0',
        RATE_LIMIT_WINDOW_MS: 'not-a-number',
      }),
    ).toEqual({
      maxRequests: DEFAULT_RATE_LIMIT_MAX_REQUESTS,
      windowMs: DEFAULT_RATE_LIMIT_WINDOW_MS,
    });
  });

  it('accepts positive configuration overrides', () => {
    expect(
      getRateLimitConfig(
        {
          RATE_LIMIT_MAX_REQUESTS: '10',
          RATE_LIMIT_WINDOW_MS: '5000',
        },
        { maxRequests: 2 },
      ),
    ).toEqual({ maxRequests: 2, windowMs: 5000 });
  });
});

describe('rateLimitKey derivation', () => {
  it('uses IP when no Authorization header is present', () => {
    expect(rateLimitKey('10.0.0.1', undefined)).toBe('10.0.0.1');
  });

  it('combines IP and hashed Authorization when present', () => {
    const key = rateLimitKey('10.0.0.1', 'Bearer secret-token');
    expect(key).toMatch(/^10\.0\.0\.1:[0-9a-f]{16}$/);
  });

  it('produces different keys for different credentials on the same IP', () => {
    const a = rateLimitKey('10.0.0.1', 'Bearer key-a');
    const b = rateLimitKey('10.0.0.1', 'Bearer key-b');
    expect(a).not.toBe(b);
  });

  it('produces different keys for the same credentials on different IPs', () => {
    const a = rateLimitKey('10.0.0.1', 'Bearer same');
    const b = rateLimitKey('10.0.0.2', 'Bearer same');
    expect(a).not.toBe(b);
  });
});

describe('in-memory gateway rate limiting', () => {
  it('resets a client quota when its fixed window expires', () => {
    let now = 0;
    const limiter = new FixedWindowRateLimiter({ maxRequests: 1, windowMs: 1_000 }, () => now);

    expect(limiter.consume('127.0.0.1').allowed).toBe(true);
    expect(limiter.consume('127.0.0.1').allowed).toBe(false);

    now += 1_000;
    expect(limiter.consume('127.0.0.1').allowed).toBe(true);
  });

  it('limits authenticated /v1 requests per client', async () => {
    mockOllama();
    const gateway = await createGateway({
      rateLimitMaxRequests: 2,
      rateLimitWindowMs: 60_000,
    });

    const request = () =>
      gateway.inject({
        method: 'GET',
        url: '/v1/models',
        headers: authorizedHeaders(),
        remoteAddress: '198.51.100.10',
      });

    expect((await request()).statusCode).toBe(200);
    expect((await request()).statusCode).toBe(200);

    const limited = await request();
    expect(limited.statusCode).toBe(429);
    expect(limited.headers['retry-after']).toMatch(/^[1-9]\d*$/);
    expect(limited.json()).toMatchObject({
      error: {
        type: 'rate_limit_error',
        code: 'rate_limit_exceeded',
      },
    });

    const otherClient = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: authorizedHeaders(),
      remoteAddress: '198.51.100.11',
    });
    expect(otherClient.statusCode).toBe(200);
  });

  it('does not count health checks or CORS preflight requests', async () => {
    mockOllama();
    const gateway = await createGateway({
      corsOrigins: 'https://client.example',
      rateLimitMaxRequests: 1,
      rateLimitWindowMs: 60_000,
    });
    const remoteAddress = '203.0.113.10';

    const health = await gateway.inject({
      method: 'GET',
      url: '/health',
      headers: { host: 'localhost:8000' },
      remoteAddress,
    });
    expect(health.statusCode).toBe(200);

    const preflight = await gateway.inject({
      method: 'OPTIONS',
      url: '/v1/models',
      headers: {
        host: 'localhost:8000',
        origin: 'https://client.example',
        'access-control-request-method': 'GET',
      },
      remoteAddress,
    });
    expect(preflight.statusCode).toBe(204);

    const firstApiRequest = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: authorizedHeaders(),
      remoteAddress,
    });
    expect(firstApiRequest.statusCode).toBe(200);

    const limitedApiRequest = await gateway.inject({
      method: 'GET',
      url: '/v1/models',
      headers: authorizedHeaders(),
      remoteAddress,
    });
    expect(limitedApiRequest.statusCode).toBe(429);
  });
});
