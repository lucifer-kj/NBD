import { NextRequest, NextResponse } from 'next/server';
import { setMetafieldsMutation } from '@/lib/shopify/mutations';
import { shopifyAdminFetch } from '@/lib/shopify/admin';

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

export async function POST(req: NextRequest) {
  try {
    const { customerId, variantIds } = await req.json();

    if (!customerId || !variantIds) {
      return NextResponse.json({ error: 'Customer ID and variant IDs are required' }, { status: 400 });
    }

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
    console.error('Wishlist update error:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
