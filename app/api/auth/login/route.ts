import { NextRequest, NextResponse } from 'next/server';
import { loginCustomer, updateCartBuyerIdentity } from '@/lib/shopify';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password, cartId } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const response = await loginCustomer({ email, password });

    if ('errors' in response) {
      return NextResponse.json(
        { error: response.errors[0]?.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const { accessToken, expiresAt } = response;

    // Set secure HTTP-only cookie
    (await cookies()).set('customerAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiresAt)
    });

    // If there's an active cart, link the buyer identity
    if (cartId) {
      try {
        await updateCartBuyerIdentity(cartId, accessToken, email);
      } catch (e) {
        console.error('Failed to link cart identity:', e);
        // We don't want to fail the login if cart linking fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
