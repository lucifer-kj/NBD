import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCollectionByHandle, getCollections } from '@/lib/shopify';
import ProductCard from '@/components/product-card';
import Image from 'next/image';

type PageProps = {
  params: Promise<{ handle: string }>;
};

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    return {
      title: 'Collection Not Found | Naaz Book Depot',
      description: 'The requested collection could not be found.',
    };
  }

  const url = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/collections/${collection.handle}` 
    : `https://www.naazbook.in/collections/${collection.handle}`;

  return {
    title: `${collection.title} | Authentic Islamic Literature | Naaz Book Depot`,
    description: collection.description || `Explore our high-quality curation of ${collection.title} at Naaz Book Depot. Find authentic translations and beautiful prints.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: collection.title,
      description: collection.description || `Explore our high-quality curation of ${collection.title} at Naaz Book Depot.`,
      url,
      siteName: 'Naaz Book Depot',
      images: collection.image ? [{
        url: collection.image.url,
        width: collection.image.width || 800,
        height: collection.image.height || 800,
        alt: collection.image.altText || collection.title
      }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.title,
      description: collection.description || `Explore our high-quality curation of ${collection.title} at Naaz Book Depot.`,
      images: collection.image ? [collection.image.url] : [],
    }
  };
}

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({
    handle: collection.handle,
  }));
}

export default async function CollectionPage({ params }: PageProps) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Premium Gradient Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F3823] via-[#0A2618] to-[#05140C] text-white py-16 md:py-24 px-4">
        {/* Subtle Decorative Elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#E4B869_0%,transparent_50%)]" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[var(--islamic-gold)] opacity-5 blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            {/* Collection Image with Premium Framing */}
            {collection.image && (
              <div className="w-40 h-40 md:w-56 md:h-56 relative flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-[var(--islamic-gold)]/40 p-1 bg-white/5 backdrop-blur-md">
                <div className="w-full h-full relative rounded-xl overflow-hidden">
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 160px, 224px"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Collection Info */}
            <div className="flex-1 text-center md:text-left">
              <span className="text-[var(--islamic-gold)] uppercase tracking-widest text-xs md:text-sm font-semibold mb-3 inline-block">
                Exclusive Collection
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headings font-extrabold mb-4 bg-gradient-to-r from-white via-gray-100 to-[var(--islamic-gold)] bg-clip-text text-transparent">
                {collection.title}
              </h1>
              <div className="h-[2px] w-20 bg-[var(--islamic-gold)] mb-6 mx-auto md:mx-0 rounded" />
              {collection.description && (
                <p className="text-gray-300 text-base md:text-lg max-w-3xl font-light leading-relaxed">
                  {collection.description}
                </p>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200/60 pb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-headings font-bold text-[#0F3823]">
              Available Publications
            </h2>
            <p className="text-sm text-gray-500">
              Showing {collection.products.length} {collection.products.length === 1 ? 'item' : 'items'} in this category
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:inline">Sort options</span>
            <div className="relative">
              <select className="bg-white border border-gray-200/80 text-gray-700 py-2.5 px-4 pr-8 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)] appearance-none shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
                <option>Sort by: Best Sellers</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>New Arrivals</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {collection.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {collection.products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                showWishlist={true} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm max-w-xl mx-auto px-6">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-headings font-semibold text-gray-800 mb-1">Collection is Empty</h3>
            <p className="text-gray-500 text-sm mb-6">We are currently updating our catalog with beautiful publications. Please check back soon!</p>
            <a 
              href="/search"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0F3823] text-white hover:bg-[#0A2618] font-medium text-sm transition-colors shadow-sm"
            >
              Browse All Books
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
