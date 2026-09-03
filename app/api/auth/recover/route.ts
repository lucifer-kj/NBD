import { NextResponse } from 'next/server';
import { recoverCustomerPassword } from '@/lib/shopify';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Rate limit password recovery attempts (max 5 per minute per IP)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';
    const limitRes = await rateLimit(ip, 5, 60, 'recover');
    if (!limitRes.success) {
      return NextResponse.json(
        { error: 'Too many recovery requests. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

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
