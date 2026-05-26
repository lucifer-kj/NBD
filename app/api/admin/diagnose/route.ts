import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { decryptSession } from '@/lib/session';
import { getToken } from 'next-auth/jwt';
import { SHOPIFY_ADMIN_API_VERSION, SHOPIFY_STOREFRONT_API_VERSION } from '@/lib/shopify/utils';

export const dynamic = 'force-dynamic';

// Helper to mask secrets
function maskSecret(secret: string | undefined): string {
  if (!secret) return 'NOT_SET';
  if (secret.length <= 12) return 'SET_BUT_TOO_SHORT';
  return `${secret.slice(0, 8)}...${secret.slice(-4)}`;
}

// Handler for POST requests: Session Decryption Sandbox
export async function POST(req: NextRequest) {
  try {
    // Auth Check for Security
    const url = new URL(req.url);
    const secretParam = url.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;
    const rotateSecret = process.env.SHOPIFY_TOKEN_ROTATION_SECRET;

    const isAuthorized = 
      (cronSecret && secretParam === cronSecret) || 
      (rotateSecret && secretParam === rotateSecret);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized. Invalid or missing secret parameter.' }, { status: 401 });
    }

    const { cookie, type } = await req.json();

    if (!cookie) {
      return NextResponse.json({ error: 'No cookie provided' }, { status: 400 });
    }

    if (type === 'session') {
      // Custom session cookie decryption
      try {
        const decrypted = await decryptSession(cookie);
        if (decrypted) {
          const tests: {
            storefrontFetch: { status: string; data: unknown; error: string | null };
            adminFetch: { status: string; data: unknown; error: string | null };
          } = {
            storefrontFetch: { status: 'SKIPPED', data: null, error: null },
            adminFetch: { status: 'SKIPPED', data: null, error: null }
          };

          if (decrypted.accessToken) {
            try {
              const { getCustomerDetails } = await import('@/lib/shopify');
              const sfCust = await getCustomerDetails(decrypted.accessToken);
              tests.storefrontFetch.status = sfCust ? 'SUCCESS' : 'EMPTY_RESULT';
              tests.storefrontFetch.data = sfCust;
            } catch (sfErr) {
              tests.storefrontFetch.status = 'ERROR';
              tests.storefrontFetch.error = sfErr instanceof Error ? sfErr.message : String(sfErr);
            }
          }

          if (decrypted.customerId) {
            try {
              const { getCustomerDetailsById } = await import('@/lib/shopify/admin');
              const admCust = await getCustomerDetailsById(decrypted.customerId);
              tests.adminFetch.status = admCust ? 'SUCCESS' : 'EMPTY_RESULT';
              tests.adminFetch.data = admCust;
            } catch (admErr) {
              tests.adminFetch.status = 'ERROR';
              tests.adminFetch.error = admErr instanceof Error ? admErr.message : String(admErr);
            }
          }

          return NextResponse.json({
            success: true,
            method: 'jose.jwtVerify (HS256)',
            payload: {
              ...decrypted,
              expiresAtReadable: decrypted.expiresAt ? new Date(decrypted.expiresAt).toLocaleString() : 'N/A',
              isExpired: decrypted.expiresAt ? new Date(decrypted.expiresAt).getTime() < Date.now() : false,
            },
            liveTest: tests
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Decryption returned null (invalid signature, key mismatch, or format issue).'
          });
        }
      } catch (e) {
        return NextResponse.json({
          success: false,
          error: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined
        });
      }
    } else if (type === 'nextauth') {
      // NextAuth JWE decryption
      try {
        const mockHeaders = new Headers();
        const host = req.headers.get('host') || 'www.naazbook.in';
        const protocol = req.nextUrl.protocol || 'https:';
        
        const isProd = process.env.NODE_ENV === 'production';
        const cookieName = isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
        
        mockHeaders.set('Cookie', `${cookieName}=${cookie}`);
        mockHeaders.set('host', host);

        const mockReq = new NextRequest(`${protocol}//${host}`, {
          headers: mockHeaders,
        });

        const token = await getToken({
          req: mockReq,
          secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET,
          secureCookie: isProd,
        });

        if (token) {
          const exp = typeof token.exp === 'number' ? token.exp : undefined;
          const customerId = (token.customerId as string) || null;
          const shopifyToken = (token.shopifyToken as string) || null;

          const tests: {
            storefrontFetch: { status: string; data: unknown; error: string | null };
            adminFetch: { status: string; data: unknown; error: string | null };
          } = {
            storefrontFetch: { status: 'SKIPPED', data: null, error: null },
            adminFetch: { status: 'SKIPPED', data: null, error: null }
          };

          if (shopifyToken) {
            try {
              const { getCustomerDetails } = await import('@/lib/shopify');
              const sfCust = await getCustomerDetails(shopifyToken);
              tests.storefrontFetch.status = sfCust ? 'SUCCESS' : 'EMPTY_RESULT';
              tests.storefrontFetch.data = sfCust;
            } catch (sfErr) {
              tests.storefrontFetch.status = 'ERROR';
              tests.storefrontFetch.error = sfErr instanceof Error ? sfErr.message : String(sfErr);
            }
          }

          if (customerId) {
            try {
              const { getCustomerDetailsById } = await import('@/lib/shopify/admin');
              const admCust = await getCustomerDetailsById(customerId);
              tests.adminFetch.status = admCust ? 'SUCCESS' : 'EMPTY_RESULT';
              tests.adminFetch.data = admCust;
            } catch (admErr) {
              tests.adminFetch.status = 'ERROR';
              tests.adminFetch.error = admErr instanceof Error ? admErr.message : String(admErr);
            }
          }

          return NextResponse.json({
            success: true,
            method: 'next-auth/jwt.getToken (JWE Decryption)',
            payload: {
              ...token,
              expReadable: exp ? new Date(exp * 1000).toLocaleString() : 'N/A',
              isExpired: exp ? exp * 1000 < Date.now() : false,
            },
            liveTest: tests
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Decryption returned null. Verify that your NEXTAUTH_SECRET is set correctly, matches production, and cookie is not expired.'
          });
        }
      } catch (e) {
        return NextResponse.json({
          success: false,
          error: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined
        });
      }
    }

    return NextResponse.json({ error: 'Invalid decryption type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}

// Handler for GET requests: Renders dynamic HTML Dashboard
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const logs: string[] = [];
  const log = (msg: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    logs.push(`[${timestamp}] ${msg}`);
    console.log(`[Diagnostic] ${msg}`);
  };

  log('Starting Diagnostic Health Check Suite.');

  // 1. Authorization Verification
  const url = new URL(req.url);
  const secretParam = url.searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;
  const rotateSecret = process.env.SHOPIFY_TOKEN_ROTATION_SECRET;

  const isAuthorized = 
    (cronSecret && secretParam === cronSecret) || 
    (rotateSecret && secretParam === rotateSecret);

  if (!isAuthorized) {
    log('Unauthorized access attempt blocked.');
    const errorHtml = getUnauthorizedHtml(secretParam || '');
    return new NextResponse(errorHtml, {
      status: 401,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  log('Client successfully authenticated via query secret.');

  // 2. Perform Environment Variable Check
  log('Analyzing environment variables presence & configuration...');
  const envResults = {
    SHOPIFY_STORE_DOMAIN: {
      present: !!process.env.SHOPIFY_STORE_DOMAIN,
      value: maskSecret(process.env.SHOPIFY_STORE_DOMAIN),
      status: process.env.SHOPIFY_STORE_DOMAIN ? 'PASS' : 'FAIL',
      warning: process.env.SHOPIFY_STORE_DOMAIN?.includes('checkout.naazbook.in') 
        ? 'WARNING: Current store domain is set to a checkout subdomain which will block Admin API calls. It must be set to the canonical shopify (.myshopify.com) domain.'
        : undefined
    },
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: {
      present: !!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      value: maskSecret(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN),
      status: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ? 'PASS' : 'FAIL',
    },
    SHOPIFY_ADMIN_ACCESS_TOKEN: {
      present: !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      value: maskSecret(process.env.SHOPIFY_ADMIN_ACCESS_TOKEN),
      status: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? 'PASS' : 'FAIL',
    },
    SESSION_SECRET: {
      present: !!process.env.SESSION_SECRET,
      value: maskSecret(process.env.SESSION_SECRET),
      status: process.env.SESSION_SECRET ? 'PASS' : 'FAIL',
      warning: process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 16
        ? 'WARNING: SESSION_SECRET is too short. It should be at least 16 or 32 characters for secure JWT signing.'
        : undefined
    },
    NEXTAUTH_SECRET: {
      present: !!process.env.NEXTAUTH_SECRET,
      value: maskSecret(process.env.NEXTAUTH_SECRET),
      status: process.env.NEXTAUTH_SECRET ? 'PASS' : 'FAIL',
    },
    NEXTAUTH_URL: {
      present: !!process.env.NEXTAUTH_URL,
      value: process.env.NEXTAUTH_URL || 'NOT_SET',
      status: process.env.NEXTAUTH_URL ? 'PASS' : 'FAIL',
    },
    KV_REST_API_URL: {
      present: !!process.env.KV_REST_API_URL,
      value: process.env.KV_REST_API_URL || 'NOT_SET',
      status: process.env.KV_REST_API_URL ? 'PASS' : 'FAIL',
    },
    KV_REST_API_TOKEN: {
      present: !!process.env.KV_REST_API_TOKEN,
      value: maskSecret(process.env.KV_REST_API_TOKEN),
      status: process.env.KV_REST_API_TOKEN ? 'PASS' : 'FAIL',
    }
  };

  const isEnvHealthy = Object.values(envResults).every(v => v.status === 'PASS' || ('warning' in v && v.warning));
  log(`Environment Health: ${isEnvHealthy ? 'HEALTHY' : 'UNHEALTHY (missing core variables)'}`);

  // 3. Perform Redis Connection Handshake
  log('Initiating connection handshake to Upstash Redis...');
  const redisResults = {
    status: 'FAIL',
    latency: '0ms',
    pingResponse: 'N/A',
    keys: {
      activeToken: { present: false, length: 0, status: 'NOT_FOUND', value: 'N/A' },
      backupToken: { present: false, length: 0, status: 'NOT_FOUND', value: 'N/A' },
      tokenStatus: { present: false, value: 'N/A' },
      lastRotation: { present: false, value: 'N/A' }
    },
    error: undefined as string | undefined
  };

  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    const redisStart = Date.now();
    try {
      const redis = new Redis({ url: redisUrl, token: redisToken });
      const pingRes = await redis.ping();
      redisResults.pingResponse = String(pingRes);
      redisResults.latency = `${Date.now() - redisStart}ms`;
      redisResults.status = pingRes === 'PONG' ? 'PASS' : 'WARNING';
      log(`Redis Ping response: ${pingRes} in ${redisResults.latency}`);

      // Read relevant keys
      log('Querying Redis store for dynamic active token details...');
      const activeToken = await redis.get<string>('shopify:admin_access_token');
      const backupToken = await redis.get<string>('shopify:admin_access_token:backup');
      const tokenStatus = await redis.get<string>('shopify:admin_access_token:status');
      const lastRotation = await redis.get<string>('shopify:admin_access_token:last_rotation');

      if (activeToken) {
        redisResults.keys.activeToken = {
          present: true,
          length: activeToken.length,
          status: 'LOADED_FROM_REDIS',
          value: maskSecret(activeToken)
        };
        log('Dynamic Shopify Admin Access Token is loaded & active in Redis.');
      } else {
        log('No dynamic Shopify Admin Access Token found in Redis. System will fall back to environment variable.');
      }

      if (backupToken) {
        redisResults.keys.backupToken = {
          present: true,
          length: backupToken.length,
          status: 'BACKUP_STANDBY_FOUND',
          value: maskSecret(backupToken)
        };
        log('Dynamic Shopify Standby Backup Token is present in Redis.');
      }

      if (tokenStatus) {
        redisResults.keys.tokenStatus = { present: true, value: String(tokenStatus) };
        log(`Redis token status key: ${tokenStatus}`);
      }

      if (lastRotation && typeof lastRotation === 'string') {
        const parsed = parseInt(lastRotation, 10);
        if (!isNaN(parsed)) {
          const formattedDate = new Date(parsed).toLocaleString();
          redisResults.keys.lastRotation = { present: true, value: formattedDate };
          log(`Last key rotation occurred at: ${formattedDate}`);
        }
      }
    } catch (e) {
      redisResults.error = e instanceof Error ? e.message : String(e);
      log(`Upstash Redis check encountered error: ${redisResults.error}`);
    }
  } else {
    redisResults.error = 'Upstash credentials are not configured in environment variables.';
    log('Upstash Redis check skipped: credentials not set.');
  }

  // 4. Perform Shopify Storefront API GraphQL Connection
  log('Testing connection to Shopify Storefront API...');
  const storefrontResults = {
    status: 'FAIL',
    latency: '0ms',
    domain: process.env.SHOPIFY_STORE_DOMAIN || 'N/A',
    parsedEndpoint: 'N/A',
    shopName: 'N/A',
    primaryDomain: 'N/A',
    error: undefined as unknown
  };

  if (process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    const rawDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const cleanDomain = rawDomain.includes('://') ? rawDomain.replace(/\/$/, '') : `https://${rawDomain.replace(/\/$/, '')}`;
    const sfEndpoint = `${cleanDomain}/api/${SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`;
    storefrontResults.parsedEndpoint = sfEndpoint;

    const sfStart = Date.now();
    try {
      log(`Sending lightweight GraphQL query to ${sfEndpoint}`);
      const response = await fetch(sfEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
        },
        body: JSON.stringify({
          query: `
            query {
              shop {
                name
                primaryDomain {
                  url
                  host
                }
              }
            }
          `
        }),
        cache: 'no-store'
      });

      storefrontResults.latency = `${Date.now() - sfStart}ms`;

      if (!response.ok) {
        const text = await response.text();
        storefrontResults.error = `HTTP Error ${response.status}: ${text.slice(0, 200)}`;
        log(`Storefront API connection returned HTTP error ${response.status}`);
      } else {
        const body = await response.json();
        if (body.errors) {
          storefrontResults.error = body.errors[0];
          log(`Storefront API GraphQL returned error: ${body.errors[0].message}`);
        } else {
          storefrontResults.shopName = body.data?.shop?.name || 'N/A';
          storefrontResults.primaryDomain = body.data?.shop?.primaryDomain?.url || 'N/A';
          storefrontResults.status = 'PASS';
          log(`Storefront connection successful! Shop: "${storefrontResults.shopName}", Primary Domain: ${storefrontResults.primaryDomain}`);
        }
      }
    } catch (e) {
      storefrontResults.error = e instanceof Error ? e.message : String(e);
      log(`Storefront API connection failed with exception: ${storefrontResults.error}`);
    }
  } else {
    storefrontResults.error = 'Shopify Storefront credentials are missing in the environment.';
    log('Storefront API connection test skipped: credentials missing.');
  }

  // 5. Perform Shopify Admin API GraphQL Connection
  log('Testing connection to Shopify Admin API...');
  const adminResults = {
    status: 'FAIL',
    latency: '0ms',
    activeTokenUsed: 'N/A',
    tokenSource: 'N/A',
    shopName: 'N/A',
    myshopifyDomain: 'N/A',
    planName: 'N/A',
    scopesCheck: 'N/A',
    error: undefined as unknown
  };

  const domainStr = process.env.SHOPIFY_STORE_DOMAIN;
  const cleanDomainStr = domainStr 
    ? (domainStr.includes('://') ? domainStr.replace(/\/$/, '') : `https://${domainStr.replace(/\/$/, '')}`)
    : '';

  const adminEndpoint = cleanDomainStr ? `${cleanDomainStr}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json` : '';

  if (adminEndpoint) {
    let tokenToTest = '';
    let tokenSource = 'Environment Variable (SHOPIFY_ADMIN_ACCESS_TOKEN)';

    if (redisResults.keys.activeToken.present) {
      try {
        const redis = new Redis({ url: redisUrl!, token: redisToken! });
        const redisTokenVal = await redis.get<string>('shopify:admin_access_token');
        if (redisTokenVal) {
          tokenToTest = redisTokenVal;
          tokenSource = 'Dynamic Redis Key (shopify:admin_access_token)';
        }
      } catch {
        // Fallback
      }
    }

    if (!tokenToTest) {
      tokenToTest = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
    }

    adminResults.activeTokenUsed = maskSecret(tokenToTest);
    adminResults.tokenSource = tokenSource;

    if (tokenToTest) {
      const adminStart = Date.now();
      try {
        log(`Initiating Admin GraphQL test query using ${tokenSource}...`);
        const response = await fetch(adminEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': tokenToTest
          },
          body: JSON.stringify({
            query: `
              query {
                shop {
                  name
                  myshopifyDomain
                  plan {
                    displayName
                  }
                }
              }
            `
          }),
          cache: 'no-store'
        });

        adminResults.latency = `${Date.now() - adminStart}ms`;

        if (!response.ok) {
          const text = await response.text();
          adminResults.error = `HTTP Error ${response.status}: ${text.slice(0, 300)}`;
          log(`Admin API returned HTTP ${response.status}. Mismatch domain or invalid token.`);
        } else {
          const body = await response.json();
          if (body.errors) {
            adminResults.error = body.errors[0];
            log(`Admin API GraphQL returned error: ${body.errors[0].message}`);
          } else {
            adminResults.shopName = body.data?.shop?.name || 'N/A';
            adminResults.myshopifyDomain = body.data?.shop?.myshopifyDomain || 'N/A';
            adminResults.planName = body.data?.shop?.plan?.displayName || 'N/A';
            adminResults.status = 'PASS';
            log(`Admin connection successful! Shop: "${adminResults.shopName}", plan: ${adminResults.planName}`);

            // Perform dynamic Scopes verification
            log('Testing Admin API Access Scopes (read_customers)...');
            try {
              const scopeResponse = await fetch(adminEndpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': tokenToTest
                },
                body: JSON.stringify({
                  query: `
                    query {
                      customers(first: 1) {
                        edges {
                          node {
                            id
                          }
                        }
                      }
                    }
                  `
                }),
                cache: 'no-store'
              });

              if (scopeResponse.ok) {
                const scopeBody = await scopeResponse.json();
                if (scopeBody.errors) {
                  const err = scopeBody.errors[0];
                  if (err.message?.includes('Access denied') || err.message?.includes('scope')) {
                    adminResults.scopesCheck = `FAIL: Missing read_customers scope. (${err.message})`;
                  } else {
                    adminResults.scopesCheck = `FAIL: GraphQL error: ${err.message}`;
                  }
                  log(`Scopes check failed: ${err.message}`);
                } else {
                  adminResults.scopesCheck = 'PASS: read_customers scope is active.';
                  log('Scopes check passed: read_customers scope is active.');
                }
              } else {
                adminResults.scopesCheck = `FAIL: HTTP ${scopeResponse.status}`;
                log(`Scopes check returned HTTP error status ${scopeResponse.status}`);
              }
            } catch (scopeErr) {
              adminResults.scopesCheck = `FAIL: Exception occurred.`;
              log(`Scopes check failed with exception: ${scopeErr instanceof Error ? scopeErr.message : String(scopeErr)}`);
            }
          }
        }
      } catch (e) {
        adminResults.error = e instanceof Error ? e.message : String(e);
        log(`Admin API connection failed with exception: ${adminResults.error}`);
      }
    } else {
      adminResults.error = 'No Admin Access Token is available (both Redis key and env variable are missing).';
      log('Admin API connection test skipped: no token available.');
    }
  } else {
    adminResults.error = 'SHOPIFY_STORE_DOMAIN is missing in environment variables.';
    log('Admin API connection test skipped: store domain missing.');
  }

  // 6. Final Status & Summary compilation
  const totalElapsed = Date.now() - startTime;
  log(`All health checks complete in ${totalElapsed}ms.`);

  const dashboardData = {
    timestamp: new Date().toLocaleString(),
    elapsedTime: `${totalElapsed}ms`,
    env: envResults,
    redis: redisResults,
    storefront: storefrontResults,
    admin: adminResults,
    logs
  };

  const html = getDashboardHtml(dashboardData, secretParam || '', isEnvHealthy);
  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// -------------------------------------------------------------
