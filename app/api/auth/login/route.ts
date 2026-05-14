import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { loginCustomer, updateCartBuyerIdentity, getCustomerDetails, getCart, addToCart, setCustomerCart } from '@/lib/shopify';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password, cartId } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const response = await loginCustomer({ email, password });

    if ('errors' in response) {
      return NextResponse.json(
        { error: response.errors[0] || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const { accessToken, expiresAt } = response;

    // Get customer ID and email for session
    const customer = await getCustomerDetails(accessToken);
    if (customer) {
      const { createSession } = await import('@/lib/session');
      await createSession(customer.id, accessToken, email);
    }

    // Set secure HTTP-only cookie (legacy support)
    (await cookies()).set('customerAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiresAt)
    });

    // If there's an active cart, link the buyer identity and merge old items
    if (cartId) {
      try {
        // 1. Get customer details and their preferred cart ID
        const customer = await getCustomerDetails(accessToken);
        
        if (customer) {
          const oldCartId = customer.cart_id?.value;
          
          // 2. If they have an old cart, merge its lines into the guest cart
          if (oldCartId && oldCartId !== cartId) {
            const oldCart = await getCart(oldCartId);
            if (oldCart && oldCart.lines.length > 0) {
              const linesToMerge = oldCart.lines.map(line => ({
                merchandiseId: line.merchandise.id,
                quantity: line.quantity
              }));
              
              await addToCart(cartId, linesToMerge);
            }
          }
          
          // 3. Update the guest cart (now merged) with the buyer's identity
          await updateCartBuyerIdentity(cartId, accessToken, email);
          
          // 4. Persist this cart ID as the new preferred cart for the customer
          await setCustomerCart(customer.id, cartId);
        }
      } catch (e) {
        console.error('Failed to link or merge cart:', e);
        // We don't want to fail the login if cart linking/merging fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
