import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getCustomerDetails } from '@/lib/shopify';
import { getCustomerDetailsById } from '@/lib/shopify/admin';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const { customerId, accessToken } = session as { customerId: string; accessToken?: string };

    let customer = null;

    if (accessToken) {
      // Try fetching via Storefront API first if we have a token
      customer = await getCustomerDetails(accessToken);
    }

    // If Storefront API failed or no token, use Admin API (Custom Session fallback)
    if (!customer && customerId) {
      customer = await getCustomerDetailsById(customerId);
    }

    if (!customer) {
      return NextResponse.json({ user: null });
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
