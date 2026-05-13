import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getProduct, getProducts } from "@/lib/shopify"
import ProductDetailsClient from "@/components/product/ProductDetailsClient"
import ProductCard from "@/components/product-card"
import ProductReviews from "@/components/product/ProductReviews"
import { Star } from "lucide-react"
import { cookies } from "next/headers"
import { getCustomerDetails } from "@/lib/shopify"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.title} | Naaz Book Depot`,
    description: product.description.slice(0, 160),
  }
}

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const products = await getProducts({ first: 20 });
  return products.map((product) => ({
    slug: product.handle,
  }));
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Fetch related products (e.g., from the same tags)
  const relatedProducts = await getProducts({
    query: product.tags?.length > 0 ? `tag:${product.tags[0]}` : "",
    first: 4
  }).then(products => products.filter(p => p.id !== product.id))

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Product Section */}
        <ProductDetailsClient product={product} />

        {/* Product Details Tabs / Sections */}
        <div className="mt-20 pt-10 border-t border-gray-100">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-headings font-bold text-[var(--islamic-green)] mb-6">Product Details</h2>
            <div className="prose prose-sm md:prose-base text-gray-600 max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-headings font-bold text-[var(--islamic-green)]">Related Products</h2>
              <div className="h-1 flex-1 mx-8 bg-gray-50 rounded-full hidden md:block" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} showWishlist={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}