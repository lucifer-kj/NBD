import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Droplets } from 'lucide-react';

interface AtarVariant {
  id: number;
  volume_ml: number;
  price: number;
}

interface AtarProps {
  id: number;
  name: string;
  slug: string;
  top_notes: string;
  variants?: AtarVariant[];
  imageUrl?: string;
}

const AtarCard = ({ id, name, slug, top_notes, variants, imageUrl }: AtarProps) => {
  const fallbackImage = "/Images/ittars.jpeg";
  
  // Default to first variant price if available
  const price = variants && variants.length > 0 ? variants[0].price : "0.00";
  const volume = variants && variants.length > 0 ? variants[0].volume_ml : "N/A";

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
      <Link href={`/atar/${slug}`} className="block relative aspect-square overflow-hidden bg-[#F8F6F3]">
        <Image 
          src={imageUrl || fallbackImage} 
          alt={name} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[var(--islamic-green)] text-xs font-bold px-2 py-1 rounded shadow-sm">
          <Droplets size={12} className="text-[var(--islamic-gold)]" />
          {volume}ml
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-[var(--islamic-gold)] font-medium mb-1 line-clamp-1">Notes: {top_notes}</div>
        <Link href={`/atar/${slug}`} className="block">
          <h3 className="text-lg font-headings font-bold text-[var(--islamic-green)] mb-2 line-clamp-1 group-hover:text-[var(--islamic-gold)] transition-colors">
            {name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <span className="text-xl font-bold text-gray-900">₹{price}</span>
          <button 
            className="bg-amber-50 text-[var(--islamic-gold)] hover:bg-[var(--islamic-gold)] hover:text-white p-2.5 rounded-full transition-colors focus:ring-2 focus:ring-[var(--islamic-green)] focus:outline-none"
            aria-label={`Add ${name} to cart`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AtarCard;
