import { NextRequest, NextResponse } from 'next/server';
import { decryptSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    const payload = await decryptSession(sessionCookie);
    if (payload) {
      isAuthenticated = true;
    }
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
