import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import { getRedisClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';


// WHY no `import { cookies } from 'next/headers'` here?
// In a GET route handler, reading cookies from `await cookies()` (next/headers)
// can be unreliable. Reading directly from request.cookies is the correct,
// safe approach in a route handler — it reads from the actual incoming HTTP headers.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // This is what Shopify sends back in the URL

  // Read the state cookie directly from the incoming request headers
  // This is the value we set in login/route.ts via response.cookies.set()
  const storedState = request.cookies.get('oauth_state')?.value;

  // --- CSRF State Validation ---
  // If storedState is undefined here, it means the cookie set in login/route.ts
  // never reached the browser. The most common cause is using cookieStore.set()
  // from next/headers on a route that returns NextResponse.redirect() —
  // those are different response objects. Always use response.cookies.set().
  if (!code || !state || state !== storedState) {
    const errorDetails = {
      error: 'Invalid state or missing code',
      debug: {
        hasCode: !!code,
        hasState: !!state,
        hasStoredState: !!storedState,
        stateFromUrl: state || null,
        storedStateFromCookie: storedState || null,
        stateMatch: state === storedState,
        cookiesReceived: request.cookies.getAll().map(c => c.name),
        host: request.headers.get('host'),
        xForwardedHost: request.headers.get('x-forwarded-host'),
        xForwardedProto: request.headers.get('x-forwarded-proto'),
      }
    };
    console.error('OAuth callback validation failed:', JSON.stringify(errorDetails));

    const res = NextResponse.json(errorDetails, { status: 400 });
    clearOAuthCookies(res);
    return res;
  }

  // --- Retrieve codeVerifier and nonce ---
  // Primary: look up in Redis using the state as the key
  // Fallback: read from request cookies (used when Redis is unavailable)
  let codeVerifier: string | undefined;
  let nonce: string | undefined;
  let retrievedFromRedis = false;

  const redis = getRedisClient();

  if (redis) {
    try {
      const stored = await redis.get<string | Record<string, string>>(`oauth:${state}`);

      if (stored) {
        // Atomic delete — if a second request comes in (Vercel double-invoke),
        // redis.del() will return 0 and stored will be null, failing gracefully.
        await redis.del(`oauth:${state}`);

        // Upstash Redis may auto-parse JSON depending on client version.
        // Handle both: already-parsed object, or raw JSON string.
        const data = typeof stored === 'string' ? JSON.parse(stored) : stored;

        if (data && typeof data.codeVerifier === 'string') {
          codeVerifier = data.codeVerifier;
          nonce = data.nonce;
          retrievedFromRedis = true;
        }
      }
    } catch (redisError) {
      console.error('Redis OAuth lookup failed, trying cookie fallback:', redisError);
    }
  }

  // Cookie fallback — only used if Redis was unavailable during login
  if (!codeVerifier) {
    codeVerifier = request.cookies.get('oauth_code_verifier')?.value;
    nonce = request.cookies.get('oauth_nonce')?.value;
  }

  if (!codeVerifier) {
    console.error(JSON.stringify({
      event: 'oauth_code_verifier_missing',
      retrievedFromRedis,
      hasRedisCient: !!redis,
    }));
    const res = NextResponse.json({ error: 'Missing code verifier — Redis may be down and cookie fallback also failed' }, { status: 400 });
    clearOAuthCookies(res);
    return res;
  }

  // --- Build redirect URI (must match login/route.ts exactly) ---
  const isProduction = process.env.NODE_ENV === 'production';
  let baseUrl: string;

  if (isProduction) {
    const configured = process.env.NEXT_PUBLIC_AUTH_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!configured) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_AUTH_BASE_URL' }, { status: 500 });
    }
    baseUrl = configured.replace(/\/$/, '');
  } else {
    const host = request.headers.get('host') || 'localhost:3000';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    baseUrl = `${isLocal ? 'http' : 'https'}://${host}`;
  }

  // CRITICAL: This must be byte-for-byte identical to the redirectUri in login/route.ts
  // AND must match what's registered in Shopify Partner Dashboard
  const redirectUri = `${baseUrl}/api/auth/callback`;

  // --- Resolve token URL ---
  const accountUrl = (process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL || '').replace(/\/$/, '');
  const tokenUrlFromEnv = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL?.replace(/\/$/, '');

  let tokenUrl: string;
  if (tokenUrlFromEnv) {
    tokenUrl = tokenUrlFromEnv;
  } else if (accountUrl) {
    const isCustomDomain = !accountUrl.includes('shopify.com');
    tokenUrl = isCustomDomain
      ? `${accountUrl}/authentication/oauth/token`
      : `${accountUrl}/auth/oauth/token`;
  } else {
    return NextResponse.json({ error: 'Cannot resolve Shopify token URL — check env vars' }, { status: 500 });
  }

  // --- Validate credentials ---
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing Shopify credentials' }, { status: 500 });
  }

  // --- Build token exchange request body ---
  // client_secret goes in Authorization header (HTTP Basic), NOT in the body.
  // Putting it in the body causes Shopify to reject the request.
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,   // Must match exactly what was sent in /authorize
    code,                        // The authorization code from Shopify
    code_verifier: codeVerifier, // The original PKCE verifier (not the hashed challenge)
  });

  const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
        'Origin': baseUrl,
      },
      body,
    });

    const responseText = await res.text();
    let data: Record<string, unknown>;

    try {
      data = JSON.parse(responseText);
    } catch {
      // Shopify returned something that's not JSON — very unusual, log it
      console.error(JSON.stringify({
        event: 'oauth_token_response_not_json',
        status: res.status,
        preview: responseText.slice(0, 400),
        redirectUri,
        tokenUrl,
      }));
      const errRes = NextResponse.json({ error: 'Shopify returned non-JSON response' }, { status: 502 });
      clearOAuthCookies(errRes);
      return errRes;
    }

    if (!res.ok) {
      // Log everything needed to diagnose the failure
      console.error(JSON.stringify({
        event: 'oauth_token_exchange_failed',
        status: res.status,
        shopify_error: data?.error,
        shopify_error_description: data?.error_description,
        redirectUri,       // Compare this against Shopify Partner Dashboard registration
        tokenUrl,
        retrievedFromRedis,
        host: request.headers.get('host'),
        xForwardedHost: request.headers.get('x-forwarded-host'),
        xForwardedProto: request.headers.get('x-forwarded-proto'),
      }));
      const errRes = NextResponse.json({ error: 'Token exchange failed', details: data }, { status: res.status });
      clearOAuthCookies(errRes);
      return errRes;
    }

    // --- Extract tokens from Shopify response ---
    const { access_token, id_token } = data as { access_token: string; id_token?: string };

    let email: string | null = null;
    let customerId = '';

    if (id_token) {
      try {
        // JWT is three base64url parts: header.payload.signature
        const parts = id_token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString('utf-8')
          );

          email = typeof payload.email === 'string' ? payload.email : null;

          // Nonce verification — guards against token replay injection
          if (nonce && payload.nonce && payload.nonce !== nonce) {
            console.warn(JSON.stringify({
              event: 'oauth_nonce_mismatch',
              expected: nonce,
              received: payload.nonce,
            }));
            // Do not fail hard on nonce mismatch for now — just warn
            // Change to a hard fail if you want strict OIDC compliance
          }

          // Normalize the customer ID into a Shopify GID format
          const rawSub = typeof payload.sub === 'string' ? payload.sub : String(payload.sub ?? '');

          if (rawSub.startsWith('urn:shopify:customer:')) {
            // Format: urn:shopify:customer:{storeId}:{customerId}
            const numericId = rawSub.split(':').pop();
            customerId = `gid://shopify/Customer/${numericId}`;
          } else if (rawSub && !rawSub.startsWith('gid://')) {
            customerId = `gid://shopify/Customer/${rawSub}`;
          } else {
            customerId = rawSub;
          }
        }
      } catch (jwtError) {
        console.error('Failed to parse id_token JWT payload:', jwtError);
      }
    }

    // --- Create the session ---
    // This sets a signed, httpOnly session cookie via lib/session.ts
    await createSession(customerId, access_token, email ?? undefined, id_token);

    // Redirect to account page on success, and clear the OAuth cookies
    const successRes = NextResponse.redirect(new URL('/account', baseUrl));
    clearOAuthCookies(successRes);
    return successRes;

  } catch (error) {
    console.error(JSON.stringify({
      event: 'oauth_callback_exception',
      message: error instanceof Error ? error.message : String(error),
    }));
    const errRes = NextResponse.json({
      error: 'Internal server error during token exchange',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
    clearOAuthCookies(errRes);
    return errRes;
  }
}

/**
 * Clear all temporary OAuth cookies from a response.
 * Call this on EVERY response path — success, failure, and exceptions.
 * Leaving stale OAuth cookies causes state confusion on retry attempts.
 */
function clearOAuthCookies(response: NextResponse): void {
  const clearOptions = { path: '/', maxAge: 0, httpOnly: true, secure: true };
  response.cookies.set('oauth_state', '', clearOptions);
  response.cookies.set('oauth_nonce', '', clearOptions);
  response.cookies.set('oauth_code_verifier', '', clearOptions);
}
