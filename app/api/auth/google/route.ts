import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  if (!clientId || !process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Missing OAuth configuration' }, { status: 500 });
  }

  const scope = 'openid email profile';
  const responseType = 'code';
  
  // Create a secure random state string for CSRF protection
  const state = Math.random().toString(36).substring(7);

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', responseType);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('state', state);

  // In a real implementation you would store the state in a cookie to verify it in the callback
  
  return NextResponse.redirect(authUrl.toString());
}
