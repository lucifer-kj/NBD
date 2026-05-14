import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getCustomerByEmail, createCustomerViaAdmin } from '@/lib/shopify/admin';
import { loginCustomer, updateCartBuyerIdentity } from '@/lib/shopify';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { credential, cartId } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: 'Credential is required' }, { status: 400 });
    }

    // 1. Verify Google token via Google API
    // Using simple tokeninfo for validation. In production, consider google-auth-library
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const googleData = await googleRes.json();

    if (!googleRes.ok || googleData.error) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const { email, given_name, family_name, sub: googleId } = googleData;

    // 2. Check if customer exists in Shopify
    let customer = await getCustomerByEmail(email);
    let accessToken = '';

    if (!customer) {
      // Create a new customer if they don't exist
      const generatedPassword = Math.random().toString(36).slice(-8) + googleId.slice(-4) + "A1!";
      
      try {
        customer = await createCustomerViaAdmin({
          email,
          firstName: given_name || '',
          lastName: family_name || '',
          password: generatedPassword
        });

        // Log them in to get an access token for Storefront API
        const loginResult = await loginCustomer({ email, password: generatedPassword });
        if ('accessToken' in loginResult) {
          accessToken = loginResult.accessToken;
        }
      } catch (err) {
        console.error('Error creating customer:', err);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
      }
    }

    // 3. Create Session (Custom Session Handler)
    // This allows existing users to "log in" without Multipass or password
    if (customer) {
      await createSession(customer.id, accessToken, email);
      
      // 4. Link cart if provided
      if (cartId) {
        if (accessToken) {
          try {
            await updateCartBuyerIdentity(cartId, accessToken, email);
          } catch (e) {
            console.error('Cart linking via Storefront failed:', e);
          }
        }
        
        // Always persist cart ID to customer metafield via Admin API
        try {
          const { setCustomerCart } = await import('@/lib/shopify/admin');
          await setCustomerCart(customer.id, cartId);
        } catch (e) {
          console.error('Failed to persist cart ID to customer metafield:', e);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        email,
        firstName: given_name,
        lastName: family_name
      }
    });
  } catch (error) {
    console.error('Google One Tap Login Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
