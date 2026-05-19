import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'Missing Client ID' }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');

  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 3600 });
  cookieStore.set('oauth_nonce', nonce, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 3600 });

  const accountUrl = process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL || 'https://shopify.com/3xbr00-f7';
  const authorizationUrl = new URL(`${accountUrl}/auth/oauth/authorize`);
  authorizationUrl.searchParams.append('client_id', clientId);
  authorizationUrl.searchParams.append('response_type', 'code');
  authorizationUrl.searchParams.append('redirect_uri', redirectUri);
  authorizationUrl.searchParams.append('scope', 'openid email https://api.shopify.com/auth/shop.storefront.id');
  authorizationUrl.searchParams.append('state', state);
  authorizationUrl.searchParams.append('nonce', nonce);

  return NextResponse.redirect(authorizationUrl.toString());
}
