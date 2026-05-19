import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProduct, getProducts } from "@/lib/shopify"
import ProductDetailsClient from "@/components/product/ProductDetailsClient"
import ProductCard from "@/components/product-card"
import ProductReviews from "@/components/product/ProductReviews"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in';
  const url = `${siteUrl}/products/${product.handle}`;

  return {
    metadataBase: new URL(siteUrl),
    title: `${product.title} | Naaz Book Depot`,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      url,
      siteName: 'Naaz Book Depot',
      images: product.images.map((img) => ({
        url: img.url,
        width: 800,
        height: 800,
        alt: img.altText || product.title,
      })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description.slice(0, 160),
      images: [product.featuredImage?.url || ''],
    },
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

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images[0]?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount,
    },
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Product Section */}
        <ProductDetailsClient product={product} />

        {/* Reviews Section */}
        <ProductReviews productId={product.id} productTitle={product.title} />

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