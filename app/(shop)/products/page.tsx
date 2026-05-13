import React from 'react'
import { getProducts } from "@/lib/shopify"
import ProductsClient from "@/components/shop/ProductsClient"
import { Metadata } from 'next'
import { ReshapedProduct } from "@/types/shopify"

export const metadata: Metadata = {
  title: 'All Products | Naaz Book Depot',
  description: 'Explore our full collection of authentic Islamic literature, premium fragrances, and prayer essentials.',
}

export const revalidate = 3600;

export default async function ProductsPage() {
  // Fetch products on the server
  // This ensures environment variables are used correctly and prevents client-side exposure
  let products: ReshapedProduct[] = []
  try {
    products = await getProducts({ first: 100 })
  } catch (error) {
    console.error("Error fetching products on server:", error)
  }

  return <ProductsClient initialProducts={products} />
}