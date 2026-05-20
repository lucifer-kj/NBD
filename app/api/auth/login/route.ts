import { NextResponse } from 'next/server';
import { loginCustomer, getCustomerDetails } from '@/lib/shopify';
import { createSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET: Backward compatible redirect to the beautiful native storefront /login page
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error') || '';
  const errorMsg = searchParams.get('error_description') || '';
  
  const loginUrl = new URL('/login', request.url);
  if (error) loginUrl.searchParams.set('error', error);
  if (errorMsg) loginUrl.searchParams.set('error_description', errorMsg);

  const response = NextResponse.redirect(loginUrl.toString());
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('x-middleware-cache', 'no-cache');
  return response;
}

// POST: Storefront password authentication endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 1. Call Shopify customerAccessTokenCreate mutation
    const authResult = await loginCustomer({ email, password });

    if ('errors' in authResult) {
      const errorMessage = authResult.errors.join(', ');
      return NextResponse.json(
        { error: errorMessage || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const accessToken = authResult.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to retrieve access token.' },
        { status: 500 }
      );
    }

    // 2. Fetch customer details to get the unique Customer ID
    const customer = await getCustomerDetails(accessToken);
    if (!customer || !customer.id) {
      return NextResponse.json(
        { error: 'Could not load your profile details. Please try again.' },
        { status: 401 }
      );
    }

    // 3. Create the first-party secure session cookie shared across subdomains
    await createSession(customer.id, accessToken, customer.email || email);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Authentication handler error:', err);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
