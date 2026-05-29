import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let isAuthenticated = false;

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });
    isAuthenticated = !!token;
  } catch {
    // Leave unauthenticated
  }

  // Get the base URL dynamically
  const host = request.headers.get('host') || 'www.naazbook.in';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const protocol = isLocal ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  if (isAuthenticated) {
    return NextResponse.redirect(new URL('/account', baseUrl));
  } else {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }
}
