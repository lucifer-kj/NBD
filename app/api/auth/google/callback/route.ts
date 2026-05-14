import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getCustomerByEmail, createCustomerViaAdmin } from '@/lib/shopify/admin';
import { loginCustomer } from '@/lib/shopify';
import { createSession } from '@/lib/session';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', request.url));
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Missing Google OAuth environment variables');
    return NextResponse.redirect(new URL('/?error=server_configuration', request.url));
  }

  try {
    // 1. Exchange code for Google tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Google token error:', tokenData);
      return NextResponse.redirect(new URL('/?error=google_auth_failed', request.url));
    }

    // 2. Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileResponse.json();

    if (!profileData.email) {
      return NextResponse.redirect(new URL('/?error=google_email_missing', request.url));
    }

    const { email, given_name, family_name } = profileData;

    // 3. Check if customer exists in Shopify using Admin API
    let customer = await getCustomerByEmail(email);

    let customerAccessToken = null;

    if (!customer) {
      // 4a. Create customer if not exists
      // Generate a long random password so we can log them in via Storefront API to get an access token
      const generatedPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + "A1!";
      
      try {
        customer = await createCustomerViaAdmin({
          email,
          firstName: given_name || '',
          lastName: family_name || '',
          password: generatedPassword
        });

        // Login to get Storefront Token
        const loginResult = await loginCustomer({ email, password: generatedPassword });
        if ('accessToken' in loginResult) {
          customerAccessToken = loginResult.accessToken;
        }
      } catch (err) {
        console.error('Error creating Shopify customer:', err);
        return NextResponse.redirect(new URL('/?error=shopify_account_creation_failed', request.url));
      }
    } else {
      // 4b. Customer exists. Since we don't know their password, we cannot easily use Storefront API's customerAccessTokenCreate
      // Instead, we can use the Multipass API if on Shopify Plus, OR use a session-only approach for headless
      // For this implementation, since we issue our own session, we will just proceed without a Storefront token if we can't get one.
      // Alternatively, the Storefront API doesn't allow generating tokens without password.
      // So if a storefront token is absolutely required for cart/checkout, we might face limitations.
      // We will proceed by creating our JWT session using the customer ID from Admin API.
    }

    // 5. Create secure session
    // If we couldn't get a storefront token, we still create a session so the user is "logged in" to our Next.js app.
    // They might be prompted to log in normally for certain storefront actions, or we can use Admin API to proxy actions.
    const customerId = customer.id;
    await createSession(customerId, customerAccessToken || '');

    // Redirect to account dashboard
    return NextResponse.redirect(new URL('/account', request.url));
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_internal_error', request.url));
  }
}
