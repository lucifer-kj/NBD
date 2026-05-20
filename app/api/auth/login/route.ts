import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRedisClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';


// WHY no `import { cookies } from 'next/headers'` here?
// Because we must NEVER use cookies() from next/headers in a route
// that returns NextResponse.redirect(). They are separate response objects.
// Cookies set via cookieStore.set() are LOST — the browser never sees them.
// All cookies must be set via response.cookies.set() on the redirect object.

export async function GET(request: Request) {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: 'Missing SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID' }, { status: 500 });
  }

  // --- Determine base URL ---
  // In production: use NEXT_PUBLIC_AUTH_BASE_URL (deterministic, must match Shopify Partner Dashboard)
  // In local dev: build from the host header dynamically
  const isProduction = process.env.NODE_ENV === 'production';
  let baseUrl: string;

  if (isProduction) {
    const configured = process.env.NEXT_PUBLIC_AUTH_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!configured) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_AUTH_BASE_URL env var in production' }, { status: 500 });
    }
    baseUrl = configured.replace(/\/$/, ''); // strip trailing slash
  } else {
    const host = request.headers.get('host') || 'localhost:3000';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    baseUrl = `${isLocal ? 'http' : 'https'}://${host}`;
  }

  // This MUST match what's registered in Shopify Partner Dashboard → Callback URLs
  const redirectUri = `${baseUrl}/api/auth/callback`;

  // --- Generate cryptographically secure OAuth parameters ---
  const state = crypto.randomBytes(16).toString('hex');       // CSRF protection token
  const nonce = crypto.randomBytes(16).toString('hex');       // Replay attack protection
  const codeVerifier = crypto.randomBytes(32).toString('base64url'); // PKCE verifier

  // PKCE code_challenge = BASE64URL(SHA256(codeVerifier))
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // --- Resolve Shopify Authorization URL ---
  const accountUrl = (process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL || '').replace(/\/$/, '');
  if (!accountUrl) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL' }, { status: 500 });
  }

  const isCustomDomain = !accountUrl.includes('shopify.com');
  const authorizationUrl = new URL(
    isCustomDomain
      ? `${accountUrl}/authentication/oauth/authorize`
      : `${accountUrl}/auth/oauth/authorize`
  );
  authorizationUrl.searchParams.set('client_id', clientId);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('redirect_uri', redirectUri);
  authorizationUrl.searchParams.set('scope', 'openid email customer-account-api:full');
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('nonce', nonce);
  authorizationUrl.searchParams.set('code_challenge', codeChallenge);
  authorizationUrl.searchParams.set('code_challenge_method', 'S256');

  // --- Store PKCE state in Redis (primary) ---
  // We store codeVerifier and nonce in Redis keyed by state.
  // The callback will look up this key using the state from the URL query param.
  // Redis TTL is 10 minutes — more than enough for an OAuth round trip.
  const redis = getRedisClient();
  let storedInRedis = false;

  if (redis) {
    try {
      await redis.set(
        `oauth:${state}`,
        JSON.stringify({ codeVerifier, nonce }),
        { ex: 600 } // 600 seconds = 10 minutes
      );
      storedInRedis = true;
    } catch (redisError) {
      console.error('Redis OAuth state save failed, falling back to cookies:', redisError);
    }
  }

  // CRITICAL FIX: Build the redirect response FIRST, then attach cookies to IT.
  // Do NOT use `const cookieStore = await cookies()` here — those cookies
  // will NOT be included in the redirect response and will never reach the browser.
  const response = NextResponse.redirect(authorizationUrl.toString());

  // Prevent browser and Vercel/edge caching of this dynamic redirect response
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('x-middleware-cache', 'no-cache');

  // Determine cookie domain dynamically to support wildcard domain cookie sharing in production
  const host = request.headers.get('host') || 'www.naazbook.in';
  const domain = getOAuthCookieDomain(host);

  // Cookie options — shared for all OAuth cookies
  const cookieOptions = {
    httpOnly: true,                  // JS cannot read this (XSS protection)
    secure: isProduction,            // HTTPS only in prod
    path: '/',                       // Available to all routes
    maxAge: 600,                     // 10 minutes — matches Redis TTL
    sameSite: 'lax' as const,        // Required: allows cross-site redirect delivery
    domain,                          // Wildcard domain sharing to support www and non-www
  };

  // ALWAYS set oauth_state cookie — this is the lookup key for Redis
  // The callback compares URL ?state param against this cookie for CSRF protection
  response.cookies.set('oauth_state', state, cookieOptions);

  // Only store codeVerifier and nonce in cookies if Redis is unavailable
  // If Redis stored them, we don't need them in cookies (Redis is the source of truth)
  if (!storedInRedis) {
    response.cookies.set('oauth_nonce', nonce, cookieOptions);
    response.cookies.set('oauth_code_verifier', codeVerifier, cookieOptions);
  }

  return response;
}

// Helper to determine the cookie domain for OAuth cookies dynamically.
// Avoids setting domain prefix on localhost and public suffixes like vercel.app.
function getOAuthCookieDomain(host: string): string | undefined {
  const domainOnly = host.split(':')[0].toLowerCase();

  if (
    domainOnly.includes('localhost') ||
    domainOnly.includes('127.0.0.1') ||
    domainOnly.endsWith('.vercel.app') ||
    !domainOnly.includes('.')
  ) {
    return undefined;
  }

  if (domainOnly.endsWith('naazbook.in')) {
    return '.naazbook.in';
  }

  const parts = domainOnly.split('.');
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`;
  }

  return undefined;
}

