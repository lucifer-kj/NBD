import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getCustomerDetails } from '@/lib/shopify';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('customerAccessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    const customer = await getCustomerDetails(accessToken);

    if (!customer) {
      // Token might be expired or invalid
      const response = NextResponse.json(
        { user: null },
        { status: 200 }
      );
      response.cookies.delete('customerAccessToken');
      return response;
    }

    return NextResponse.json({ user: customer });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
