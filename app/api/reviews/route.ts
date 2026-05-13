import { NextRequest, NextResponse } from 'next/server';

const JUDGE_ME_API_TOKEN = process.env.JUDGE_ME_API_TOKEN;
const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const cleanShopDomain = SHOP_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    const response = await fetch(
      `https://judge.me/api/v1/reviews?api_token=${JUDGE_ME_API_TOKEN}&shop_domain=${cleanShopDomain}&per_page=100`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error('Judge.me API error');
    }

    const data = await response.json();
    
    // Filter reviews for the specific product if productId is provided
    // We compare strings to be safe with types
    const filteredReviews = data.reviews.filter((review: any) => 
      review.product_external_id?.toString() === productId.toString()
    );

    return NextResponse.json({ reviews: filteredReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ reviews: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Clean the shop domain (remove https:// and trailing slash)
    const cleanShopDomain = SHOP_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Ensure ID is a number (Judge.me requirement)
    const productId = body.external_id || body.id;
    const numericalId = productId ? parseInt(productId.toString(), 10) : null;

    // Proxy request to Judge.me
    const response = await fetch('https://judge.me/api/v1/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_token: JUDGE_ME_API_TOKEN,
        shop_domain: cleanShopDomain,
        platform: 'shopify',
        ...body,
        id: numericalId
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Judge.me POST Error:', data);
      return NextResponse.json({ 
        error: data.message || 'Judge.me API Error',
        details: data 
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
