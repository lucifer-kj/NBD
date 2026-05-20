import { NextResponse } from 'next/server';
import { deleteSession, getSession } from '@/lib/session';
import { logoutCustomer } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const accessToken = session?.accessToken;

    // 1. If we have an active Shopify customer access token, invalidate it
    if (accessToken) {
      try {
        await logoutCustomer(accessToken);
      } catch (logoutError) {
        console.error('Failed to invalidate Shopify access token during logout:', logoutError);
      }
    }

    // 2. Clear our secure local session cookie (which also clears it from subdomains)
    await deleteSession();

    // 3. Perform a clean redirect to home or login page
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl.toString());
    
    // Prevent caching of this logout redirect
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (err: unknown) {
    console.error('Logout handler error:', err);
    // Fallback: delete sessions and redirect anyway
    await deleteSession();
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
