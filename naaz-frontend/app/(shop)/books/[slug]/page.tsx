import React from 'react';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Try fetching actual data
  let book = null;
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/books/${slug}/`, { cache: 'no-store' });
    if (res.ok) {
      book = await res.json();
    }
  } catch (e) {
    console.warn("Backend API not reachable. Using fallback dummy data.");
  }

  if (!book) {
    // Dummy fallback for UI demo
    book = {
      id: 1, 
      title: 'The Noble Quran (English Translation)', 
      slug: slug, 
      author: 'Dr. Muhammad Taqi-ud-Din Al-Hilali', 
      format: 'Hardcover', 
      price: 950,
      description: 'A summarized version of At-Tabari, Al-Qurtubi and Ibn Kathir with comments from Sahih Al-Bukhari.',
      language: 'English/Arabic',
      pages: 1200,
      isbn: '978-9960-740-79-9',
      stock_quantity: 45
    };
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left: Image */}
        <div className="w-full md:w-1/3">
          <div className="relative aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <Image src="/Images/Books.jpeg" alt={book.title} fill className="object-cover" />
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="text-sm text-[var(--islamic-gold)] font-bold mb-2 uppercase tracking-wide">{book.format}</div>
          <h1 className="text-3xl md:text-5xl font-headings font-bold text-[var(--islamic-green)] mb-2">{book.title}</h1>
          <p className="text-lg text-gray-600 mb-6">By {book.author}</p>
          
          <div className="text-4xl font-bold text-gray-900 mb-6">₹{book.price}</div>

          <p className="text-gray-700 leading-relaxed mb-8 border-b border-gray-100 pb-8">
            {book.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Language</div>
              <div className="font-semibold">{book.language}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pages</div>
              <div className="font-semibold">{book.pages}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">ISBN</div>
              <div className="font-semibold">{book.isbn || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Availability</div>
              <div className={`font-semibold ${book.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {book.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
          </div>

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
