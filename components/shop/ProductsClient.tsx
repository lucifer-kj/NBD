"use client"

import React, { useState, useEffect } from 'react'
import { Search, Grid2X2, List, SlidersHorizontal } from 'lucide-react'
import ProductCard from "@/components/product-card"
import { ReshapedProduct } from "@/types/shopify"
import { motion, AnimatePresence } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/motion.config"
import { useSearchParams } from 'next/navigation'

const CATEGORIES = ['All Products', 'Books', 'Prayer Mats', 'Rehals', 'Newest']

interface ProductsClientProps {
  initialProducts: ReshapedProduct[];
}

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('search') || ''
  
  const [activeCategory, setActiveCategory] = useState('All Products')
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12
  
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, searchQuery])
  
  // Filter products based on category and search query
  const filteredProducts = initialProducts.filter(product => {
    const hasFragranceTag = product.tags?.some(tag => {
      const lowerTag = tag.toLowerCase();
      return lowerTag === 'atar' || lowerTag === 'attar' || lowerTag === 'fragrance';
    });
    if (hasFragranceTag) return false;

    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeCategory === 'All Products') return matchesSearch
    if (activeCategory === 'Newest') return matchesSearch
    
    const matchesCategory = product.tags?.some(tag => 
      tag.toLowerCase() === activeCategory.toLowerCase()
    )
    
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-headings font-bold text-[var(--islamic-green)] mb-2">Our Collection</h1>
          <p className="text-[var(--charcoal)]/60 font-medium">Explore our curated selection of Islamic essentials</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--islamic-gold)] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search literature, stands..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)]/20 focus:border-[var(--islamic-gold)] transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border transition-all font-semibold ${showFilters ? 'bg-[var(--islamic-green)] text-white border-[var(--islamic-green)]' : 'bg-white text-gray-700 border-gray-200 hover:border-[var(--islamic-gold)]'}`}
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block w-64 space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Categories</h3>
            <div className="space-y-1">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeCategory === category
                      ? 'bg-[var(--islamic-green-dark)] text-white shadow-md translate-x-1'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Active Filters Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">
                Showing <span className="text-[var(--charcoal)] font-bold">{filteredProducts.length}</span> products
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[var(--islamic-green)]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid2X2 size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[var(--islamic-green)]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <div className="space-y-12">
                <motion.div
                  key={activeCategory + searchQuery + viewMode + currentPage}
                  initial="hidden"
                  animate="show"
                  variants={staggerContainer}
                  className={viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8" 
                    : "flex flex-col gap-4"
                  }
                >
                  {paginatedProducts.map((product) => (
                    <motion.div key={product.id} variants={fadeInUp}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-gray-100 flex-wrap">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[var(--islamic-gold)] disabled:opacity-40 disabled:hover:border-gray-200 transition-all select-none cursor-pointer"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const page = idx + 1;
                        if (totalPages > 5) {
                          if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                            if (page === 2 && currentPage > 3) return <span key={page} className="text-gray-400 px-1">...</span>;
                            if (page === totalPages - 1 && currentPage < totalPages - 2) return <span key={page} className="text-gray-400 px-1">...</span>;
                            return null;
                          }
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              currentPage === page
                                ? 'bg-[var(--islamic-green-dark)] text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--islamic-gold)]'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[var(--islamic-gold)] disabled:opacity-40 disabled:hover:border-gray-200 transition-all select-none cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--charcoal)] mb-2">No products found</h3>
                {searchQuery && (
                   <span className="text-gray-400 italic block mb-2">No products matching &quot;{searchQuery}&quot; found</span>
                )}
                <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your filters or search query to find what you&apos;re looking for.</p>
                <button 
                  onClick={() => { setActiveCategory('All Products'); setSearchQuery(''); }}
                  className="mt-6 text-[var(--islamic-green)] font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
