import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decryptSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get('session')?.value;
  const legacyToken = request.cookies.get('customerAccessToken')?.value;
  
  // Check authentication status
  let isAuthenticated = false;
  if (sessionCookie) {
    const payload = await decryptSession(sessionCookie);
    if (payload) {
      isAuthenticated = true;
    }
  } else if (legacyToken) {
    isAuthenticated = true;
  }

  // Security: Basic Bot Protection
  const userAgent = request.headers.get('user-agent') || '';
  if (/bot|spider|crawler|curl|wget/i.test(userAgent) && !/google|bing|yandex|duckduckgo|whatsapp/i.test(userAgent)) {
     // Optional: track aggressive custom bots
  }

  // Prepare standard response
  const response = NextResponse.next();

  // Security: Content Security Policy & Security Headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://vitals.vercel-insights.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://cdn.shopify.com https://v.fastly.net;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://*.shopify.com;
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Handle Protected Routes (/account)
  if (pathname.startsWith('/account')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('login', 'true');
      const redirectResponse = NextResponse.redirect(url);
      // Re-apply security headers to redirect response
      redirectResponse.headers.set('Content-Security-Policy', cspHeader);
      redirectResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
