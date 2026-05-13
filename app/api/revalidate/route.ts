import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const topic = req.headers.get('x-shopify-topic') || '';
    
    if (!hmacHeader) {
      console.error('Missing x-shopify-hmac-sha256 header');
      return NextResponse.json({ error: 'Missing HMAC header' }, { status: 401 });
    }

    // Read the body as raw text for HMAC verification
    const rawBody = await req.text();
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('SHOPIFY_WEBHOOK_SECRET is not defined');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const hash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    if (hash !== hmacHeader) {
      console.warn('Invalid HMAC verification attempt');
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Revalidate specific tags based on what changed
    // We prioritize responding within 5 seconds as per Shopify requirements
    
    if (topic.startsWith('products/')) {
      const handle = body.handle;
      revalidateTag('products');
      revalidatePath('/');
      revalidatePath('/products');
      if (handle) {
        revalidateTag(`product-${handle}`);
        revalidatePath(`/products/${handle}`);
        console.log(`Revalidated product: ${handle} and associated listing pages`);
      }
    }

    if (topic.startsWith('collections/')) {
      revalidateTag('collections');
      console.log('Revalidated collections tag');
    }
    
    if (topic.startsWith('articles/')) {
      revalidateTag('articles');
      console.log('Revalidated articles tag');
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

// Optional: Allow GET for manual testing during development (requires secret)
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  const tag = req.nextUrl.searchParams.get('tag');
  if (tag) {
    revalidateTag(tag);
    return NextResponse.json({ revalidated: true, tag });
  }
  
  return NextResponse.json({ error: 'Missing tag' }, { status: 400 });
}
