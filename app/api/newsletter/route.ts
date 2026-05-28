import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email;

    if (!email || typeof email !== 'string' || !email.includes('@') || email.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const redis = getRedisClient();

    if (redis) {
      // Persist in Upstash Redis Set
      await redis.sadd('newsletter:subscribers', trimmedEmail);
      // Save metadata hash
      await redis.hset(`newsletter:subscriber:${trimmedEmail}`, {
        subscribedAt: new Date().toISOString(),
        status: 'active',
        source: 'blog_storefront'
      });
      console.log(`[Newsletter] Subscribed and persisted in Redis: ${trimmedEmail}`);
    } else {
      console.log(`[Newsletter] Redis client not active. Subscribed fallback logging: ${trimmedEmail}`);
    }

    // Extensible Webhook dispatch hook (e.g. for n8n, Resend, or Shopify Flows)
    const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            source: 'naaz_storefront_blog',
            subscribedAt: new Date().toISOString()
          })
        }).catch(err => console.error('[Newsletter Webhook Error] Failed dispatch:', err));
      } catch (err) {
        console.error('[Newsletter Webhook Error] Dispatch attempt failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'JazakAllah Khair! Your subscription has been successfully registered.'
    });
  } catch (error) {
    console.error('[Newsletter Error] Subscription processing failed:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while processing your subscription. Please try again.' },
      { status: 500 }
    );
  }
}
