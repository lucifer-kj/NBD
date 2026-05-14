"use server"

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

export async function updateCartBuyerIdentityAction(cartId: string, email: string) {
  const { cookies } = await import('next/headers')
  const { updateCartBuyerIdentity } = await import('./index')
  const token = (await cookies()).get('customerAccessToken')?.value
  
  if (!token) return { error: 'Not authenticated' }
  
  try {
    const cart = await updateCartBuyerIdentity(cartId, token, email)
    revalidateTag('cart')
    return { cart }
  } catch (error) {
    console.error('Error updating cart buyer identity:', error)
    return { error: 'Failed to update buyer identity' }
  }
}

export async function createAddressAction(address: unknown) {
  const { cookies } = await import('next/headers')
  const { createCustomerAddress } = await import('./index')
  const token = (await cookies()).get('customerAccessToken')?.value
  if (!token) return { error: 'Not authenticated' }
  return await createCustomerAddress(token, address)
}

export async function updateAddressAction(id: string, address: unknown) {
  const { cookies } = await import('next/headers')
  const { updateCustomerAddress } = await import('./index')
  const token = (await cookies()).get('customerAccessToken')?.value
  if (!token) return { error: 'Not authenticated' }
  return await updateCustomerAddress(token, id, address)
}

export async function deleteAddressAction(id: string) {
  const { cookies } = await import('next/headers')
  const { deleteCustomerAddress } = await import('./index')
  const token = (await cookies()).get('customerAccessToken')?.value
  if (!token) return { error: 'Not authenticated' }
  return await deleteCustomerAddress(token, id)
}

export async function updateDefaultAddressAction(addressId: string) {
  const { cookies } = await import('next/headers')
  const { updateDefaultAddress } = await import('./index')
  const token = (await cookies()).get('customerAccessToken')?.value
  if (!token) return { error: 'Not authenticated' }
  return await updateDefaultAddress(token, addressId)
}

export async function getOrderAction(orderId: string) {
  const { cookies } = await import('next/headers')
  const { getOrder } = await import('./index')
  const token = (await cookies()).get('customerAccessToken')?.value
  if (!token) return null
  return await getOrder(token, orderId)
}
