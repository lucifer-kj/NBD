import { NextResponse } from 'next/server';
import { createCustomer, loginCustomer, getCustomerDetails } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
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
