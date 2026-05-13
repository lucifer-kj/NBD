import { NextRequest, NextResponse } from 'next/server';
import { createCustomer, loginCustomer, updateCartBuyerIdentity } from '@/lib/shopify';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, cartId } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 1. Create the customer in Shopify
    const createResponse = await createCustomer({
      firstName,
      lastName,
      email,
      password,
      acceptsMarketing: true
    });

    if ('errors' in createResponse) {
      const error = createResponse.errors[0];
      return NextResponse.json(
        { error: error || 'Failed to create account' },
        { status: 400 }
      );
    }

    // 2. Automatically log them in after registration
    const loginResponse = await loginCustomer({ email, password });

    if ('errors' in loginResponse) {
      // If login fails after creation, we still created the account
      return NextResponse.json({ 
        success: true, 
        message: 'Account created, please log in manually.' 
      });
    }

    const { accessToken, expiresAt } = loginResponse;

    // 3. Set secure HTTP-only cookie
    (await cookies()).set('customerAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiresAt)
    });

    // 4. Link cart if present
    if (cartId) {
      try {
        await updateCartBuyerIdentity(cartId, accessToken, email);
      } catch (e) {
        console.error('Failed to link cart identity after registration:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
