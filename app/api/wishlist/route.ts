import { NextRequest, NextResponse } from 'next/server';
import { setMetafieldsMutation } from '@/lib/shopify/mutations';

const ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;

export async function POST(req: NextRequest) {
  try {
    const { customerId, variantIds } = await req.json();

    if (!customerId || !variantIds) {
      return NextResponse.json({ error: 'Customer ID and variant IDs are required' }, { status: 400 });
    }

    const response = await fetch(`https://${SHOP_DOMAIN}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_API_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
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
      }),
    });

    const data = await response.json();
    
    if (data.data?.metafieldsSet?.userErrors?.length > 0) {
        return NextResponse.json({ error: data.data.metafieldsSet.userErrors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: true, metafields: data.data?.metafieldsSet?.metafields });
  } catch (error) {
    console.error('Wishlist update error:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
