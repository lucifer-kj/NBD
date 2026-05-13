import React from 'react';
import ProductCard from '@/components/product-card';
import { getProducts } from '@/lib/shopify';
import { ReshapedProduct } from '@/types/shopify';

export const metadata = {
  title: 'Premium Atar Selection | Naaz Book Depot',
  description: 'Experience our exclusive collection of non-alcoholic premium fragrances.',
};

export default async function AtarPage() {
  let atars: ReshapedProduct[] = [];
  try {
    // Fetch products with "Atar" tag or from an "Atar" collection
    atars = await getProducts({ 
      query: 'tag:Atar OR tag:Fragrance',
      first: 50 
    });
  } catch (error) {
    console.error("Error fetching atars from Shopify:", error);
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-headings font-bold text-[var(--islamic-green)] mb-4">Premium Fragrances</h1>
        <div className="h-1 w-24 bg-[var(--islamic-gold)] rounded mx-auto mb-6" />
        <p className="text-lg text-[var(--charcoal)]/70 max-w-2xl mx-auto font-light">
          Experience the essence of Islamic heritage with our hand-curated, 100% alcohol-free premium attars.
        </p>
      </div>
      
      {/* Product Grid */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[var(--charcoal)]/60 text-sm">Showing {atars.length} exquisite blends</span>
        <select className="bg-white border text-sm border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)]">
          <option>Sort by: Best Sellers</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest Arrivals</option>
        </select>
      </div>
      
      {atars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {atars.map((atar) => (
            <ProductCard 
              key={atar.id}
              product={atar}
              showWishlist={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500">No fragrances found in the collection.</p>
        </div>
      )}
    </div>
  );
}
