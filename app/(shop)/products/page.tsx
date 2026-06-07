import React from 'react'
import { getProducts } from "@/lib/shopify"
import ProductsClient from "@/components/shop/ProductsClient"
import { Metadata } from 'next'
import { ReshapedProduct } from "@/types/shopify"

export const metadata: Metadata = {
  title: 'All Products | Naaz Book Depot',
  description: 'Browse our complete catalog of authentic Quran copies, stands (rehals), classical Islamic books, scholarly works, and accessories at Naaz Book Depot Kolkata.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
  },
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

  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading products...</div>}>
      <ProductsClient initialProducts={products} />
    </React.Suspense>
  )
}