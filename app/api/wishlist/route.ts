import { NextRequest, NextResponse } from 'next/server';
import { setMetafieldsMutation } from '@/lib/shopify/mutations';
import { shopifyAdminFetch, getCustomerDetailsById } from '@/lib/shopify/admin';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

interface WishlistMetafieldsResponse {
  data?: {
    metafieldsSet?: {
      metafields?: Array<{
        id: string;
        namespace: string;
        key: string;
        value: string;
      }>;
      userErrors?: Array<{
        field?: string[];
        message: string;
      }>;
    };
  };
}

// GET: Retrieve authenticated customer's wishlist items securely from Shopify metafields
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      // Guests or unauthenticated users always have an empty synced wishlist
      return NextResponse.json({ items: [] });
    }

    const customer = await getCustomerDetailsById(session.customerId);
    if (!customer || !customer.wishlist) {
      return NextResponse.json({ items: [] });
    }

    let items: string[] = [];
    try {
      items = JSON.parse(customer.wishlist.value || '[]');
    } catch (parseError) {
      console.error('Failed to parse customer wishlist metafield value:', parseError);
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST: Save or sync wishlist items securely for the authenticated customer
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let customerId = session.customerId;
    if (customerId && !customerId.startsWith('gid://shopify/Customer/')) {
      if (customerId.includes('@')) {
        const { getCustomerByEmail } = await import('@/lib/shopify/admin');
        const adminCustomer = await getCustomerByEmail(customerId);
        if (adminCustomer) {
          customerId = adminCustomer.id;
        }
      } else {
        customerId = `gid://shopify/Customer/${customerId}`;
      }
    }

    const body = await req.json();
    const { variantIds } = body;

    if (!variantIds || !Array.isArray(variantIds)) {
      return NextResponse.json({ error: 'Variant IDs are required and must be an array' }, { status: 400 });
    }

    // Perform secure sync using customerId directly from the server-side session cookie (prevents spoofing)
    const res = await shopifyAdminFetch<WishlistMetafieldsResponse>({
      query: setMetafieldsMutation,
      variables: {
        metafields: [
          {
            ownerId: customerId,
            namespace: 'wishlist',
            key: 'items',
            type: 'json',
            value: JSON.stringify(variantIds),
          },
        ],
      },
    });

    const data = res.body;

    const userErrors = data.data?.metafieldsSet?.userErrors;
    if (userErrors && userErrors.length > 0) {
      return NextResponse.json({ error: userErrors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: true, metafields: data.data?.metafieldsSet?.metafields });
  } catch (error) {
    console.error('Wishlist POST sync error:', error);
    return NextResponse.json({ error: 'Failed to sync wishlist' }, { status: 500 });
  }
}
