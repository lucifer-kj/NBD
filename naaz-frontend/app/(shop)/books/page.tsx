import React from 'react';
import BookCard from '@/components/catalog/BookCard';

export const metadata = {
  title: 'Islamic Books | Naaz Book Depot',
  description: 'Explore our vast collection of authentic Islamic literature and Qurans.',
};

export default async function BooksPage() {
  // We mock the API call gracefully so it doesn't crash if Docker/Django isn't running on the user's host
  let books = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/books/`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      books = data.items || data;
    }
  } catch (error) {
    console.warn("Backend API not reachable. Falling back to dummy data for UI preview.");
  }
  
  if (!books || books.length === 0) {
    books = [
      { id: 1, title: 'The Noble Quran (English Translation)', slug: 'noble-quran-english', author: 'Dr. Muhammad Taqi-ud-Din Al-Hilali', format: 'Hardcover', price: 950 },
      { id: 2, title: 'Sahih Al-Bukhari (Complete 9 Volumes)', slug: 'sahih-bukhari-set', author: 'Imam Muhammad bin Ismail bin Al-Mughirah Al-Bukhari', format: 'Set', price: 4500 },
      { id: 3, title: 'Riyad-us-Saliheen', slug: 'riyad-us-saliheen', author: 'Imam An-Nawawi', format: 'Paperback', price: 650 },
      { id: 4, title: 'Tafsir Ibn Kathir', slug: 'tafsir-ibn-kathir', author: 'Imam Ibn Kathir', format: '10 Volumes', price: 5800 },
      { id: 5, title: 'Fortress of the Muslim (Hisnul Muslim)', slug: 'hisnul-muslim', author: 'Sa\'id bin Ali bin Wahf Al-Qahtani', format: 'Pocket Size', price: 150 },
      { id: 6, title: 'The Sealed Nectar (Ar-Raheeq Al-Makhtum)', slug: 'sealed-nectar', author: 'Safi-ur-Rahman Al-Mubarakpuri', format: 'Hardcover', price: 850 },
    ];
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-headings font-bold text-[var(--islamic-green)] mb-4">Islamic Library</h1>
        <div className="h-1 w-24 bg-[var(--islamic-gold)] rounded mx-auto mb-6" />
        <p className="text-lg text-[var(--charcoal)]/70 max-w-2xl mx-auto font-light">
          Discover our curated collection of essential texts, from the Holy Qur'an to Hadith collections and scholarly commentaries.
        </p>
      </div>
      
      {/* Filters & Grid */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar placeholder */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-[#F8F6F3] p-6 rounded-2xl sticky top-24">
            <h3 className="font-headings font-bold text-xl text-[var(--islamic-green)] mb-4">Categories</h3>
            <ul className="space-y-3 text-[var(--charcoal)]/80">
              <li className="flex items-center gap-2 hover:text-[var(--islamic-gold)] cursor-pointer transition-colors"><input type="checkbox" className="rounded text-[var(--islamic-green)] focus:ring-[var(--islamic-gold)]" /> Quran & Tafseer</li>
              <li className="flex items-center gap-2 hover:text-[var(--islamic-gold)] cursor-pointer transition-colors"><input type="checkbox" className="rounded text-[var(--islamic-green)] focus:ring-[var(--islamic-gold)]" /> Hadith</li>
              <li className="flex items-center gap-2 hover:text-[var(--islamic-gold)] cursor-pointer transition-colors"><input type="checkbox" className="rounded text-[var(--islamic-green)] focus:ring-[var(--islamic-gold)]" /> Fiqh (Jurisprudence)</li>
              <li className="flex items-center gap-2 hover:text-[var(--islamic-gold)] cursor-pointer transition-colors"><input type="checkbox" className="rounded text-[var(--islamic-green)] focus:ring-[var(--islamic-gold)]" /> History & Biography</li>
              <li className="flex items-center gap-2 hover:text-[var(--islamic-gold)] cursor-pointer transition-colors"><input type="checkbox" className="rounded text-[var(--islamic-green)] focus:ring-[var(--islamic-gold)]" /> Children's Books</li>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book: any) => (
              <BookCard 
                key={book.id}
                id={book.id}
                title={book.title}
                slug={book.slug}
                author={book.author}
                price={book.price}
                format={book.format}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
