import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Enforce protocol (HTTPS) and canonical host (www.naazbook.in) in production
  if (process.env.NODE_ENV === 'production') {
    const host = request.headers.get('host') || '';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const canonicalBase = process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in';
    const canonicalUrlObj = new URL(canonicalBase);
    
    const isLocalhost = host.startsWith('localhost:') || host === 'localhost' || host.startsWith('127.0.0.1:') || host === '127.0.0.1';
    
    if (!isLocalhost && (host !== canonicalUrlObj.host || proto !== canonicalUrlObj.protocol.replace(':', ''))) {
      const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, canonicalBase);
      return NextResponse.redirect(targetUrl, 301);
    }
  }

  // Redirect singular /product/... to plural /products/...
  if (pathname.startsWith('/product/')) {
    const targetPathname = pathname.replace(/^\/product\//, '/products/');
    const url = request.nextUrl.clone();
    url.pathname = targetPathname;
    return NextResponse.redirect(url, 301);
  }

  // Redirect old /atar, /perfumes, /perfume, or /categories/perfumes paths to /products or /products/[slug] (301 redirects)
  const isAtarOrPerfumeExact =
    pathname === '/atar' ||
    pathname === '/perfumes' ||
    pathname === '/perfume' ||
    pathname === '/categories/perfumes' ||
    pathname === '/categories/perfume';

  if (isAtarOrPerfumeExact) {
    const url = request.nextUrl.clone();
    url.pathname = '/products';
    return NextResponse.redirect(url, 301);
  }

  let atarOrPerfumeTarget: string | null = null;
  if (pathname.startsWith('/atar/')) {
    atarOrPerfumeTarget = pathname.replace(/^\/atar\//, '/products/');
  } else if (pathname.startsWith('/perfumes/')) {
    atarOrPerfumeTarget = pathname.replace(/^\/perfumes\//, '/products/');
  } else if (pathname.startsWith('/perfume/')) {
    atarOrPerfumeTarget = pathname.replace(/^\/perfume\//, '/products/');
  } else if (pathname.startsWith('/categories/perfumes/')) {
    atarOrPerfumeTarget = pathname.replace(/^\/categories\/perfumes\//, '/products/');
  } else if (pathname.startsWith('/categories/perfume/')) {
    atarOrPerfumeTarget = pathname.replace(/^\/categories\/perfume\//, '/products/');
  }

  if (atarOrPerfumeTarget) {
    const url = request.nextUrl.clone();
    url.pathname = atarOrPerfumeTarget;
    return NextResponse.redirect(url, 301);
  }

  const protectedRoutes = ['/account', '/wishlist'];
  const requiresAuth = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  // Check authentication status using NextAuth JWE token directly (only for protected routes)
  let isAuthenticated = false;
  if (requiresAuth) {
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

  const shopifyStoreDomain = process.env.SHOPIFY_STORE_DOMAIN || '3xbr00-f7.myshopify.com';
  const shopifyHost = shopifyStoreDomain.replace(/^https?:\/\//, '');

  // Security: Content Security Policy & Security Headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://vitals.vercel-insights.com https://*.vercel-insights.com https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://ssl.google-analytics.com https://accounts.google.com https://apis.google.com https://*.google.com https://checkout.razorpay.com https://*.razorpay.com https://connect.facebook.net https://*.facebook.net https://*.facebook.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com;
    img-src 'self' blob: data: https://cdn.shopify.com https://*.shopifycdn.com https://v.fastly.net https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.googletagmanager.com https://*.googleusercontent.com https://*.google.com https://*.google.* https://*.doubleclick.net https://*.googleadservices.com https://*.razorpay.com https://www.facebook.com https://*.facebook.com https://*.facebook.net;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.shopify.com https://*.google-analytics.com https://analytics.google.com https://*.google.com https://*.google.* https://stats.g.doubleclick.net https://*.doubleclick.net https://www.googletagmanager.com https://*.googletagmanager.com https://vitals.vercel-insights.com https://*.vercel-insights.com https://account.naazbook.in https://${shopifyHost} https://accounts.google.com https://api.razorpay.com https://*.razorpay.com https://www.facebook.com https://*.facebook.com https://*.facebook.net;
    frame-src 'self' https://*.google.com https://www.google.com https://maps.google.com https://www.googletagmanager.com https://*.googletagmanager.com https://*.shopify.com https://accounts.google.com https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://*.shopify.com https://account.naazbook.in https://accounts.google.com https://api.razorpay.com https://*.razorpay.com;
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|feed.xml|9fcff651c9d445c78d6b33f383895514.txt).*)'],
};
