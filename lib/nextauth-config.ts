import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions, User, Session, Account } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { loginShopifyCustomer, getOrCreateShopifyCustomer } from '@/lib/shopify/customer';
import { createDebug } from './auth-debug';
import { OAuth2Client } from 'google-auth-library';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

type AppAuthUser = User & {
  shopifyToken?: string | null;
  shopifyTokenExpiresAt?: string | null;
  customerId?: string | null;
};

type AppAuthToken = JWT & {
  shopifyToken?: string | null;
  shopifyTokenExpiresAt?: string | null;
  customerId?: string | null;
};

interface JwtCallbackParams {
  token: AppAuthToken;
  user?: AppAuthUser | null;
  account?: Account | null;
}

interface SessionCallbackParams {
  session: Session;
  token: AppAuthToken;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.naazbook.in' : undefined,
      }
    }
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      id: 'google-onetap',
      name: 'Google One Tap',
      credentials: {
        credential: { type: 'text' },
      },
      async authorize(credentials): Promise<AppAuthUser | null> {
        const debug = createDebug('nextauth-google-onetap');
        try {
          if (!credentials?.credential) return null;

          const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
          const ticket = await client.verifyIdToken({
            idToken: credentials.credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });

          const payload = ticket.getPayload();
          if (!payload || !payload.email) {
            debug.step('google_onetap_failed', 'Failed to get payload or email from ID token');
            return null;
          }

          const email = payload.email;
          const name = payload.name || payload.given_name || null;
          debug.step('google_onetap_verified', 'Google ID Token verified successfully', { email });

          // Retrieve or create the Shopify customer token
          const tokenObj = await getOrCreateShopifyCustomer({ email, firstName: name?.split(' ')[0] });
          if (!tokenObj) {
            debug.step('google_onetap_shopify_failed', 'Failed to get or create Shopify customer');
            return null;
          }

          // Get the Shopify customer ID to store in NextAuth session
          const { getCustomerDetails } = await import('@/lib/shopify');
          const customer = await getCustomerDetails(tokenObj.accessToken);
          let customerId = customer?.id || null;
          let customerName = customer?.firstName || null;

          if (!customerId) {
            debug.step('google_onetap_fallback', 'Storefront getCustomerDetails returned null, querying Admin API by email', { email });
            const { getCustomerByEmail } = await import('@/lib/shopify/admin');
            const adminCustomer = await getCustomerByEmail(email);
            if (adminCustomer) {
              customerId = adminCustomer.id;
              customerName = adminCustomer.firstName || null;
              debug.step('google_onetap_fallback_success', 'Resolved customerId via Admin API', { customerId });
            }
          }

          debug.step('google_onetap_success', 'Google One Tap login succeeded', { customerId });
          const user = {
            id: email,
            email,
            shopifyToken: tokenObj.accessToken,
            shopifyTokenExpiresAt: tokenObj.expiresAt,
            customerId,
            name: customerName || name
          };
          await debug.commit(email);
          return user;
        } catch (e) {
          debug.error('google_onetap_error', e);
          await debug.commit(credentials?.credential ? 'onetap_verification' : undefined);
          return null;
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AppAuthUser | null> {
        const debug = createDebug('nextauth-credentials');
        let email: string | undefined = undefined;
        try {
          if (!credentials) return null;
          const creds = credentials as { email: string; password: string };
          email = creds.email;
          const { password } = creds;
          debug.step('credentials_authorize', 'Authorize called for credentials', { emailPresent: !!email });
          
          // Rate Limit check based on client IP
          try {
            const headersList = await headers();
            const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
            const limitRes = await rateLimit(ip, 5, 60);
            if (!limitRes.success) {
              debug.error('credentials_authorize_rate_limited', { ip });
              throw new Error('Too many login attempts. Please try again after a minute.');
            }
          } catch (rlError) {
            // Log rate limiting error and proceed (fail open for safety if headers/redis fails, but throw if rateLimit returns false)
            if (rlError instanceof Error && rlError.message.includes('Too many login attempts')) {
              throw rlError;
            }
            console.error('Rate limit evaluation error:', rlError);
          }

          const tokenObj = await loginShopifyCustomer(email, password);
          if (!tokenObj) {
            debug.step('credentials_authorize_failed', 'Shopify login failed for credentials');
            return null;
          }
          
          // Get the Shopify customer ID to store in NextAuth session
          const { getCustomerDetails } = await import('@/lib/shopify');
          const customer = await getCustomerDetails(tokenObj.accessToken);
          let customerId = customer?.id || null;
          let customerName = customer?.firstName || null;

          if (!customerId) {
            debug.step('credentials_authorize_fallback', 'Storefront getCustomerDetails returned null, querying Admin API by email', { email });
            const { getCustomerByEmail } = await import('@/lib/shopify/admin');
            const adminCustomer = await getCustomerByEmail(email);
            if (adminCustomer) {
              customerId = adminCustomer.id;
              customerName = adminCustomer.firstName || null;
              debug.step('credentials_authorize_fallback_success', 'Resolved customerId via Admin API', { customerId });
            }
          }

          debug.step('credentials_authorize_success', 'Shopify login succeeded', { customerId });
          const user = { 
            id: email, 
            email, 
            shopifyToken: tokenObj.accessToken, 
            shopifyTokenExpiresAt: tokenObj.expiresAt,
            customerId,
            name: customerName
          };
          await debug.commit(email);
          return user;
        } catch (e) {
          debug.error('credentials_authorize_error', e);
          await debug.commit(email);
          // If we explicitly threw the rate-limit error, bubble it up to user
          if (e instanceof Error && e.message.includes('Too many login attempts')) {
            throw e;
          }
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }: JwtCallbackParams) {
      const debug = createDebug('nextauth-jwt');
      try {
        if (account && user) {
          const authUser = user as AppAuthUser;
          debug.step('jwt_on_signin', 'JWT callback on sign-in', { provider: account.provider });

          if (account.provider === 'google') {
            const email = authUser.email ?? undefined;
            const name = authUser.name ?? undefined;
            if (email) {
              debug.step('jwt_google_bridge', 'Creating or fetching Shopify customer for Google user', { email });
              const tokenObj = await getOrCreateShopifyCustomer({ email, firstName: name?.split(' ')[0] });
              if (tokenObj) {
                token.shopifyToken = tokenObj.accessToken;
                token.shopifyTokenExpiresAt = tokenObj.expiresAt;
              }

              // Get the Shopify customer ID to store in NextAuth session
              if (token.shopifyToken) {
                const { getCustomerDetails } = await import('@/lib/shopify');
                const customer = await getCustomerDetails(token.shopifyToken);
                token.customerId = customer?.id || null;
              }

              if (!token.customerId) {
                debug.step('jwt_google_bridge_fallback', 'Storefront getCustomerDetails returned null for Google user, querying Admin API by email', { email });
                const { getCustomerByEmail, createCustomerViaAdmin } = await import('@/lib/shopify/admin');
                let adminCustomer = await getCustomerByEmail(email);
                
                if (!adminCustomer) {
                  debug.step('jwt_google_bridge_admin_create', 'Customer not found on Shopify. Creating customer via Admin API', { email });
                  try {
                    const createdCust = await createCustomerViaAdmin({
                      email,
                      firstName: name?.split(' ')[0] || 'Valued',
                      lastName: name?.split(' ').slice(1).join(' ') || 'Customer'
                    });
                    if (createdCust) {
                      adminCustomer = createdCust;
                      debug.step('jwt_google_bridge_admin_create_success', 'Created customer via Admin API', { customerId: createdCust.id });
                    }
                  } catch (createErr) {
                    debug.error('jwt_google_bridge_admin_create_failed', createErr);
                  }
                }

                if (adminCustomer) {
                  token.customerId = adminCustomer.id;
                  debug.step('jwt_google_bridge_fallback_success', 'Resolved Google user customerId via Admin API', { customerId: adminCustomer.id });
                }
              }
            }
          }

          if (account.provider === 'credentials' || account.provider === 'google-onetap') {
            token.shopifyToken = authUser.shopifyToken ?? null;
            token.shopifyTokenExpiresAt = authUser.shopifyTokenExpiresAt ?? null;
            token.customerId = authUser.customerId ?? null;
          }
          await debug.commit(token.email || undefined);
        } else {
          // Background token renewal check
          const shopifyToken = token.shopifyToken;
          const expiresAtStr = token.shopifyTokenExpiresAt;
          
          if (shopifyToken && expiresAtStr) {
            const expiresAt = new Date(expiresAtStr).getTime();
            const now = Date.now();
            const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
            
            if (expiresAt - now < threeDaysMs) {
              debug.step('jwt_token_renewal_triggering', 'Shopify customer token expiring soon, renewing...', {
                expiresAt: new Date(expiresAt).toISOString(),
                now: new Date(now).toISOString()
              });
              
              const { renewCustomerToken } = await import('@/lib/shopify');
              const renewalRes = await renewCustomerToken(shopifyToken);
              if ('accessToken' in renewalRes) {
                token.shopifyToken = renewalRes.accessToken;
                token.shopifyTokenExpiresAt = renewalRes.expiresAt;
                debug.step('jwt_token_renewal_success', 'Successfully renewed Shopify customer token', {
                  newExpiresAt: renewalRes.expiresAt
                });
                await debug.commit(token.email || undefined);
              } else {
                debug.step('jwt_token_renewal_failed', 'Shopify token renewal returned errors', renewalRes.errors);
                await debug.commit(token.email || undefined);
              }
            }
          }
        }
      } catch (e) {
        debug.error('jwt_error', e);
        await debug.commit(token.email || undefined);
      }
      return token;
    },

    async session({ session, token }: SessionCallbackParams) {
      const debug = createDebug('nextauth-session');
      try {
        (session as Session & { shopifyToken?: string | null; customerId?: string | null }).shopifyToken = token.shopifyToken;
        (session as Session & { shopifyToken?: string | null; customerId?: string | null }).customerId = token.customerId;
        debug.step('session_set_shopify_token', 'Session callback set shopifyToken and customerId', {
          hasToken: !!token.shopifyToken,
          hasCustomerId: !!token.customerId
        });
      } catch (e) {
        debug.error('session_error', e);
      }
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      const debug = createDebug('nextauth-events-signout');
      const shopifyToken = (token as AppAuthToken).shopifyToken;
      if (shopifyToken) {
        try {
          debug.step('signout_token_delete', 'Deleting customerAccessToken from Shopify', { shopifyToken });
          const { logoutCustomer } = await import('@/lib/shopify');
          const deleted = await logoutCustomer(shopifyToken);
          debug.step('signout_token_delete_result', 'Shopify signout result', { deleted });
        } catch (e) {
          debug.error('signout_token_delete_error', e);
        }
      }
    }
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET,
};

export default authOptions;
