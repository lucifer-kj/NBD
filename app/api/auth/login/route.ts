import { NextResponse } from 'next/server';
import { loginCustomer, getCustomerDetails } from '@/lib/shopify';
import { createSession } from '@/lib/session';
import { createAuthDebugContext } from '@/lib/auth-debug';

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
  const debug = createAuthDebugContext(request);
  debug.step('route_entered', 'POST /api/auth/login entered');

  try {
    const body = await request.json();
    debug.step('request_parsed', 'Request body parsed', {
      body: { ...body, password: body?.password ? '***' : undefined },
    });

    const { email, password } = body;

    if (!email || !password) {
      debug.step('validation_failed', 'Email or password missing', { emailPresent: !!email, passwordPresent: !!password });
      return debug.json(
        { error: 'Email and password are required.' },
        400
      );
    }

    debug.step('shopify_login_start', 'Calling Shopify customerAccessTokenCreate');
    const authResult = await loginCustomer({ email, password });
    debug.step('shopify_login_complete', 'Shopify login mutation completed', {
      hasErrors: 'errors' in authResult,
      errorCount: 'errors' in authResult ? authResult.errors.length : 0,
      hasAccessToken: !!('accessToken' in authResult && authResult.accessToken),
    });

    if ('errors' in authResult) {
      const errorMessage = authResult.errors.join(', ');
      debug.step('shopify_user_errors', 'Shopify returned user errors', authResult.errors);
      return debug.json(
        { error: errorMessage || 'Invalid email or password.' },
        401
      );
    }

    const accessToken = authResult.accessToken;
    if (!accessToken) {
      debug.step('access_token_missing', 'Shopify returned no access token');
      return debug.json(
        { error: 'Failed to retrieve access token.' },
        500
      );
    }

    debug.step('customer_fetch_start', 'Fetching customer details with storefront access token');
    const customer = await getCustomerDetails(accessToken);
    debug.step('customer_fetch_complete', 'Customer fetch completed', {
      customerFound: !!customer,
      customerId: customer?.id ?? null,
    });

    if (!customer || !customer.id) {
      debug.step('customer_missing', 'Customer details were not returned or missing id');
      return debug.json(
        { error: 'Could not load your profile details. Please try again.' },
        401
      );
    }

    debug.step('session_creation_start', 'Creating session cookie');
    await createSession(customer.id, accessToken, customer.email || email);
    debug.step('session_creation_complete', 'Session cookie created successfully');

    return debug.json({ success: true });
  } catch (err: unknown) {
    debug.error('handler_error', err);
    console.error('Authentication handler error:', err);
    return debug.json(
      { error: 'An unexpected authentication error occurred.' },
      500
    );
  }
}
