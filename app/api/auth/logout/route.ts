import { NextResponse } from 'next/server';
import { logoutCustomer } from '@/lib/shopify';
import { cookies } from 'next/headers';
import { deleteSession, decryptSession } from '@/lib/session';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    const legacyToken = cookieStore.get('customerAccessToken')?.value;

    let accessToken = legacyToken;

    if (sessionCookie) {
      const payload = await decryptSession(sessionCookie);
      if (payload?.accessToken) {
        accessToken = payload.accessToken as string;
      }
    }

    if (accessToken) {
      // Invalidate the token on Shopify's side
      await logoutCustomer(accessToken);
    }

    // Delete the local session cookie
    await deleteSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
