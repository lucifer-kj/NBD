"use server"

import { revalidateTag } from 'next/cache'
import { createCart, addToCart, removeFromCart, updateCart, shopifyFetch, reshapeCart } from './index'
import { cartFragment } from './fragments'
import { ReshapedCart } from '@/types/shopify'

export async function createCartAction() {
  return await createCart()
}

export async function addToCartAction(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  const updatedCart = await addToCart(cartId, lines)
  revalidateTag('cart')
  return updatedCart
}

export async function removeFromCartAction(cartId: string, lineIds: string[]) {
  const updatedCart = await removeFromCart(cartId, lineIds)
  revalidateTag('cart')
  return updatedCart
}

export async function updateCartAction(cartId: string, lines: { id: string; merchandiseId: string; quantity: number }[]) {
  const updatedCart = await updateCart(cartId, lines)
  revalidateTag('cart')
  return updatedCart
}

export async function getCartAction(cartId: string) {
  try {
    const res = await shopifyFetch<{ data: { cart: any } }>({
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
