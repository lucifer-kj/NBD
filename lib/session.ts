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

export function getCookieDomain(host: string | null): string | undefined {
  if (!host) return undefined;
  const hostname = host.split(':')[0];
  
  if (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.endsWith('.local')
  ) {
    return undefined;
  }
  
  if (hostname.endsWith('naazbook.in')) {
    return '.naazbook.in';
  }
  
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    const suffix = parts.slice(-2).join('.');
    if (suffix === 'vercel.app') {
      return undefined;
    }
    return `.${suffix}`;
  }
  
  return undefined;
}

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

export async function createSession(customerId: string, accessToken?: string, email?: string, idToken?: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encryptSession({ customerId, accessToken: accessToken || null, idToken: idToken || null, email: email || null, expiresAt } as SessionPayload);
  
  const cookieStore = await cookies();
  const hostHeader = (await headers()).get('host');
  const domain = getCookieDomain(hostHeader);

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
    ...(domain ? { domain } : {}),
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

  const hostHeader = (await headers()).get('host');
  const domain = getCookieDomain(hostHeader);

  cookieStore.set('session', newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
    ...(domain ? { domain } : {}),
  });
  
  return payload;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const hostHeader = (await headers()).get('host');
  const domain = getCookieDomain(hostHeader);
  
  // Clear host-only
  cookieStore.set('session', '', { path: '/', maxAge: 0 });
  cookieStore.set('customerAccessToken', '', { path: '/', maxAge: 0 });
  
  // Clear wildcard
  if (domain) {
    cookieStore.set('session', '', { path: '/', maxAge: 0, domain });
    cookieStore.set('customerAccessToken', '', { path: '/', maxAge: 0, domain });
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  return await decryptSession(session);
}

