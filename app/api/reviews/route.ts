import { NextRequest, NextResponse } from 'next/server';

const JUDGE_ME_API_TOKEN = process.env.JUDGE_ME_API_TOKEN;
const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://judge.me/api/v1/reviews?api_token=${JUDGE_ME_API_TOKEN}&shop_domain=${SHOP_DOMAIN}&external_id=${productId}`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error('Judge.me API error');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ reviews: [] }, { status: 200 }); // Graceful degradation
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Proxy request to Judge.me
    const response = await fetch('https://judge.me/api/v1/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_token: JUDGE_ME_API_TOKEN,
        shop_domain: SHOP_DOMAIN,
        ...body
      })
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
