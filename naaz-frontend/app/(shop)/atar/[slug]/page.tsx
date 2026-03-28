import React from 'react';
import Image from 'next/image';
import { ShoppingCart, Droplets } from 'lucide-react';

export default async function AtarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Try fetching actual data
  let atar = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/atar/${slug}/`, { cache: 'no-store' });
    if (res.ok) {
      atar = await res.json();
    }
  } catch (e) {
    console.warn("Backend API not reachable. Using fallback dummy data.");
  }

  if (!atar) {
    // Dummy fallback for UI demo
    atar = {
      id: 1, 
      name: 'Royal Oudh', 
      slug: slug, 
      top_notes: 'Agarwood, Rose, Amber', 
      heart_notes: 'Sandalwood, Saffron',
      base_notes: 'Patchouli, Musk',
      description: 'A luxurious blend of the finest Assam agarwood, aged for deep richness, intertwined with Taif rose and warm amber. An exquisite non-alcoholic attar that leaves a lasting impression.',
      variants: [
        { id: 11, volume_ml: 12, price: 1200, stock_quantity: 15 },
        { id: 12, volume_ml: 6, price: 650, stock_quantity: 4 }
      ],
      is_active: true
    };
  }

  // Active variant logic would typically be handled by a client component, 
  // but for Server Component UI showcase, we'll just display the first one.
  const activeVariant = atar.variants && atar.variants.length > 0 ? atar.variants[0] : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left: Image */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square bg-[#F8F6F3] rounded-3xl overflow-hidden shadow-lg border border-gray-100 p-8 flex items-center justify-center">
            <Image src="/Images/ittars.jpeg" alt={atar.name} width={400} height={400} className="object-contain hover:scale-105 transition-transform duration-700" />
            <div className="absolute top-6 right-6 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[var(--islamic-green)] text-sm font-bold px-4 py-2 rounded-full shadow-sm">
              <Droplets size={16} className="text-[var(--islamic-gold)]" />
              100% Non-Alcoholic
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-3xl md:text-5xl font-headings font-bold text-[var(--islamic-green)] mb-4">{atar.name}</h1>
          
          {activeVariant ? (
            <div className="text-4xl font-bold text-gray-900 mb-6 flex items-end gap-3">
              ₹{activeVariant.price}
              <span className="text-lg text-gray-500 font-normal mb-1">/ {activeVariant.volume_ml}ml</span>
            </div>
          ) : (
            <div className="text-4xl font-bold text-gray-900 mb-6">Price Unavailable</div>
          )}

          <p className="text-gray-700 leading-relaxed mb-8 text-lg">
            {atar.description}
          </p>

          {/* Fragrance Pyramid */}
          <div className="bg-[#F8F6F3] rounded-2xl p-6 mb-8">
            <h3 className="font-headings font-bold text-xl text-[var(--islamic-green)] mb-4 border-b border-gray-200 pb-2">Fragrance Notes</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[var(--islamic-gold)] font-bold uppercase tracking-wider mb-1">Top Notes</div>
                <div className="text-gray-800">{atar.top_notes}</div>
              </div>
              {atar.heart_notes && (
                <div>
                  <div className="text-xs text-[var(--islamic-gold)] font-bold uppercase tracking-wider mb-1">Heart Notes</div>
                  <div className="text-gray-800">{atar.heart_notes}</div>
                </div>
              )}
              {atar.base_notes && (
                <div>
                  <div className="text-xs text-[var(--islamic-gold)] font-bold uppercase tracking-wider mb-1">Base Notes</div>
                  <div className="text-gray-800">{atar.base_notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Variant Selector (Static for now) */}
          {atar.variants && atar.variants.length > 1 && (
            <div className="mb-8">
              <div className="text-sm font-bold text-gray-700 mb-3">Select Size:</div>
              <div className="flex gap-3">
                {atar.variants.map((v: any, index: number) => (
                  <button key={v.id} className={`px-6 py-3 rounded-xl border-2 font-bold transition-colors ${index === 0 ? 'border-[var(--islamic-green)] text-[var(--islamic-green)] bg-[#2E5A44]/5' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {v.volume_ml}ml
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-auto">
            <button className="flex-1 bg-[var(--islamic-gold)] text-[var(--islamic-green)] font-bold py-4 rounded-xl hover:bg-[#b89a2e] transition-colors shadow-md flex items-center justify-center gap-2">
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button className="flex-1 border-2 border-[var(--islamic-green)] text-[var(--islamic-green)] font-bold py-4 rounded-xl hover:bg-[var(--islamic-green)] hover:text-white transition-colors">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
