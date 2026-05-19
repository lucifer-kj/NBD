import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { SHOPIFY_ADMIN_API_VERSION } from '../../../../lib/shopify/utils';

export const dynamic = 'force-dynamic';

const testQuery = `
  query {
    shop {
      name
    }
  }
`;

export async function POST(req: NextRequest) {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  try {
    // 1. Signature/Token Authorization Verification
    const authHeader = req.headers.get('Authorization');
    const secret = process.env.SHOPIFY_TOKEN_ROTATION_SECRET;

    if (!secret) {
      console.error('SHOPIFY_TOKEN_ROTATION_SECRET is not configured in the environment.');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request payload
    const { token, backupToken } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    // 3. Dry-run query validation using the new token against Shopify
    const endpoint = process.env.SHOPIFY_STORE_DOMAIN
      ? process.env.SHOPIFY_STORE_DOMAIN.includes('://')
        ? `${process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/, '')}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`
        : `https://${process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/, '')}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`
      : '';

    if (!endpoint) {
      return NextResponse.json({ error: 'SHOPIFY_STORE_DOMAIN is not defined' }, { status: 500 });
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({ query: testQuery }),
      });

      if (!response.ok) {
        const text = await response.text();
        return NextResponse.json({
          error: 'Provided token failed Shopify dry-run verification (HTTP error)',
          status: response.status,
          details: text.slice(0, 300)
        }, { status: 400 });
      }

      const body = await response.json();
      if (body.errors) {
        return NextResponse.json({
          error: 'Provided token failed Shopify dry-run verification (GraphQL error)',
          details: body.errors[0]
        }, { status: 400 });
      }

      console.info(`Token dry-run verified successfully for shop: ${body.data?.shop?.name}`);
    } catch (verifyError) {
      console.error('Failed to verify token against Shopify:', verifyError);
      return NextResponse.json({
        error: 'Failed to verify token against Shopify Admin API',
        details: verifyError instanceof Error ? verifyError.message : String(verifyError)
      }, { status: 400 });
    }

    // 4. Update keys in Upstash Redis
    await redis.set('shopify:admin_access_token', token);
    
    if (backupToken) {
      await redis.set('shopify:admin_access_token:backup', backupToken);
    }

    // Clear failed statuses
    await redis.set('shopify:admin_access_token:status', 'ACTIVE');
    await redis.del('shopify:admin_access_token:revocation_time');
    await redis.set('shopify:admin_access_token:last_rotation', Date.now().toString());

    return NextResponse.json({
      success: true,
      message: 'Shopify Admin Access Token rotated and verified successfully.',
      hasBackup: !!backupToken
    });
  } catch (error) {
    console.error('Token rotation route error:', error);
    return NextResponse.json({
      error: 'Failed to rotate token',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
