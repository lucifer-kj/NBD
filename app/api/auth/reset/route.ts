import { NextResponse } from 'next/server';
import { resetCustomerPassword } from '@/lib/shopify';
import { createSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resetUrl, password } = body;

    if (!resetUrl || !password) {
      return NextResponse.json(
        { error: 'Reset URL and new password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Call Shopify resetCustomerPassword mutation
    const result = await resetCustomerPassword(resetUrl, password);

    if (result.errors && result.errors.length > 0) {
      const errorMessage = result.errors.join(', ');
      return NextResponse.json(
        { error: errorMessage || 'Failed to reset password.' },
        { status: 400 }
      );
    }

    // If reset succeeded, Shopify returns the customer and their new access token
    const { customer, customerAccessToken } = result;

    if (customer && customer.id && customerAccessToken?.accessToken) {
      // Auto-login the user since the reset was successful!
      await createSession(
        customer.id, 
        customerAccessToken.accessToken, 
        customer.email || ''
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ 
      success: true,
      autoLoginFailed: true,
      message: 'Password reset successfully! Please log in with your new password.'
    });
  } catch (err: unknown) {
    console.error('Password reset handler error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
