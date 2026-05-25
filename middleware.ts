import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { decryptSession } from '@/lib/session-edge';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get('session')?.value;

  // Check authentication status
  let isAuthenticated = false;
  if (sessionCookie) {
    const payload = await decryptSession(sessionCookie);
    if (payload) {
      isAuthenticated = true;
    }
  } else {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET,
        secureCookie: process.env.NODE_ENV === 'production',
      });
      if (token) {
        isAuthenticated = true;
      }
    } catch {
      // Invalid token is not authenticated.
    }
  }

  // Prepare standard response
  const response = NextResponse.next();

  // Security: Content Security Policy & Security Headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.shopify.com https://vitals.vercel-insights.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://cdn.shopify.com https://*.shopifycdn.com https://v.fastly.net https://www.google-analytics.com https://www.googletagmanager.com https://google-analytics.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.shopify.com https://*.google-analytics.com https://vitals.vercel-insights.com https://account.naazbook.in https://3xbr00-f7.myshopify.com;
    frame-src 'self' https://www.googletagmanager.com https://*.shopify.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://*.shopify.com https://account.naazbook.in;
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  const protectedRoutes = ['/account', '/wishlist'];
  const requiresAuth = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (requiresAuth && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set('Content-Security-Policy', cspHeader);
    redirectResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
