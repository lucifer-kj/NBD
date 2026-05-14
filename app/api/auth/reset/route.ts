import { NextResponse } from 'next/server';
import { resetCustomerPassword } from '@/lib/shopify';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { resetUrl, password } = await request.json();

    if (!resetUrl || !password) {
      return NextResponse.json(
        { success: false, error: 'Reset URL and password are required' },
        { status: 400 }
      );
    }

    const { customer, customerAccessToken, errors } = await resetCustomerPassword(resetUrl, password);

    if (errors && errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors[0] },
        { status: 400 }
      );
    }

    if (customer && customerAccessToken) {
      await createSession(customer.id, customerAccessToken.accessToken);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
