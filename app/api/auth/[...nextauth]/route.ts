import NextAuth from 'next-auth';
import { getAuthOptions } from '@/lib/nextauth-config';
import { NextRequest } from 'next/server';

const handler = async (req: NextRequest, ctx: any) => {
  const options = await getAuthOptions();
  return await NextAuth(req, ctx, options);
};

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
