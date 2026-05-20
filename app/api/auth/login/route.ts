import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getRedisClient } from '@/lib/redis';
import { getCookieDomain } from '@/lib/session';

export async function GET(request: Request) {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  
  // Resolve host dynamically to support local dev, www, and non-www automatically
  const host = request.headers.get('host') || 'www.naazbook.in';
  
  // Enforce HTTPS protocol in production to prevent redirect URI mismatches behind reverse proxies.
  // We only use HTTP on localhost.
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const protocol = isLocal ? 'http' : 'https';
  
  // Priority 2: Deterministic Redirect URI via Environment Variable if set
  const redirectUri = process.env.NEXT_PUBLIC_AUTH_BASE_URL
    ? `${process.env.NEXT_PUBLIC_AUTH_BASE_URL}/api/auth/callback`
    : `${protocol}://${host}/api/auth/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'Missing Client ID' }, { status: 500 });
  }

  // Generate cryptographically secure OAuth parameters
  const state = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Generate PKCE code_verifier (high-entropy cryptographic random string, Base64URL-encoded)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  
  // Generate SHA-256 base64url-encoded code_challenge
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = await getCookieDomain();
  
  // Priority 1: Store OAuth State/Verifier/Nonce in Redis if available
  const redis = getRedisClient();
  let storedInRedis = false;
  
  if (redis) {
    try {
      // Key format: oauth:state, expires in 10 minutes (600s)
      await redis.set(`oauth:${state}`, JSON.stringify({ codeVerifier, nonce }), { ex: 600 });
      storedInRedis = true;
    } catch (redisError) {
      console.error('Redis OAuth save failure, falling back to cookies:', redisError);
    }
  }

  // Always set oauth_state in cookie so callback can look up state (dynamic domain)
  cookieStore.set('oauth_state', state, { 
    httpOnly: true, 
    secure: isProduction, 
    path: '/', 
    maxAge: 3600,
    sameSite: 'lax',
    domain
  });

  // If we couldn't store it in Redis, fallback to traditional secure cookie storage
  if (!storedInRedis) {
    cookieStore.set('oauth_nonce', nonce, { 
      httpOnly: true, 
      secure: isProduction, 
      path: '/', 
      maxAge: 3600,
      sameSite: 'lax',
      domain
    });
    cookieStore.set('oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: isProduction,
      path: '/',
      maxAge: 3600,
      sameSite: 'lax',
      domain
    });
  }

  let accountUrl = process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL || 'https://shopify.com/70963200109';
  if (accountUrl.includes('shopify.com/3xbr00-f7')) {
    accountUrl = accountUrl.replace('shopify.com/3xbr00-f7', 'shopify.com/70963200109');
  }

  const isCustomDomain = !accountUrl.includes('shopify.com');
  const authorizationUrl = new URL(
    isCustomDomain 
      ? `${accountUrl}/authentication/oauth/authorize` 
      : `${accountUrl}/auth/oauth/authorize`
  );
  authorizationUrl.searchParams.append('client_id', clientId);
  authorizationUrl.searchParams.append('response_type', 'code');
  authorizationUrl.searchParams.append('redirect_uri', redirectUri);
  authorizationUrl.searchParams.append('scope', 'openid email customer-account-api:full');
  authorizationUrl.searchParams.append('state', state);
  authorizationUrl.searchParams.append('nonce', nonce);
  
  // Append PKCE parameters
  authorizationUrl.searchParams.append('code_challenge', codeChallenge);
  authorizationUrl.searchParams.append('code_challenge_method', 'S256');

  return NextResponse.redirect(authorizationUrl.toString());
}
