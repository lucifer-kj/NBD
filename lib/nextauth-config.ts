import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import { loginShopifyCustomer, getOrCreateShopifyCustomer } from '@/lib/shopify/customer';
import { createDebug } from './auth-debug';

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
      async authorize(credentials) {
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
          debug.step('credentials_authorize_success', 'Shopify login succeeded');
          return { email, shopifyToken: token } as any;
        } catch (e) {
          debug.error('credentials_authorize_error', e);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      const debug = createDebug('nextauth-jwt');
      try {
        if (account && user) {
          debug.step('jwt_on_signin', 'JWT callback on sign-in', { provider: account.provider });

          if (account.provider === 'google') {
            const email = (user as any).email as string | undefined;
            const name = (user as any).name as string | undefined;
            if (email) {
              debug.step('jwt_google_bridge', 'Creating or fetching Shopify customer for Google user', { email });
              const shopifyToken = await getOrCreateShopifyCustomer({ email, firstName: name?.split(' ')[0] });
              token.shopifyToken = shopifyToken;
            }
          }

          if (account.provider === 'credentials') {
            token.shopifyToken = (user as any).shopifyToken;
          }
        }
      } catch (e) {
        debug.error('jwt_error', e);
      }
      return token;
    },

    async session({ session, token }) {
      const debug = createDebug('nextauth-session');
      try {
        (session as any).shopifyToken = (token as any).shopifyToken;
        debug.step('session_set_shopify_token', 'Session callback set shopifyToken', { hasToken: !!(token as any).shopifyToken });
      } catch (e) {
        debug.error('session_error', e);
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET,
};

export default authOptions;
