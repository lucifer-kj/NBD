import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

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

    const computedHash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest();

    const actualHmac = Buffer.from(hmacHeader, 'base64');

    if (computedHash.length !== actualHmac.length || !crypto.timingSafeEqual(computedHash, actualHmac)) {
      console.warn('Invalid HMAC verification attempt');
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Schedule revalidation to run in the background after the response is sent.
    // This ensures we respond to Shopify within the strict 5-second timeout.
    after(async () => {
      try {
        if (topic.startsWith('products/')) {
          const productId = body.id;
          const handle = body.handle;
          let productHandle = handle;

          // Attempt to map product ID to handle in Redis (crucial for products/delete events)
          try {
            const redis = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
              ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
              : Redis.fromEnv();

            if (topic === 'products/delete') {
              const storedHandle = await redis.get<string>(`product:id_to_handle:${productId}`);
              if (storedHandle) {
                productHandle = storedHandle;
                await redis.del(`product:id_to_handle:${productId}`);
              }
            } else if (productId && handle) {
              // Store/update the mapping with 30 days TTL
              await redis.set(`product:id_to_handle:${productId}`, handle, { ex: 2592000 });
            }
          } catch (redisError) {
            console.error('Redis mapping failed in revalidation webhook:', redisError);
          }

          // Trigger Next.js revalidation
          revalidateTag('products');
          revalidatePath('/');
          revalidatePath('/products');
          if (productHandle) {
            revalidateTag(`product-${productHandle}`);
            revalidatePath(`/products/${productHandle}`);
            console.log(`Revalidated product: ${productHandle} and associated listing pages`);
          }
        }

        if (topic.startsWith('collections/')) {
          revalidateTag('collections');
          revalidatePath('/collections');
          console.log('Revalidated collections tag and listing page');
        }
        
        if (topic.startsWith('articles/')) {
          revalidateTag('articles');
          revalidatePath('/blog');
          console.log('Revalidated articles tag and blog page');
        }
      } catch (revalErr) {
        console.error('Background revalidation task failed:', revalErr);
      }
    });

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
