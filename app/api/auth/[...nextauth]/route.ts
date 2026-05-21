import NextAuth from 'next-auth';
import authOptions from '@/lib/nextauth-config';

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
