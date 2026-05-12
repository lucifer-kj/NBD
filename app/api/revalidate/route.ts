import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // 1. Check the secret to ensure the request is authorized
  const secret = req.nextUrl.searchParams.get('secret');
  
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // 2. Identify the Shopify topic (e.g., 'products/update')
  const topic = req.headers.get('x-shopify-topic') || '';

  try {
    // 3. Revalidate specific tags based on what changed
    if (topic.includes('products')) {
      revalidateTag('products');
      console.log('Revalidated products tag');
    }

    if (topic.includes('collections')) {
      revalidateTag('collections');
      console.log('Revalidated collections tag');
    }

    return NextResponse.json({ 
      success: true, 
      revalidated: true, 
      now: Date.now(),
      topic 
    });
  } catch (err) {
    console.error('Revalidation error:', err);
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}

// Optional: Allow GET for manual testing during development
export async function GET(req: NextRequest) {
  return POST(req);
}
