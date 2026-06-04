import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getProduct, getProducts } from "@/lib/shopify"
import ProductDetailsClient from "@/components/product/ProductDetailsClient"
import ProductCard from "@/components/product-card"
import ProductReviews from "@/components/product/ProductReviews"
import { getProductReviewsServer } from "@/lib/url-helper"

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

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is required to generate product metadata');
  }
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

  const tags = product.tags?.map((t) => t.toLowerCase()) || [];
  if (tags.includes('books') || tags.includes('islamic books') || tags.includes('book')) {
    redirect(`/books/${product.handle}`);
  } else if (tags.includes('atar') || tags.includes('fragrance') || tags.includes('attar')) {
    redirect(`/atar/${product.handle}`);
  }

  // Fetch related products (e.g., from the same tags)
  const relatedProducts = await getProducts({
    query: product.tags?.length > 0 ? `tag:${product.tags[0]}` : "",
    first: 4
  }).then(products => products.filter(p => p.id !== product.id))

  const reviews = await getProductReviewsServer(product.id);
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "4.9";

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in';
  const baseSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

  const hasMultipleVariants = product.variants && product.variants.length > 1;
  const offersSchema = hasMultipleVariants
    ? {
        '@type': 'AggregateOffer',
        availability: product.availableForSale
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        priceCurrency: product.priceRange.minVariantPrice.currencyCode,
        highPrice: product.priceRange.maxVariantPrice.amount,
        lowPrice: product.priceRange.minVariantPrice.amount,
        offerCount: product.variants.length.toString(),
        url: `${baseSiteUrl}/products/${product.handle}`,
        priceValidUntil: '2027-12-31',
        seller: {
          '@type': 'Organization',
          name: 'Naaz Book Depot',
        },
      }
    : {
        '@type': 'Offer',
        availability: product.availableForSale
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        priceCurrency: product.priceRange.minVariantPrice.currencyCode,
        price: product.priceRange.minVariantPrice.amount,
        url: `${baseSiteUrl}/products/${product.handle}`,
        priceValidUntil: '2027-12-31',
        seller: {
          '@type': 'Organization',
          name: 'Naaz Book Depot',
        },
      };

  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: product.images?.length > 0
      ? product.images.map((img) => img.url)
      : [`${baseSiteUrl}/Images/Logo.png`],
    sku: product.variants?.[0]?.sku || product.id,
    mpn: product.variants?.[0]?.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Naaz Book Depot',
    },
    offers: offersSchema,
  };

  if (reviews.length > 0) {
    productJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviews.length.toString(),
      bestRating: '5',
      worstRating: '1',
    };
    productJsonLd.review = reviews.map(r => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.reviewer?.name || 'Verified Buyer',
      },
      datePublished: new Date(r.created_at).toISOString().split('T')[0],
      reviewBody: r.body,
      name: r.title,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      }
    }));
  }

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
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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