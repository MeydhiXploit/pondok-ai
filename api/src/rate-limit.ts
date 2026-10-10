import { createHash } from 'node:crypto';

export const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 120;
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

function parsePositiveInteger(value: string | number | undefined, fallback: number): number {
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Derives the rate-limit bucket key for a request.
 *
 * The source IP is always the primary component so that each network client
 * gets its own quota.  When an Authorization header is present its hash is
 * appended so that different credentials sharing the same source IP get
 * separate quotas.  X-Forwarded-For is intentionally not consulted
 * (Fastify's trustProxy is disabled by default).
 */
export function rateLimitKey(ip: string, authorization: string | undefined): string {
  if (authorization) {
    const hash = createHash('sha256').update(authorization).digest('hex').slice(0, 16);
    return `${ip}:${hash}`;
  }
  return ip;
}

/**
 * Reads gateway rate-limit settings while retaining safe defaults for missing
 * or invalid environment values.
 */
export function getRateLimitConfig(
  env: NodeJS.ProcessEnv,
  overrides: Partial<RateLimitConfig> = {},
): RateLimitConfig {
  return {
    maxRequests: parsePositiveInteger(
      overrides.maxRequests ?? env.RATE_LIMIT_MAX_REQUESTS,
      DEFAULT_RATE_LIMIT_MAX_REQUESTS,
    ),
    windowMs: parsePositiveInteger(
      overrides.windowMs ?? env.RATE_LIMIT_WINDOW_MS,
      DEFAULT_RATE_LIMIT_WINDOW_MS,
    ),
  };
}

/**
 * Small in-memory fixed-window limiter. It is deliberately process-local and
 * only intended to protect the single gateway container.
 */
export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>();
  private nextCleanupAt = 0;

  constructor(
    private readonly config: RateLimitConfig,
    private readonly now: () => number = Date.now,
  ) {}

  consume(clientId: string): RateLimitDecision {
    const now = this.now();
    this.removeExpiredBuckets(now);

    const existing = this.buckets.get(clientId);
    if (!existing || now >= existing.resetAt) {
      this.buckets.set(clientId, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (existing.count >= this.config.maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1_000)),
      };
    }

    existing.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  private removeExpiredBuckets(now: number): void {
    if (now < this.nextCleanupAt) {
      return;
    }

    for (const [clientId, bucket] of this.buckets) {
      if (now >= bucket.resetAt) {
        this.buckets.delete(clientId);
      }
    }

    this.nextCleanupAt = now + this.config.windowMs;
  }
}