// UI Layout HTML Template - Glassmorphism, Emerald and Gold Accent
// -------------------------------------------------------------
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function getDashboardHtml(data: any, secretKey: string, isEnvHealthy: boolean): string {
  const isAllGreen = 
    data.env.SHOPIFY_STORE_DOMAIN.status === 'PASS' &&
    data.storefront.status === 'PASS' &&
    data.admin.status === 'PASS';

  const storefrontError = data.storefront.error 
    ? typeof data.storefront.error === 'object' 
      ? JSON.stringify(data.storefront.error, null, 2) 
      : String(data.storefront.error)
    : '';

  const adminError = data.admin.error 
    ? typeof data.admin.error === 'object' 
      ? JSON.stringify(data.admin.error, null, 2) 
      : String(data.admin.error)
    : '';

  const redisError = data.redis.error || '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Naaz Book Depot | System Diagnostics</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-dark: #070a13;
          --bg-card: rgba(15, 23, 42, 0.65);
          --border-glass: rgba(255, 255, 255, 0.08);
          --islamic-green: #0a4d2c;
          --islamic-green-glowing: #10b981;
          --islamic-gold: #c5a880;
          --islamic-gold-glow: #e2c193;
          --danger-red: #ef4444;
          --danger-red-glow: #f87171;
          --warning-amber: #f59e0b;
          --warning-amber-glow: #fbbf24;
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background-color: var(--bg-dark);
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(10, 77, 44, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(197, 168, 128, 0.08) 0%, transparent 45%);
          background-attachment: fixed;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          padding: 2rem 1.5rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
          position: relative;
        }

        header::after {
          content: '';
          position: absolute;
          bottom: -1rem;
          left: 0;
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, var(--islamic-green-glowing), var(--islamic-gold));
          border-radius: 2px;
        }

        h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--text-primary) 30%, var(--islamic-gold) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .meta-tag {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-glass);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          color: var(--islamic-gold);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .meta-tag strong {
          color: var(--text-primary);
        }

        /* Grid Layout */
        .grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        @media (min-width: 900px) {
          .grid-layout {
            grid-template-columns: 1fr 1fr;
          }
          .full-width {
            grid-column: span 2;
          }
        }

        /* Card Styles */
        .card {
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-glass);
          border-radius: 24px;
          padding: 1.75rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: transparent;
          transition: all 0.3s ease;
        }

        .card.pass::before { background: var(--islamic-green-glowing); }
        .card.fail::before { background: var(--danger-red); }
        .card.warning::before { background: var(--warning-amber); }

        .card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .card-title svg {
          color: var(--islamic-gold);
        }

        /* Badges */
        .status-badge {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 0.3rem 0.75rem;
          border-radius: 8px;
          text-transform: uppercase;
        }

        .status-badge.pass {
          background: rgba(16, 185, 129, 0.1);
          color: var(--islamic-green-glowing);
          border: 1px solid rgba(16, 185, 129, 0.2);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.05);
        }

        .status-badge.fail {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger-red);
          border: 1px solid rgba(239, 68, 68, 0.2);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.05);
        }

        .status-badge.warning {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning-amber);
          border: 1px solid rgba(245, 158, 11, 0.2);
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.05);
        }

        /* Content List */
        .prop-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .prop-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding-bottom: 0.5rem;
        }

        .prop-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .prop-name {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .prop-value {
          font-family: 'JetBrains Mono', monospace;
          color: var(--text-primary);
          word-break: break-all;
          text-align: right;
          max-width: 60%;
        }

        .prop-value.ok {
          color: var(--islamic-green-glowing);
        }

        .prop-value.bad {
          color: var(--danger-red);
        }

        .prop-value.caution {
          color: var(--warning-amber);
        }

        /* Warning Banner inside Prop List */
        .warning-banner {
          background: rgba(245, 158, 11, 0.05);
          border: 1px dashed rgba(245, 158, 11, 0.2);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          color: var(--warning-amber-glow);
          margin-top: 0.5rem;
        }

        /* Error block */
        .error-block {
          background: rgba(239, 68, 68, 0.03);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: var(--danger-red-glow);
          border-radius: 14px;
          padding: 1rem;
          margin-top: 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          white-space: pre-wrap;
          overflow-x: auto;
          max-height: 180px;
        }

        /* Sandbox Cookie Decryption Suite */
        .sandbox-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--islamic-gold);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .radio-group {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .radio-option input {
          accent-color: var(--islamic-green-glowing);
        }

        textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-glass);
          border-radius: 14px;
          color: var(--text-primary);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          padding: 0.85rem;
          height: 100px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s ease;
        }

        textarea:focus {
          border-color: var(--islamic-gold);
        }

        .btn {
          background: linear-gradient(135deg, var(--islamic-green), #0d5c35);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(10, 77, 44, 0.3);
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(10, 77, 44, 0.4);
          background: linear-gradient(135deg, #0e5a35, #11693e);
          border-color: var(--islamic-green-glowing);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sandbox-result {
          margin-top: 1.25rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 1.25rem;
          display: none;
        }

        .sandbox-result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 0.5rem;
        }

        .sandbox-result-title {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--islamic-gold);
        }

        .sandbox-payload {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          white-space: pre-wrap;
          color: #10b981;
          overflow-x: auto;
        }

        .sandbox-payload.error {
          color: var(--danger-red-glow);
        }

        /* Real-time System Logs Console */
        .console-container {
          background: #020408;
          border: 1px solid var(--border-glass);
          border-radius: 24px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }

        .console-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 0.5rem;
        }

        .console-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .console-pulse {
          width: 8px;
          height: 8px;
          background-color: var(--islamic-green-glowing);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 10px var(--islamic-green-glowing);
          animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 14px var(--islamic-green-glowing); }
          100% { transform: scale(0.9); opacity: 0.6; }
        }

        .console-body {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: #a7f3d0;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          max-height: 250px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .console-line {
          word-break: break-all;
        }

        /* Quick Actions panel */
        .actions-panel {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .action-link {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          padding: 0.5rem 1.25rem;
          border-radius: 12px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .action-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          border-color: var(--border-glass);
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <header>
          <h1>Naaz Book Depot</h1>
          <div class="subtitle">
            <span>System Diagnostics & Health Suite</span>
            <div class="meta-tag">
              <span style="display:inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${isAllGreen ? 'var(--islamic-green-glowing)' : 'var(--warning-amber)'}"></span>
              System: <strong>${isAllGreen ? 'Fully Functional' : 'Attention Required'}</strong>
            </div>
            <div class="meta-tag">
              API Version: <strong>Admin: ${SHOPIFY_ADMIN_API_VERSION} | SF: ${SHOPIFY_STOREFRONT_API_VERSION}</strong>
            </div>
            <div class="meta-tag">
              Diagnostics Executed: <strong>${data.timestamp}</strong>
            </div>
          </div>
        </header>

        <div class="grid-layout">
          
          <!-- Card 1: Environment Variables -->
          <div class="card ${data.env.SHOPIFY_STORE_DOMAIN.status === 'FAIL' ? 'fail' : isEnvHealthy ? 'pass' : 'warning'}">
            <div class="card-header">
              <div class="card-title">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Environment Variables
              </div>
              <span class="status-badge ${isEnvHealthy ? 'pass' : 'warning'}">${isEnvHealthy ? 'pass' : 'warning'}</span>
            </div>
            
            <div class="prop-list">
              <div class="prop-item">
                <span class="prop-name">SHOPIFY_STORE_DOMAIN</span>
                <span class="prop-value ${data.env.SHOPIFY_STORE_DOMAIN.status === 'FAIL' ? 'bad' : 'ok'}">${data.env.SHOPIFY_STORE_DOMAIN.value}</span>
              </div>
              ${data.env.SHOPIFY_STORE_DOMAIN.warning ? `<div class="warning-banner">${data.env.SHOPIFY_STORE_DOMAIN.warning}</div>` : ''}
              
              <div class="prop-item">
                <span class="prop-name">SHOPIFY_STOREFRONT_ACCESS_TOKEN</span>
                <span class="prop-value ${data.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN.status === 'FAIL' ? 'bad' : 'ok'}">${data.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN.value}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">SHOPIFY_ADMIN_ACCESS_TOKEN</span>
                <span class="prop-value ${data.env.SHOPIFY_ADMIN_ACCESS_TOKEN.status === 'FAIL' ? 'bad' : 'ok'}">${data.env.SHOPIFY_ADMIN_ACCESS_TOKEN.value}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">SESSION_SECRET</span>
                <span class="prop-value ${data.env.SESSION_SECRET.status === 'FAIL' ? 'bad' : 'ok'}">${data.env.SESSION_SECRET.value}</span>
              </div>
              ${data.env.SESSION_SECRET.warning ? `<div class="warning-banner">${data.env.SESSION_SECRET.warning}</div>` : ''}
              
              <div class="prop-item">
                <span class="prop-name">NEXTAUTH_SECRET</span>
                <span class="prop-value ${data.env.NEXTAUTH_SECRET.status === 'FAIL' ? 'bad' : 'ok'}">${data.env.NEXTAUTH_SECRET.value}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">NEXTAUTH_URL</span>
                <span class="prop-value">${data.env.NEXTAUTH_URL.value}</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Upstash Redis State -->
          <div class="card ${data.redis.status === 'PASS' ? 'pass' : data.redis.status === 'WARNING' ? 'warning' : 'fail'}">
            <div class="card-header">
              <div class="card-title">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                Upstash Redis State
              </div>
              <span class="status-badge ${data.redis.status === 'PASS' ? 'pass' : data.redis.status === 'WARNING' ? 'warning' : 'fail'}">${data.redis.status === 'PASS' ? 'connected' : data.redis.status === 'WARNING' ? 'stale' : 'offline'}</span>
            </div>
            
            <div class="prop-list">
              <div class="prop-item">
                <span class="prop-name">KV_REST_API_URL</span>
                <span class="prop-value">${data.env.KV_REST_API_URL.value}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">Handshake Ping</span>
                <span class="prop-value ${data.redis.status === 'PASS' ? 'ok' : 'bad'}">${data.redis.pingResponse} (${data.redis.latency})</span>
              </div>
              
              <hr style="border:none; border-top: 1px solid rgba(255,255,255,0.05); margin: 0.5rem 0;" />
              <div style="font-size:0.85rem; font-weight:700; color:var(--islamic-gold); margin-bottom:0.25rem;">Dynamic Token Vault Status</div>
              
              <div class="prop-item">
                <span class="prop-name">shopify:admin_access_token</span>
                <span class="prop-value">${data.redis.keys.activeToken.value}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">shopify:admin_access_token:backup</span>
                <span class="prop-value">${data.redis.keys.backupToken.value}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">shopify:admin_access_token:status</span>
                <span class="prop-value" style="color:var(--islamic-gold)">${data.redis.keys.tokenStatus.value}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">Last rotation date</span>
                <span class="prop-value">${data.redis.keys.lastRotation.value}</span>
              </div>
            </div>
            ${redisError ? `<div class="error-block">${redisError}</div>` : ''}
          </div>

          <!-- Card 3: Shopify Storefront API -->
          <div class="card ${data.storefront.status === 'PASS' ? 'pass' : 'fail'}">
            <div class="card-header">
              <div class="card-title">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                Shopify Storefront API
              </div>
              <span class="status-badge ${data.storefront.status === 'PASS' ? 'pass' : 'fail'}">${data.storefront.status}</span>
            </div>
            
            <div class="prop-list">
              <div class="prop-item">
                <span class="prop-name">SHOPIFY_STORE_DOMAIN</span>
                <span class="prop-value">${data.storefront.domain}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">Parsed API URL</span>
                <span class="prop-value" style="font-size:0.8rem">${data.storefront.parsedEndpoint}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">Handshake Latency</span>
                <span class="prop-value ${data.storefront.status === 'PASS' ? 'ok' : 'bad'}">${data.storefront.latency}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">Shop Name</span>
                <span class="prop-value" style="color:var(--islamic-gold)">${data.storefront.shopName}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">Canonical URL</span>
                <span class="prop-value">${data.storefront.primaryDomain}</span>
              </div>
            </div>
            ${storefrontError ? `<div class="error-block">${storefrontError}</div>` : ''}
          </div>

          <!-- Card 4: Shopify Admin API & Dynamic Token Resolver -->
          <div class="card ${data.admin.status === 'PASS' ? 'pass' : 'fail'}">
            <div class="card-header">
              <div class="card-title">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                Shopify Admin API
              </div>
              <span class="status-badge ${data.admin.status === 'PASS' ? 'pass' : 'fail'}">${data.admin.status}</span>
            </div>
            
            <div class="prop-list">
              <div class="prop-item">
                <span class="prop-name">Access Token Tested</span>
                <span class="prop-value">${data.admin.activeTokenUsed}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">Token Source</span>
                <span class="prop-value" style="color:var(--islamic-gold)">${data.admin.tokenSource}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">API Latency</span>
                <span class="prop-value ${data.admin.status === 'PASS' ? 'ok' : 'bad'}">${data.admin.latency}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">Resolved Shop Name</span>
                <span class="prop-value" style="color:var(--islamic-gold)">${data.admin.shopName}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">Resolved Domain</span>
                <span class="prop-value">${data.admin.myshopifyDomain}</span>
              </div>
               <div class="prop-item">
                <span class="prop-name">Shopify Tier Plan</span>
                <span class="prop-value">${data.admin.planName}</span>
              </div>
              <div class="prop-item">
                <span class="prop-name">Admin API Scopes</span>
                <span class="prop-value ${data.admin.scopesCheck.startsWith('PASS') ? 'ok' : 'bad'}" style="font-weight: 700;">${data.admin.scopesCheck}</span>
              </div>
            </div>
            ${adminError ? `<div class="error-block">${adminError}</div>` : ''}
          </div>

          <!-- Card 5: Sandbox Session Decryption Suite (Full Width) -->
          <div class="card full-width">
            <div class="sandbox-title">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Cryptographic Session Decrypter Sandbox
            </div>
            
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1.5rem;">
              Paste your active cookie (e.g. from Chrome DevTools Application tab) to perform safe on-server cryptographic decryption tests. This checks if the session keys match the environment configuration.
            </div>

            <div class="form-group">
              <label>Select Cookie Type to Decrypt</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input type="radio" name="cookieType" value="session" checked>
                  Custom Session Cookie (jose HS256)
                </label>
                <label class="radio-option">
                  <input type="radio" name="cookieType" value="nextauth">
                  NextAuth JWT Token Cookie (JWE Decrypt)
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="cookieInput">Cookie Payload Value</label>
              <textarea id="cookieInput" placeholder="Paste the encrypted cookie string here..."></textarea>
            </div>

            <button class="btn" id="decryptBtn" onclick="runDecryptionSandbox()">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
              Decrypt Session
            </button>

            <div class="sandbox-result" id="sandboxResult">
              <div class="sandbox-result-header">
                <span class="sandbox-result-title" id="sandboxResultMethod">N/A</span>
                <span class="status-badge" id="sandboxResultStatus">STATUS</span>
              </div>
              <pre class="sandbox-payload" id="sandboxResultOutput">Waiting for decryption...</pre>
            </div>
          </div>

          <!-- Card 6: Live Execution Log Console (Full Width) -->
          <div class="console-container full-width">
            <div class="console-header">
              <div class="console-title">
                <span class="console-pulse"></span>
                Server Execution Console Logs
              </div>
              <span style="font-size:0.75rem; color:var(--text-muted)">Suite Latency: ${data.elapsedTime}</span>
            </div>
            
            <div class="console-body">
              ${data.logs.map((line: string) => `<div class="console-line">${line}</div>`).join('')}
            </div>
          </div>

        </div>

        <div class="actions-panel">
          <a href="/account" class="action-link">← Go to Account</a>
          <a href="/" class="action-link">Storefront Home</a>
          <a href="/api/admin/diagnose?secret=${secretKey}" class="action-link">Refresh Diagnostics</a>
        </div>

      </div>

      <script>
        async function runDecryptionSandbox() {
          const cookieVal = document.getElementById('cookieInput').value.trim();
          const cookieType = document.querySelector('input[name="cookieType"]:checked').value;
          const btn = document.getElementById('decryptBtn');
          const resultBox = document.getElementById('sandboxResult');
          const resultMethod = document.getElementById('sandboxResultMethod');
          const resultStatus = document.getElementById('sandboxResultStatus');
          const resultOutput = document.getElementById('sandboxResultOutput');

          if (!cookieVal) {
            alert('Please paste a cookie payload first!');
            return;
          }

          btn.disabled = true;
          btn.innerText = 'Decrypting...';
          resultBox.style.display = 'block';
          resultOutput.className = 'sandbox-payload';
          resultOutput.innerText = 'Communicating with crypt vault...';

          try {
            const response = await fetch('/api/admin/diagnose?secret=${secretKey}', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ cookie: cookieVal, type: cookieType })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
              resultMethod.innerText = data.method;
              resultStatus.innerText = 'DEC_SUCCESS';
              resultStatus.className = 'status-badge pass';
              resultOutput.className = 'sandbox-payload';
              resultOutput.innerText = JSON.stringify(data.payload, null, 2);
            } else {
              resultMethod.innerText = cookieType === 'session' ? 'jose.jwtVerify' : 'next-auth/jwt.getToken';
              resultStatus.innerText = 'DEC_FAILED';
              resultStatus.className = 'status-badge fail';
              resultOutput.className = 'sandbox-payload error';
              resultOutput.innerText = data.error || 'Decryption failed with an unknown error.';
            }
          } catch (e) {
            resultMethod.innerText = 'Network Fetch';
            resultStatus.innerText = 'API_ERR';
            resultStatus.className = 'status-badge fail';
            resultOutput.className = 'sandbox-payload error';
            resultOutput.innerText = 'Network error occurred while calling the diagnostics decrypt API: ' + e.message;
          } finally {
            btn.disabled = false;
            btn.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="display:inline; margin-right:0.3rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>Decrypt Session';
          }
        }
      </script>
    </body>
    </html>
  `;
}

function getUnauthorizedHtml(secretSupplied: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Access Denied | Naaz Diagnostics</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        body {
          background-color: #070a13;
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 1.5rem;
        }
        .box {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-top: 4px solid #ef4444;
          border-radius: 24px;
          padding: 2.5rem;
          max-width: 550px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.7);
        }
        h1 {
          font-family: 'Outfit', sans-serif;
          color: #f87171;
          font-size: 1.75rem;
          margin-bottom: 1rem;
        }
        p {
          color: #94a3b8;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .secret-display {
          font-family: monospace;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: #ef4444;
          display: inline-block;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
        }
        .instruction {
          background: rgba(197, 168, 128, 0.05);
          border: 1px solid rgba(197, 168, 128, 0.15);
          padding: 1rem;
          border-radius: 14px;
          text-align: left;
          font-size: 0.85rem;
          color: #c5a880;
        }
        .instruction ol {
          margin-left: 1.25rem;
          margin-top: 0.5rem;
          color: #e2c193;
        }
        .instruction li {
          margin-bottom: 0.25rem;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>Unauthorized Security Block</h1>
        <p>You attempted to access the Naaz Book Depot system diagnostic panel without presenting valid credentials. This route is heavily secured to protect production parameters.</p>
        
        <div class="secret-display">
          Supplied Secret: ${secretSupplied ? String(secretSupplied).slice(0, 20) + '...' : 'NONE'}
        </div>

        <div class="instruction">
          <strong>How to Gain Access:</strong>
          <ol>
            <li>Locate your <code>CRON_SECRET</code> key in your secure <code>.env.local</code> (or Vercel configuration variables).</li>
            <li>Append it to this URL as a query parameter.</li>
            <li>Example URL: <br><code style="word-break:break-all; color:#f8fafc;">/api/admin/diagnose?secret=YOUR_CRON_SECRET</code></li>
          </ol>
        </div>
      </div>
    </body>
    </html>
  `;
}
