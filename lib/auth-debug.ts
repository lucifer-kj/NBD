import { NextResponse } from 'next/server';

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
