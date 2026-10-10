import { createOpenAiError, OpenAiErrorResponse } from './errors.js';

interface CloseAwareRequest {
  raw: {
    aborted: boolean;
    once(event: 'close', listener: () => void): unknown;
    removeListener(event: 'close', listener: () => void): unknown;
  };
}

interface CloseAwareReply {
  raw: {
    destroyed: boolean;
    writableEnded: boolean;
    once(event: 'close', listener: () => void): unknown;
    removeListener(event: 'close', listener: () => void): unknown;
  };
}

export const DEFAULT_OLLAMA_REQUEST_TIMEOUT_MS = 120_000;

export interface UpstreamRequestContext {
  signal: AbortSignal;
  didClientDisconnect(): boolean;
  didTimeout(): boolean;
  cleanup(): void;
}

export interface UpstreamFailure {
  statusCode: number;
  body: OpenAiErrorResponse;
}

/**
 * Combines a bounded upstream request with the client connection lifecycle.
 */
export function createUpstreamRequestContext(
  request: CloseAwareRequest,
  reply: CloseAwareReply,
  timeoutMs: number,
): UpstreamRequestContext {
  const clientAbortController = new AbortController();
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  const abortForClientDisconnect = (): void => {
    if (!clientAbortController.signal.aborted) {
      clientAbortController.abort();
    }
  };

  const onRequestClose = (): void => {
    if (request.raw.aborted) {
      abortForClientDisconnect();
    }
  };

  const onResponseClose = (): void => {
    if (!reply.raw.writableEnded) {
      abortForClientDisconnect();
    }
  };

  request.raw.once('close', onRequestClose);
  reply.raw.once('close', onResponseClose);

  if (request.raw.aborted || reply.raw.destroyed) {
    abortForClientDisconnect();
  }

  return {
    signal: AbortSignal.any([clientAbortController.signal, timeoutSignal]),
    didClientDisconnect: () => clientAbortController.signal.aborted,
    didTimeout: () => timeoutSignal.aborted,
    cleanup: () => {
      request.raw.removeListener('close', onRequestClose);
      reply.raw.removeListener('close', onResponseClose);
    },
  };
}

export function createUpstreamFailure(
  context: UpstreamRequestContext,
  fallbackMessage: string,
): UpstreamFailure {
  if (context.didTimeout()) {
    return {
      statusCode: 504,
      body: createOpenAiError('Ollama request timed out', 'upstream_error', 'upstream_timeout'),
    };
  }

  return {
    statusCode: 502,
    body: createOpenAiError(fallbackMessage, 'upstream_error', 'upstream_error'),
  };
}
