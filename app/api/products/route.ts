import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getProductsByIds } from '@/lib/shopify';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsString = searchParams.get('ids');
    
    if (!idsString) {
      return NextResponse.json({ products: [] });
    }

    const ids = idsString.split(',');
    const products = await getProductsByIds(ids);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Fetch products by IDs error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
