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
  const { getSession } = await import('@/lib/session')
  const { updateCartBuyerIdentity } = await import('./index')
  const session = await getSession()
  const token = session?.accessToken
  
  if (!token) return { error: 'Not authenticated for Storefront API operations' }
  
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
  const { getSession } = await import('@/lib/session')
  const { createCustomerAddress } = await import('./index')
  const { createCustomerAddressAdmin } = await import('./admin')
  const session = await getSession()
  
  if (!session) return { error: 'Not authenticated' }
  
  const { customerId, accessToken } = session
  
  if (accessToken) {
    try {
      return await createCustomerAddress(accessToken, address)
    } catch (e) {
      console.error('Storefront address creation failed, trying Admin:', e)
    }
  }
  
  if (customerId) {
    return await createCustomerAddressAdmin(customerId, address)
  }
  
  return { error: 'Failed to create address' }
}

export async function updateAddressAction(id: string, address: unknown) {
  const { getSession } = await import('@/lib/session')
  const { updateCustomerAddress } = await import('./index')
  const { updateCustomerAddressAdmin } = await import('./admin')
  const session = await getSession()
  
  if (!session) return { error: 'Not authenticated' }
  
  const { customerId, accessToken } = session
  
  if (accessToken) {
    try {
      return await updateCustomerAddress(accessToken, id, address)
    } catch (e) {
      console.error('Storefront address update failed, trying Admin:', e)
    }
  }
  
  if (customerId) {
    return await updateCustomerAddressAdmin(customerId, id, address)
  }
  
  return { error: 'Failed to update address' }
}

export async function deleteAddressAction(id: string) {
  const { getSession } = await import('@/lib/session')
  const { deleteCustomerAddress } = await import('./index')
  const { deleteCustomerAddressAdmin } = await import('./admin')
  const session = await getSession()
  
  if (!session) return { error: 'Not authenticated' }
  
  const { customerId, accessToken } = session
  
  if (accessToken) {
    try {
      return await deleteCustomerAddress(accessToken, id)
    } catch (e) {
      console.error('Storefront address deletion failed, trying Admin:', e)
    }
  }
  
  if (customerId) {
    return await deleteCustomerAddressAdmin(customerId, id)
  }
  
  return { error: 'Failed to delete address' }
}

export async function updateDefaultAddressAction(addressId: string) {
  const { getSession } = await import('@/lib/session')
  const { updateDefaultAddress } = await import('./index')
  const { updateDefaultAddressAdmin } = await import('./admin')
  const session = await getSession()
  
  if (!session) return { error: 'Not authenticated' }
  
  const { customerId, accessToken } = session
  
  if (accessToken) {
    try {
      return await updateDefaultAddress(accessToken, addressId)
    } catch (e) {
      console.error('Storefront default address update failed, trying Admin:', e)
    }
  }
  
  if (customerId) {
    return await updateDefaultAddressAdmin(customerId, addressId)
  }
  
  return { error: 'Failed to update default address' }
}

export async function getOrderAction(orderId: string) {
  const { getSession } = await import('@/lib/session')
  const { getOrder } = await import('./index')
  const { getOrderById } = await import('./admin')
  const session = await getSession()
  
  if (!session) return null
  
  const { accessToken } = session
  
  if (accessToken) {
    try {
      const order = await getOrder(accessToken, orderId)
      if (order) return order
    } catch (e) {
      console.error('Storefront getOrder failed, trying Admin:', e)
    }
  }
  
  return await getOrderById(orderId)
}
