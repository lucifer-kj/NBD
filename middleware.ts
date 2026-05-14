import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decryptSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /account routes
  if (pathname.startsWith('/account')) {
    const sessionCookie = request.cookies.get('session')?.value;
    const legacyToken = request.cookies.get('customerAccessToken')?.value;
    
    // Check if we have a valid session or at least the legacy token
    let isAuthenticated = false;
    
    if (sessionCookie) {
      const payload = await decryptSession(sessionCookie);
      if (payload) {
        isAuthenticated = true;
      }
    } else if (legacyToken) {
      // Fallback for transition period if we still have the old cookie format
      isAuthenticated = true;
    }
    
    if (!isAuthenticated) {
      // Redirect to home with a login param
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('login', 'true');
      return NextResponse.redirect(url);
    }
  }
  
  // Protect /checkout if necessary (assuming it might be a custom checkout or we need to ensure cart is synced)
  // For headless Shopify, checkout usually redirects to Shopify's domain, but if we have a custom route:
  // if (pathname.startsWith('/checkout') && !isAuthenticated) { ... }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};
