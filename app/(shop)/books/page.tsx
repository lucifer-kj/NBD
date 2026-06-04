import React from 'react';
import ProductCard from '@/components/product-card';
import { getProducts } from '@/lib/shopify';
import { ReshapedProduct } from '@/types/shopify';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentic Islamic Books & Quran Editions | Naaz Book Depot Store',
  description: 'Buy authentic Islamic books online in India. Wide selection of Quran, Hadith, Tafsir, and Islamic literature from India\'s trusted publishing house since 1967.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/books`,
  },
};

export const revalidate = 3600;

export default async function BooksPage() {
  let books: ReshapedProduct[] = [];
  try {
    // Fetch products with "Books" tag or from a "Books" collection
    // For now, we'll fetch all and filter, or just fetch with a query
    books = await getProducts({ 
      query: 'tag:"Islamic Books" OR tag:Books',
      first: 50 
    });
  } catch (error) {
    console.error("Error fetching books from Shopify:", error);
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-headings font-bold text-[var(--islamic-green)] mb-4">Islamic Library</h1>
        <div className="h-1 w-24 bg-[var(--islamic-gold)] rounded mx-auto mb-6" />
        <p className="text-lg text-[var(--charcoal)]/70 max-w-2xl mx-auto font-light">
          Discover our curated collection of essential texts, from the Holy Qur&apos;an to Hadith collections and scholarly commentaries.
        </p>
      </div>
      
      {/* Filters & Grid */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-[#F8F6F3] p-6 rounded-2xl sticky top-24 border border-gray-100">
            <h3 className="font-headings font-bold text-xl text-[var(--islamic-green)] mb-4">Categories</h3>
            <ul className="space-y-3 text-[var(--charcoal)]/80">
              <li className="flex items-center gap-2 hover:text-[var(--islamic-gold)] cursor-pointer transition-colors">
                <span className="w-2 h-2 rounded-full bg-[var(--islamic-gold)]" />
                Quran & Tafseer
              </li>
              <li className="flex items-center gap-2 hover:text-[var(--islamic-gold)] cursor-pointer transition-colors">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                Hadith
              </li>
              <li className="flex items-center gap-2 hover:text-[var(--islamic-gold)] cursor-pointer transition-colors">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                Fiqh
              </li>
              <li className="flex items-center gap-2 hover:text-[var(--islamic-gold)] cursor-pointer transition-colors">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                History
              </li>
            </ul>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[var(--charcoal)]/60 text-sm">Showing {books.length} resources</span>
            <select className="bg-white border text-sm border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)]">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>
          
          {books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {books.map((book) => (
                <ProductCard 
                  key={book.id}
                  product={book}
                  showWishlist={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500">No books found in the collection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
