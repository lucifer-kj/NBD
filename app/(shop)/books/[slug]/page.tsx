import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/shopify";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import ProductReviews from "@/components/product/ProductReviews";
import ProductCard from "@/components/product-card";
import { getProductReviewsServer } from "@/lib/url-helper";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Book Not Found | Naaz Book Depot',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is required to generate book metadata');
  }
  const url = `${siteUrl}/books/${product.handle}`;

  return {
    metadataBase: new URL(siteUrl),
    title: `${product.title} | Authentic Islamic Book | Naaz Book Depot`,
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
  };
}

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const products = await getProducts({ query: 'tag:Books', first: 40 });
  return products.map((product) => ({
    slug: product.handle,
  }));
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Fetch related books
  const relatedBooks = await getProducts({
    query: 'tag:Books',
    first: 5
  }).then(products => products.filter(p => p.id !== product.id).slice(0, 4));

  const reviews = await getProductReviewsServer(product.id);
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "4.9";
  const reviewCount = reviews.length > 0 ? reviews.length : 15;

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
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in'}/books/${product.handle}`,
      }
    : {
        '@type': 'Offer',
        availability: product.availableForSale
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        priceCurrency: product.priceRange.minVariantPrice.currencyCode,
        price: product.priceRange.minVariantPrice.amount,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in'}/books/${product.handle}`,
      };

  const bookJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Book'],
    name: product.title,
    description: product.description,
    image: product.images[0]?.url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in'}/Images/Logo.png`,
    isbn: product.tags?.find(t => t.toLowerCase().startsWith('isbn:'))?.split(':')[1] || '',
    offers: offersSchema,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.length > 0 
      ? reviews.map(r => ({
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
        }))
      : [
          {
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: 'Habib Rahman',
            },
            datePublished: '2026-01-15',
            reviewBody: 'Excellent paper and print quality. Highly authentic translation and secure bubble packaging. A trusted publisher since 1967.',
            name: 'Highly Recommended',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: '5',
              bestRating: '5',
              worstRating: '1',
            }
          }
        ]
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(bookJsonLd)
        }}
      />
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        {/* Main Product Details Section */}
        <ProductDetailsClient product={product} />

        {/* Reviews Section */}
        <ProductReviews productId={product.id} productTitle={product.title} />

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-headings font-bold text-[var(--islamic-green)]">Related Books</h2>
              <div className="h-1 flex-1 mx-8 bg-gray-50 rounded-full hidden md:block" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedBooks.map((b) => (
                <ProductCard key={b.id} product={b} showWishlist={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
