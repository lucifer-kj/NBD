import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET(request: Request) {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  
  // Resolve host dynamically to support local dev, www, and non-www automatically
  const host = request.headers.get('host') || 'www.naazbook.in';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'Missing Client ID' }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');

  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 3600 });
  cookieStore.set('oauth_nonce', nonce, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 3600 });

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

  return NextResponse.redirect(authorizationUrl.toString());
}
