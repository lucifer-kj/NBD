import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('oauth_state')?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.json({ error: 'Invalid state or missing code' }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/callback`;
  let accountUrl = process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL || 'https://shopify.com/70963200109';
  if (accountUrl.includes('shopify.com/3xbr00-f7')) {
    accountUrl = accountUrl.replace('shopify.com/3xbr00-f7', 'shopify.com/70963200109');
  }

  let tokenUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
  if (tokenUrl && tokenUrl.includes('shopify.com/3xbr00-f7')) {
    tokenUrl = tokenUrl.replace('shopify.com/3xbr00-f7', 'shopify.com/70963200109');
  }

  if (!tokenUrl) {
    const isCustomDomain = !accountUrl.includes('shopify.com');
    tokenUrl = isCustomDomain 
      ? `${accountUrl}/authentication/oauth/token` 
      : `${accountUrl}/auth/oauth/token`;
  }
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64') },
      body,
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Token exchange error:', data);
      return NextResponse.json({ error: 'Failed to exchange token', details: data }, { status: res.status });
    }

    const { access_token, id_token } = data;

    // Decode id_token to get email or customer ID if available, though usually you query the customer account API
    let email = null;
    let customerId = '';
    
    if (id_token) {
      const parts = id_token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        email = payload.email || null;
        customerId = payload.sub || '';
        
        // Ensure customerId is a valid Admin GraphQL GID
        if (customerId && customerId.startsWith('urn:shopify:customer:')) {
          const numericId = customerId.split(':').pop();
          customerId = `gid://shopify/Customer/${numericId}`;
        } else if (customerId && !customerId.startsWith('gid://')) {
          // Fallback if it's just a numeric ID
          customerId = `gid://shopify/Customer/${customerId}`;
        }
      }
    }

    // Save session using the custom createSession which we'll update if needed
    // Store access_token in the session
    await createSession(customerId, access_token, email || undefined, id_token);
    
    // Redirect to account page
    return NextResponse.redirect(new URL('/account', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
