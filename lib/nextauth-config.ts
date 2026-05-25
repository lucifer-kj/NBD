import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions, User, Session, Account } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { loginShopifyCustomer, getOrCreateShopifyCustomer } from '@/lib/shopify/customer';
import { createDebug } from './auth-debug';
import { createSession } from './session';

type AppAuthUser = User & {
  shopifyToken?: string | null;
  customerId?: string | null;
};

type AppAuthToken = JWT & {
  shopifyToken?: string | null;
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
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AppAuthUser | null> {
        const debug = createDebug('nextauth-credentials');
        try {
          if (!credentials) return null;
          const { email, password } = credentials as { email: string; password: string };
          debug.step('credentials_authorize', 'Authorize called for credentials', { emailPresent: !!email });
          const token = await loginShopifyCustomer(email, password);
          if (!token) {
            debug.step('credentials_authorize_failed', 'Shopify login failed for credentials');
            return null;
          }
          
          // Get the Shopify customer ID to store in NextAuth session
          const { getCustomerDetails } = await import('@/lib/shopify');
          const customer = await getCustomerDetails(token);
          const customerId = customer?.id || null;

          debug.step('credentials_authorize_success', 'Shopify login succeeded', { customerId });
          return { 
            id: email, 
            email, 
            shopifyToken: token, 
            customerId,
            name: customer?.firstName || null
          };
        } catch (e) {
          debug.error('credentials_authorize_error', e);
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
              const shopifyToken = await getOrCreateShopifyCustomer({ email, firstName: name?.split(' ')[0] });
              token.shopifyToken = shopifyToken;

              // Get the Shopify customer ID to store in NextAuth session
              if (shopifyToken) {
                const { getCustomerDetails } = await import('@/lib/shopify');
                const customer = await getCustomerDetails(shopifyToken);
                token.customerId = customer?.id || null;

                if (customer?.id) {
                  debug.step('jwt_google_create_session', 'Creating custom session cookie for Google sign-in', {
                    customerId: customer.id,
                    hasToken: !!shopifyToken,
                  });
                  await createSession(customer.id, shopifyToken, email);
                }
              }
            }
          }

          if (account.provider === 'credentials') {
            token.shopifyToken = authUser.shopifyToken ?? null;
            token.customerId = authUser.customerId ?? null;

            if (token.shopifyToken && token.customerId) {
              debug.step('jwt_credentials_create_session', 'Creating custom session cookie for credentials sign-in', {
                customerId: token.customerId,
              });
              await createSession(token.customerId, token.shopifyToken, authUser.email ?? undefined);
            }
          }
        }
      } catch (e) {
        debug.error('jwt_error', e);
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

  secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET,
};

export default authOptions;
