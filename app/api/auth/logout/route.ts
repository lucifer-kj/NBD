import { NextResponse } from 'next/server';
import { logoutCustomer } from '@/lib/shopify';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('customerAccessToken')?.value;

    if (accessToken) {
      // Invalidate the token on Shopify's side
      await logoutCustomer(accessToken);
    }

    // Delete the local cookie
    (await cookies()).delete('customerAccessToken');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
