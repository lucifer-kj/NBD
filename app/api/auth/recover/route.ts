import { NextResponse } from 'next/server';
import { recoverCustomerPassword } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    // Call Shopify recoverCustomerPassword mutation
    const result = await recoverCustomerPassword(email);

    if (result.errors && result.errors.length > 0) {
      const errorMessage = result.errors.join(', ');
      return NextResponse.json(
        { error: errorMessage || 'Failed to trigger password recovery.' },
        { status: 400 }
      );
    }

    // Return success. (Even if email wasn't found, standard security practices suggest returning success)
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Password recovery error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while requesting password reset.' },
      { status: 500 }
    );
  }
}
