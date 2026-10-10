import { EventEmitter } from 'node:events';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../api/src/app.js';
import { createUpstreamRequestContext } from '../../api/src/upstream.js';

const API_SECRET_KEY = 'test-api-secret';

let app: Awaited<ReturnType<typeof buildApp>> | undefined;

function authorizedHeaders(): Record<string, string> {
  return {
    authorization: `Bearer ${API_SECRET_KEY}`,
    host: 'localhost:8000',
  };
}

afterEach(async () => {
  await app?.close();
  app = undefined;
  vi.unstubAllGlobals();
});

describe('gateway upstream resilience', () => {
  function mockFetchUntilAborted(): void {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), {
            once: true,
          });
        });
      }),
    );
  }

  async function createGatewayWithShortUpstreamTimeout(): Promise<void> {
    app = await buildApp({
      apiSecretKey: API_SECRET_KEY,
      logger: false,
      ollamaBaseUrl: 'http://ollama.test',
      ollamaRequestTimeoutMs: 1,
    });
  }

  it('returns a formatted timeout error when Ollama does not respond', async () => {
    mockFetchUntilAborted();
    await createGatewayWithShortUpstreamTimeout();

    const response = await app.inject({
      method: 'GET',
      url: '/v1/models',
      headers: authorizedHeaders(),
    });

    expect(response.statusCode).toBe(504);
    expect(response.json()).toMatchObject({
      error: { type: 'upstream_error', code: 'upstream_timeout' },
    });
  });

  it('times out chat completions while waiting for Ollama', async () => {
    mockFetchUntilAborted();
    await createGatewayWithShortUpstreamTimeout();

    const response = await app?.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      headers: authorizedHeaders(),
      payload: {
        model: 'test-model',
        messages: [{ role: 'user', content: 'hello' }],
      },
    });

    expect(response?.statusCode).toBe(504);
    expect(response?.json()).toMatchObject({
      error: { type: 'upstream_error', code: 'upstream_timeout' },
    });
  });

  it('times out embeddings while waiting for Ollama', async () => {
    mockFetchUntilAborted();
    await createGatewayWithShortUpstreamTimeout();

    const response = await app?.inject({
      method: 'POST',
      url: '/v1/embeddings',
      headers: authorizedHeaders(),
      payload: { model: 'test-model', input: 'hello' },
    });

    expect(response?.statusCode).toBe(504);
    expect(response?.json()).toMatchObject({
      error: { type: 'upstream_error', code: 'upstream_timeout' },
    });
  });

  it('aborts an upstream signal when an SSE response connection closes', () => {
    const requestRaw = Object.assign(new EventEmitter(), { aborted: false });
    const responseRaw = Object.assign(new EventEmitter(), {
      destroyed: false,
      writableEnded: false,
    });
    const context = createUpstreamRequestContext({ raw: requestRaw }, { raw: responseRaw }, 10_000);

    responseRaw.emit('close');

    expect(context.signal.aborted).toBe(true);
    expect(context.didClientDisconnect()).toBe(true);
    expect(context.didTimeout()).toBe(false);
    context.cleanup();
    expect(requestRaw.listenerCount('close')).toBe(0);
    expect(responseRaw.listenerCount('close')).toBe(0);
  });

  it('aborts immediately when the response is already destroyed', () => {
    const requestRaw = Object.assign(new EventEmitter(), { aborted: false });
    const responseRaw = Object.assign(new EventEmitter(), {
      destroyed: true,
      writableEnded: false,
    });
    const context = createUpstreamRequestContext({ raw: requestRaw }, { raw: responseRaw }, 10_000);

    expect(context.signal.aborted).toBe(true);
    expect(context.didClientDisconnect()).toBe(true);
    context.cleanup();
  });
});
