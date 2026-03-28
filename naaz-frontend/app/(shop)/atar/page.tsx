import React from 'react';
import AtarCard from '@/components/catalog/AtarCard';

export const metadata = {
  title: 'Premium Atar Selection | Naaz Book Depot',
  description: 'Experience our exclusive collection of non-alcoholic premium fragrances.',
};

export default async function AtarPage() {
  let atars = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/atar/`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      atars = data.items || data;
    }
  } catch (error) {
    console.warn("Backend API not reachable. Falling back to dummy data for UI preview.");
  }
  
  if (!atars || atars.length === 0) {
    atars = [
      { id: 1, name: 'Royal Oudh', slug: 'royal-oudh', top_notes: 'Agarwood, Rose, Amber', variants: [{ id: 11, volume_ml: 12, price: 1200 }] },
      { id: 2, name: 'Amber Rose', slug: 'amber-rose', top_notes: 'Damascus Rose, Vanilla', variants: [{ id: 12, volume_ml: 6, price: 550 }] },
      { id: 3, name: 'Majestic Musk', slug: 'majestic-musk', top_notes: 'White Musk, Sandalwood', variants: [{ id: 13, volume_ml: 12, price: 890 }] },
      { id: 4, name: 'Jasmine Mist', slug: 'jasmine-mist', top_notes: 'Night-blooming Jasmine', variants: [{ id: 14, volume_ml: 6, price: 400 }] },
    ];
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {atars.map((atar: any) => (
          <AtarCard 
            key={atar.id}
            id={atar.id}
            name={atar.name}
            slug={atar.slug}
            top_notes={atar.top_notes}
            variants={atar.variants}
          />
        ))}
      </div>
    </div>
  );
}
