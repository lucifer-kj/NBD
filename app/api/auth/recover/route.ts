import { NextResponse } from 'next/server';
import { recoverCustomerPassword } from '@/lib/shopify';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const { errors } = await recoverCustomerPassword(email);

    if (errors && errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors[0] },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password recovery error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send recovery email' },
      { status: 500 }
    );
  }
}
