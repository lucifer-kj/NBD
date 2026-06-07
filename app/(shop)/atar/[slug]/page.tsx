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
      title: 'Attar Not Found | Naaz Book Depot',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is required to generate atar metadata');
  }
  const url = `${siteUrl}/atar/${product.handle}`;

  return {
    metadataBase: new URL(siteUrl),
    title: `${product.title} | Premium Alcohol-Free Attar | Naaz Book Depot`,
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
  const products = await getProducts({ query: 'tag:Atar OR tag:Fragrance', first: 40 });
  return products.map((product) => ({
    slug: product.handle,
  }));
}

export default async function AtarDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Fetch related fragrances
  const relatedAtars = await getProducts({
    query: 'tag:Atar OR tag:Fragrance',
    first: 5
  }).then(products => products.filter(p => p.id !== product.id).slice(0, 4));

  const reviews = await getProductReviewsServer(product.id);
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "4.9";

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
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in'}/atar/${product.handle}`,
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
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in'}/atar/${product.handle}`,
        priceValidUntil: '2027-12-31',
        seller: {
          '@type': 'Organization',
          name: 'Naaz Book Depot',
        },
      };

  const atarJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images[0]?.url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in'}/Images/Logo.png`,
    offers: offersSchema,
  };

  if (reviews.length > 0) {
    atarJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviews.length.toString(),
      bestRating: '5',
      worstRating: '1',
    };
    atarJsonLd.review = reviews.map(r => ({
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
          __html: JSON.stringify(atarJsonLd)
        }}
      />
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        {/* Main Product Details Section */}
        <ProductDetailsClient product={product} reviews={reviews} />

        {/* Reviews Section */}
        <ProductReviews productId={product.id} productTitle={product.title} />

        {/* Related Fragrances */}
        {relatedAtars.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-headings font-bold text-[var(--islamic-green)]">Related Fragrances</h2>
              <div className="h-1 flex-1 mx-8 bg-gray-50 rounded-full hidden md:block" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedAtars.map((a) => (
                <ProductCard key={a.id} product={a} showWishlist={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
