"use server"

import type { NextAuthOptions, Session } from 'next-auth';
import { revalidateTag } from 'next/cache'
import { createCart, addToCart, removeFromCart, updateCart, shopifyFetch, reshapeCart } from './index'
import { cartFragment } from './fragments'
import { Cart } from '@/types/shopify'

export async function createCartAction() {
  return await createCart()
}

export async function addToCartAction(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  const result = await addToCart(cartId, lines)
  revalidateTag('cart')
  return result
}

export async function removeFromCartAction(cartId: string, lineIds: string[]) {
  const result = await removeFromCart(cartId, lineIds)
  revalidateTag('cart')
  return result
}

export async function updateCartAction(cartId: string, lines: { id: string; merchandiseId: string; quantity: number }[]) {
  const result = await updateCart(cartId, lines)
  revalidateTag('cart')
  return result
}

export async function getCartAction(cartId: string) {
  try {
    const res = await shopifyFetch<{ data: { cart: Cart } }>({
      query: `
        query getCart($cartId: ID!) {
          cart(id: $cartId) {
            ...cart
          }
        }
        ${cartFragment}
      `,
      variables: { cartId },
      cache: 'no-store'
    });

    if (res.body.data.cart) {
      return reshapeCart(res.body.data.cart);
    }
    return null;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}
export async function updateCartDiscountAction(cartId: string, discountCodes: string[]) {
  const { updateCartDiscount, reshapeCart } = await import('./index')
  const cart = await updateCartDiscount(cartId, discountCodes)
  revalidateTag('cart')
  return { cart: reshapeCart(cart) }
}

export async function updateCartBuyerIdentityAction(cartId: string, email?: string) {
  const { getSession } = await import('@/lib/session')
  const { updateCartBuyerIdentity } = await import('./index')
  const session = await getSession()
  // Try NextAuth server session as a fallback
  let nextAuthEmail: string | undefined;
  try {
    const { getServerSession } = await import('next-auth');
    const authOptions = (await import('@/lib/nextauth-config')).authOptions as NextAuthOptions;
    const nextAuthSession = (await getServerSession(authOptions)) as Session | null;
    if (nextAuthSession?.user?.email) nextAuthEmail = nextAuthSession.user.email;
  } catch {
    // ignore — best-effort
  }
  
  const buyerEmail = email || session?.email || nextAuthEmail || undefined
  const customerAccessToken = session?.accessToken || undefined
  
  if (!buyerEmail && !customerAccessToken) return { error: 'No email or token available to identify buyer' }
  
  try {
    const cart = await updateCartBuyerIdentity(cartId, { 
      email: buyerEmail,
      ...(customerAccessToken ? { customerAccessToken } : {})
    })
    revalidateTag('cart')
    return { cart }
  } catch (error) {
    console.error('Error updating cart buyer identity:', error)
    return { error: 'Failed to update buyer identity' }
  }
}

export async function createAddressAction(address: unknown) {
  const { getSession } = await import('@/lib/session')
  const { createCustomerAddressAdmin } = await import('./admin')
  const session = await getSession()
  
  if (!session) return { error: 'Not authenticated' }
  
  const { customerId } = session
  
  if (customerId) {
    return await createCustomerAddressAdmin(customerId, address)
  }
  
  return { error: 'Failed to create address' }
}

export async function updateAddressAction(id: string, address: unknown) {
  const { getSession } = await import('@/lib/session')
  const { updateCustomerAddressAdmin } = await import('./admin')
  const session = await getSession()
  
  if (!session) return { error: 'Not authenticated' }
  
  const { customerId } = session
  
  if (customerId) {
    return await updateCustomerAddressAdmin(customerId, id, address)
  }
  
  return { error: 'Failed to update address' }
}

export async function deleteAddressAction(id: string) {
  const { getSession } = await import('@/lib/session')
  const { deleteCustomerAddressAdmin } = await import('./admin')
  const session = await getSession()
  
  if (!session) return { error: 'Not authenticated' }
  
  const { customerId } = session
  
  if (customerId) {
    return await deleteCustomerAddressAdmin(customerId, id)
  }
  
  return { error: 'Failed to delete address' }
}

export async function updateDefaultAddressAction(addressId: string) {
  const { getSession } = await import('@/lib/session')
  const { updateDefaultAddressAdmin } = await import('./admin')
  const session = await getSession()
  
  if (!session) return { error: 'Not authenticated' }
  
  const { customerId } = session
  
  if (customerId) {
    return await updateDefaultAddressAdmin(customerId, addressId)
  }
  
  return { error: 'Failed to update default address' }
}

export async function getOrderAction(orderId: string) {
  try {
    const { getSession } = await import('@/lib/session')
    const { getOrderById } = await import('./admin')
    const session = await getSession()
    
    if (!session) return null
    
    return await getOrderById(orderId)
  } catch (error) {
    console.error('Error in getOrderAction:', error);
    return null;
  }
}

export async function getSessionAction() {
  try {
    const { getSession } = await import('@/lib/session');
    return await getSession();
  } catch (error) {
    console.error('Error in getSessionAction:', error);
    return null;
  }
}

