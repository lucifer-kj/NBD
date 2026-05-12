"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books, attars..."
          className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)] focus:border-transparent transition-all duration-300 text-sm"
        />
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--islamic-gold)] transition-colors">
          <Search size={18} />
        </div>
        <button 
          type="submit"
          className="absolute inset-y-1 right-1 px-4 bg-[var(--islamic-green)] hover:bg-[#234533] text-white text-sm font-medium rounded-full transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
