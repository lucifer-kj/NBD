import { NextResponse } from 'next/server';
import { deleteSession, getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  const idToken = session?.idToken; // Note: We might need to store idToken if Shopify requires it for logout

  await deleteSession();

  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const postLogoutRedirectUri = `${baseUrl}/`;

  // The logout URL for Customer Account API
  const logoutUrl = new URL(`https://shopify.com/3xbr00-f7/auth/logout`);
  
  if (idToken) {
    logoutUrl.searchParams.append('id_token_hint', idToken);
  } else if (clientId) {
    logoutUrl.searchParams.append('client_id', clientId);
  }
  
  logoutUrl.searchParams.append('post_logout_redirect_uri', postLogoutRedirectUri);

  return NextResponse.redirect(logoutUrl.toString());
}
