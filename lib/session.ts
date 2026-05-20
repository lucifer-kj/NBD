import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies, headers } from 'next/headers';

export interface SessionPayload extends JWTPayload {
  customerId: string;
  accessToken?: string | null;
  idToken?: string | null;
  email?: string | null;
  expiresAt: Date;
}

const secretKey = process.env.SESSION_SECRET || 'fallback_secret_key_for_development_only';
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

export async function createSession(customerId: string, accessToken?: string, email?: string, idToken?: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encryptSession({ customerId, accessToken: accessToken || null, idToken: idToken || null, email: email || null, expiresAt } as SessionPayload);
  
  const cookieStore = await cookies();
  const domain = await getCookieDomain();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
    domain,
  });
}

export async function updateSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const payload = await decryptSession(session);

  if (!session || !payload) {
    return null;
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const newSession = await encryptSession({ ...payload, expiresAt });
  const domain = await getCookieDomain();

  cookieStore.set('session', newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
    domain,
  });
  
  return payload;
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
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  return await decryptSession(session);
}

