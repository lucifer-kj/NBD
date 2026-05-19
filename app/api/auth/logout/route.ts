import { NextResponse } from 'next/server';
import { deleteSession, getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  const idToken = session?.idToken; // Note: We might need to store idToken if Shopify requires it for logout

  await deleteSession();

  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const postLogoutRedirectUri = `${baseUrl}/`;

  let accountUrl = process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL || 'https://shopify.com/70963200109';
  if (accountUrl.includes('shopify.com/3xbr00-f7')) {
    accountUrl = accountUrl.replace('shopify.com/3xbr00-f7', 'shopify.com/70963200109');
  }

  const isCustomDomain = !accountUrl.includes('shopify.com');
  const logoutUrl = new URL(
    isCustomDomain 
      ? `${accountUrl}/authentication/logout` 
      : `${accountUrl}/auth/logout`
  );
  
  if (idToken) {
    logoutUrl.searchParams.append('id_token_hint', idToken);
  } else if (clientId) {
    logoutUrl.searchParams.append('client_id', clientId);
  }
  
  logoutUrl.searchParams.append('post_logout_redirect_uri', postLogoutRedirectUri);

  return NextResponse.redirect(logoutUrl.toString());
}
