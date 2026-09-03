import { NextResponse } from 'next/server';
import { createCustomer, loginCustomer, getCustomerDetails } from '@/lib/shopify';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Rate limit registration attempts (max 5 per minute per IP)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';
    const limitRes = await rateLimit(ip, 5, 60, 'register');
    if (!limitRes.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Validate inputs
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields (First Name, Last Name, Email, and Password) are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // 1. Call Shopify customerCreate mutation
    const createResult = await createCustomer({
      firstName,
      lastName,
      email,
      password,
    });

    if ('errors' in createResult) {
      const errorMessage = createResult.errors.join(', ');
      return NextResponse.json(
        { error: errorMessage || 'Failed to create account.' },
        { status: 400 }
      );
    }

    // 2. Automatically log the newly registered user in
    const authResult = await loginCustomer({ email, password });

    if ('errors' in authResult) {
      // Account created, but login mutation failed for some reason
      return NextResponse.json({
        success: true,
        autoLoginFailed: true,
        message: 'Account created successfully! Please log in manually.'
      });
    }

    const accessToken = authResult.accessToken;
    if (!accessToken) {
      return NextResponse.json({
        success: true,
        autoLoginFailed: true,
        message: 'Account created successfully! Please log in manually.'
      });
    }

    // 3. Fetch detailed profile info to get the user ID
    const customer = await getCustomerDetails(accessToken);
    if (!customer || !customer.id) {
      return NextResponse.json({
        success: true,
        autoLoginFailed: true,
        message: 'Account created successfully! Please log in manually.'
      });
    }

    // Return email and success status so the client page can login via NextAuth automatically
    return NextResponse.json({ success: true, email: customer.email || email });
  } catch (err: unknown) {
    console.error('Registration handler error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during account creation.' },
      { status: 500 }
    );
  }
}
