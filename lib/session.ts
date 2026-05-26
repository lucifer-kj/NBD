import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies, headers } from 'next/headers';

export interface SessionPayload extends JWTPayload {
  customerId: string;
  accessToken?: string | null;
  idToken?: string | null;
  email?: string | null;
  expiresAt: Date;
}

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error('SESSION_SECRET is required in environment variables.');
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decryptSession(session: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCookieDomain(): Promise<string | undefined> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const domainOnly = host.split(':')[0]; // Strip port if any

    if (domainOnly.includes('localhost') || domainOnly.includes('127.0.0.1')) {
      return undefined;
    }

    // Explicitly exclude Vercel and Netlify public suffix preview/deployment domains
    if (domainOnly.endsWith('.vercel.app') || domainOnly.endsWith('.netlify.app')) {
      return undefined;
    }

    const parts = domainOnly.split('.');
    if (parts.length >= 2) {
      // Return base domain prefixed with dot (e.g. '.naazbook.in')
      return `.${parts.slice(-2).join('.')}`;
    }
  } catch (error) {
    console.error('Error getting cookie domain:', error);
  }
  return undefined;
}

export async function createSession(_customerId: string, _accessToken?: string, _email?: string, _idToken?: string) {
  // Unification: No-op. Session is managed entirely via NextAuth JWE cookies.
  void _customerId;
  void _accessToken;
  void _email;
  void _idToken;
}

export async function updateSession(): Promise<SessionPayload | null> {
  // Unification: No-op. Session is managed entirely via NextAuth JWE cookies.
  return null;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const domain = await getCookieDomain();
  
  if (domain) {
    cookieStore.delete({ name: 'session', domain, path: '/' });
    cookieStore.delete({ name: 'customerAccessToken', domain, path: '/' });
  } else {
    cookieStore.delete('session');
    cookieStore.delete('customerAccessToken');
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  // Unification: Decrypt secure NextAuth JWE session cookie directly.
  // This completely bypasses getServerSession protocol-sniffing proxy issues.
  try {
    const { decode } = await import('next-auth/jwt');
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    const cookieName = isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
    const tokenCookie = cookieStore.get(cookieName)?.value;

    if (!tokenCookie) {
      return null;
    }

    const decrypted = await decode({
      token: tokenCookie,
      secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || '',
    });

    if (decrypted && decrypted.shopifyToken && decrypted.customerId) {
      return {
        customerId: decrypted.customerId as string,
        accessToken: decrypted.shopifyToken as string,
        email: (decrypted.email as string) || null,
        expiresAt: new Date(typeof decrypted.exp === 'number' ? decrypted.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000)
      } as SessionPayload;
    }
  } catch (e) {
    console.error('Error decrypting next-auth session cookie:', e);
  }
  return null;
}

