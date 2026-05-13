import { NextRequest, NextResponse } from 'next/server';
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
      (await cookies()).delete('customerAccessToken');
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
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
