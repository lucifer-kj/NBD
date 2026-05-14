'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Loader2, X } from 'lucide-react';

interface SearchResult {
  products: Array<{ id: string; handle: string; title: string; featuredImage?: { url: string } }>;
  collections: Array<{ id: string; handle: string; title: string }>;
  articles: Array<{ id: string; handle: string; title: string }>;
}

export default function PredictiveSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-lg" ref={dropdownRef}>
      <div className="relative group">
        <input
          type="text"
          placeholder="Search for books, authors, or collections..."
          className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-gray-400 text-sm font-medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        
        {query && (
          <button 
            onClick={() => { setQuery(''); setResults(null); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && ((results?.products?.length ?? 0) > 0 || (results?.collections?.length ?? 0) > 0 || (results?.articles?.length ?? 0) > 0 || isLoading) && (
        <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl bg-white/95">
          {isLoading ? (
            <div className="p-8 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-sm text-gray-500 font-medium italic">Searching our library...</p>
            </div>
          ) : results ? (
            <div className="p-2">
              {(results.products?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2">Suggested Products</h3>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.handle}`}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all group"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                          {p.featuredImage ? (
                            <Image src={p.featuredImage.url} alt={p.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Search className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{p.title}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-tight">View Product</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {(results.collections?.length ?? 0) > 0 && (
                <div className="border-t border-gray-50 mt-2 pt-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2">Collections</h3>
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {results.collections.map((c) => (
                      <Link
                        key={c.id}
                        href={`/collections/${c.handle}`}
                        className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {(results.articles?.length ?? 0) > 0 && (
                <div className="border-t border-gray-50 mt-2 pt-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2">Insights & Articles</h3>
                  <div className="space-y-1">
                    {results.articles.map((a) => (
                      <Link
                        key={a.id}
                        href={`/blog/news/${a.handle}`}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all group"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{a.title}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-tight">Read Article</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-gray-50 rounded-b-2xl text-center">
                 <button className="text-xs font-bold text-primary hover:underline">
                    View all results for &quot;{query}&quot;
                 </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
