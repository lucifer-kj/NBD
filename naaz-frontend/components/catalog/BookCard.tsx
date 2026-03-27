import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';

interface BookProps {
  id: number;
  title: string;
  slug: string;
  author: string;
  price: string | number;
  imageUrl?: string;
  format?: string;
}

const BookCard = ({ id, title, slug, author, price, imageUrl, format }: BookProps) => {
  const fallbackImage = "/Images/Books.jpeg";

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
      <Link href={`/books/${slug}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-50">
        <Image 
          src={imageUrl || fallbackImage} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {format && (
          <div className="absolute top-2 left-2 bg-[var(--islamic-green)] text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {format}
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-1">{author}</div>
        <Link href={`/books/${slug}`} className="block">
          <h3 className="text-lg font-headings font-bold text-[var(--islamic-green)] mb-2 line-clamp-2 group-hover:text-[var(--islamic-gold)] transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <span className="text-xl font-bold text-gray-900">₹{price}</span>
          <button 
            className="bg-[#F8F6F3] text-[var(--islamic-green)] hover:bg-[var(--islamic-green)] hover:text-white p-2.5 rounded-full transition-colors focus:ring-2 focus:ring-[var(--islamic-gold)] focus:outline-none"
            aria-label={`Add ${title} to cart`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
