import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export type AuthDebugStep = {
  timestamp: string;
  step: string;
  message: string;
  details?: unknown;
};

export class AuthDebugContext {
  readonly id: string;
  readonly enabled: boolean;
  readonly steps: AuthDebugStep[] = [];

  constructor(request: Request) {
    this.id = `auth-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    this.enabled =
      process.env.AUTH_DEBUG === 'true' ||
      request.headers.get('x-auth-debug') === '1' ||
      new URL(request.url).searchParams.has('debug');

    if (this.enabled) {
      this.step('debug_enabled', 'Auth debug tracing enabled', {
        url: request.url,
        method: request.method,
      });
    }
  }

  step(step: string, message: string, details?: unknown) {
    if (!this.enabled) return;
    const item: AuthDebugStep = {
      timestamp: new Date().toISOString(),
      step,
      message,
    };
    if (details !== undefined) {
      item.details = details;
    }
    this.steps.push(item);
    console.info(`[AUTH DEBUG ${this.id}] ${step}: ${message}`, details);
  }

  error(step: string, error: unknown) {
    if (!this.enabled) return;
    const message = error instanceof Error ? error.message : String(error);
    this.step(step, message, {
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    });
  }

  json<T extends Record<string, unknown>>(
    payload: T,
    status = 200,
    headers?: HeadersInit
  ) {
    if (!this.enabled) {
      return NextResponse.json(payload, { status, headers });
    }

    const debugPayload = {
      ...payload,
      debug: {
        traceId: this.id,
        enabled: true,
        steps: this.steps,
      },
    };

    return NextResponse.json(debugPayload, {
      status,
      headers: {
        ...headers,
        'x-auth-debug-id': this.id,
      },
    });
  }
}

export function createAuthDebugContext(request: Request) {
  return new AuthDebugContext(request);
}

// Lightweight debug context usable outside of an HTTP Request (e.g., NextAuth callbacks)
export function createDebug(name?: string) {
  const id = `${name ?? 'auth'}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const steps: any[] = [];

  function step(stepName: string, message: string, details?: unknown) {
    const payload = { timestamp: new Date().toISOString(), step: stepName, message, details };
    steps.push(payload);
    console.info(`[AUTH DEBUG ${id}] ${stepName}: ${message}`, details);
  }

  function error(stepName: string, err: unknown) {
    const errObj = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;
    const payload = { timestamp: new Date().toISOString(), step: stepName, error: errObj };
    steps.push(payload);
    console.error(`[AUTH DEBUG ERROR ${id}] ${stepName}`, errObj);
  }

  async function commit(identifier?: string) {
    try {
      const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
      const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
      if (!redisUrl || !redisToken) return;

      const redis = new Redis({ url: redisUrl, token: redisToken });
      const logKey = 'auth:diagnostics:logs';
      const logEntry = {
        traceId: id,
        name: name || 'auth',
        identifier: identifier || 'unknown',
        timestamp: new Date().toISOString(),
        steps
      };

      await redis.lpush(logKey, JSON.stringify(logEntry));
      await redis.ltrim(logKey, 0, 49); // Keep last 50 entries
    } catch (e) {
      console.error('Failed to commit auth trace to Redis:', e);
    }
  }

  return { id, step, error, commit };
}
