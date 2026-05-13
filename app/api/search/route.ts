import { NextRequest, NextResponse } from 'next/server';
import { predictiveSearch } from '@/lib/shopify';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ products: [], collections: [], articles: [] });
  }

  try {
    const results = await predictiveSearch(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Predictive search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
