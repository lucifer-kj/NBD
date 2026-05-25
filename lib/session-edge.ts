import { jwtVerify, JWTPayload } from 'jose';

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
