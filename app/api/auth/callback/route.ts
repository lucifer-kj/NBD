import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('oauth_state')?.value;
  const codeVerifier = cookieStore.get('oauth_code_verifier')?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.json({ error: 'Invalid state or missing code' }, { status: 400 });
  }

  if (!codeVerifier) {
    return NextResponse.json({ error: 'Missing code verifier' }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET;
  
  // Resolve host dynamically to match the exact domain used to initiate OAuth
  const host = request.headers.get('host') || 'www.naazbook.in';
  
  // Enforce HTTPS protocol in production to prevent redirect URI mismatches behind reverse proxies.
  // We only use HTTP on localhost.
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const protocol = isLocal ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback`;
  
  let accountUrl = process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL || 'https://account.naazbook.in';
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

  // Under client_secret_basic, credentials are passed in the Authorization header.
  // DO NOT include client_secret in the body parameters.
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  // Base64 encode client credentials for HTTP Basic auth scheme
  const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': baseUrl
      },
      body,
    });

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse Shopify token response as JSON:', responseText);
      return NextResponse.json({ 
        error: 'Shopify returned non-JSON response', 
        status: res.status,
        details: responseText.slice(0, 500) 
      }, { status: res.status === 200 ? 502 : res.status });
    }

    // Clean up temporary OAuth cookies on response (both success and error)
    cookieStore.delete('oauth_state');
    cookieStore.delete('oauth_nonce');
    cookieStore.delete('oauth_code_verifier');

    if (!res.ok) {
      console.error('Shopify Token exchange error:', data);
      return NextResponse.json({ error: 'Failed to exchange token', details: data }, { status: res.status });
    }

    const { access_token, id_token } = data;

    let email = null;
    let customerId = '';
    
    if (id_token) {
      const parts = id_token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        email = typeof payload.email === 'string' ? payload.email : null;
        
        // Coerce customerId explicitly to a string to prevent TypeError: startsWith is not a function
        customerId = typeof payload.sub === 'string' ? payload.sub : (payload.sub ? String(payload.sub) : '');
        
        if (customerId && typeof customerId === 'string' && customerId.startsWith('urn:shopify:customer:')) {
          const numericId = customerId.split(':').pop();
          customerId = `gid://shopify/Customer/${numericId}`;
        } else if (customerId && typeof customerId === 'string' && !customerId.startsWith('gid://')) {
          customerId = `gid://shopify/Customer/${customerId}`;
        }
      }
    }

    await createSession(customerId, access_token, email || undefined, id_token);
    
    return NextResponse.redirect(new URL('/account', request.url));
  } catch (error) {
    // Clean up temporary OAuth cookies on catastrophic errors
    cookieStore.delete('oauth_state');
    cookieStore.delete('oauth_nonce');
    cookieStore.delete('oauth_code_verifier');

    console.error('Auth callback server-side error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error during token exchange',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
