"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import ProductCard from '@/components/product-card'
import { ReshapedProduct } from '@/types/shopify'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface BooksClientProps {
  initialBooks: ReshapedProduct[]
}

const CATEGORIES = [
  { name: 'All Books', value: 'all' },
  { name: 'Quran & Tafseer', value: 'quran' },
  { name: 'Hadith', value: 'hadith' },
  { name: 'Fiqh', value: 'fiqh' },
  { name: 'History', value: 'history' }
]

const matchBookCategory = (book: ReshapedProduct, category: string): boolean => {
  if (category === 'all') return true

  const tags = book.tags?.map(t => t.toLowerCase()) || []
  const title = book.title.toLowerCase()
  const description = book.description?.toLowerCase() || ''

  if (category === 'quran') {
    return tags.some(t => t === 'quran' || t === 'tafsir' || t === 'tafseer' || t === 'quran & tafseer') ||
           title.includes('quran') || title.includes('tafsir') || title.includes('tafseer') ||
           description.includes('quran') || description.includes('tafsir') || description.includes('tafseer')
  }
  if (category === 'hadith') {
    return tags.some(t => t === 'hadith' || t === 'hadees' || t === 'ahadith') ||
           title.includes('hadith') || title.includes('hadees') ||
           description.includes('hadith') || description.includes('hadees')
  }
  if (category === 'fiqh') {
    return tags.some(t => t === 'fiqh' || t === 'jurisprudence' || t === 'shariah') ||
           title.includes('fiqh') || title.includes('jurisprudence') || title.includes('shariah') ||
           description.includes('fiqh') || description.includes('jurisprudence') || description.includes('shariah')
  }
  if (category === 'history') {
    return tags.some(t => t === 'history' || t === 'seerah' || t === 'sira' || t === 'biography') ||
           title.includes('history') || title.includes('seerah') || title.includes('sira') || title.includes('biography') ||
           description.includes('history') || description.includes('seerah') || description.includes('sira') || description.includes('biography')
  }

  return false
}

export default function BooksClient({ initialBooks }: BooksClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const categoryParam = searchParams.get('category') || 'all'
  const urlSearchQuery = searchParams.get('search') || ''
  const sortBy = searchParams.get('sort') || 'featured'

  const [searchInput, setSearchInput] = useState(urlSearchQuery)

  // Sync local search input with URL search param changes
  useEffect(() => {
    setSearchInput(urlSearchQuery)
  }, [urlSearchQuery])

  // Debounce search input update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchInput) {
        params.set('search', searchInput)
      } else {
        params.delete('search')
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, 300)

    return () => clearTimeout(handler)
  }, [searchInput, pathname, router, searchParams])

  const handleCategoryClick = (categoryVal: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryVal === 'all') {
      params.delete('category')
    } else {
      params.set('category', categoryVal)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSortChange = (sortVal: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sortVal === 'featured') {
      params.delete('sort')
    } else {
      params.set('sort', sortVal)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Calculate book counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    CATEGORIES.forEach(cat => {
      counts[cat.value] = initialBooks.filter(book => matchBookCategory(book, cat.value)).length
    })
    return counts
  }, [initialBooks])

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...initialBooks]

    // 1. Category Filter
    if (categoryParam !== 'all') {
      result = result.filter(book => matchBookCategory(book, categoryParam))
    }

    // 2. Search Query Filter
    if (urlSearchQuery) {
      const lowerQuery = urlSearchQuery.toLowerCase()
      result = result.filter(book => 
        book.title.toLowerCase().includes(lowerQuery) ||
        book.description?.toLowerCase().includes(lowerQuery) ||
        book.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    }

    // 3. Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const priceA = parseFloat(a.priceRange.minVariantPrice.amount)
        const priceB = parseFloat(b.priceRange.minVariantPrice.amount)
        return priceA - priceB
      })
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const priceA = parseFloat(a.priceRange.minVariantPrice.amount)
        const priceB = parseFloat(b.priceRange.minVariantPrice.amount)
        return priceB - priceA
      })
    } else if (sortBy === 'newest') {
      result.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime()
        const dateB = new Date(b.updatedAt).getTime()
        return dateB - dateA
      })
    }

    return result
  }, [initialBooks, categoryParam, urlSearchQuery, sortBy])

  const activeCategoryName = CATEGORIES.find(c => c.value === categoryParam)?.name || 'All Books'

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-headings font-bold text-[var(--islamic-green)] mb-4">Islamic Library</h1>
        <div className="h-1 w-24 bg-[var(--islamic-gold)] rounded mx-auto mb-6" />
        <p className="text-lg text-[var(--charcoal)]/70 max-w-2xl mx-auto font-light">
          Discover our curated collection of essential texts, from the Holy Qur&apos;an to Hadith collections and scholarly commentaries.
        </p>
      </div>
      
      {/* Filters & Grid */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          {/* Mobile Collapsible Accordion */}
          <details className="group md:hidden bg-[#F8F6F3] p-4 rounded-2xl border border-gray-100 select-none">
            <summary className="font-headings font-bold text-base text-[var(--islamic-green)] cursor-pointer flex items-center justify-between outline-none">
              <span>Filter by Category: {activeCategoryName}</span>
              <span className="text-[var(--islamic-gold)] text-xs transition-transform duration-300 group-open:rotate-180">▼</span>
            </summary>
            <ul className="mt-4 space-y-3 text-[var(--charcoal)]/80 text-sm">
              {CATEGORIES.map((cat) => {
                const isActive = categoryParam === cat.value
                return (
                  <li 
                    key={cat.value}
                    onClick={() => handleCategoryClick(cat.value)}
                    className="flex items-center justify-between hover:text-[var(--islamic-gold)] cursor-pointer transition-colors py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-[var(--islamic-gold)] scale-110' : 'bg-gray-300'}`} />
                      <span className={isActive ? 'font-bold text-[var(--islamic-green)]' : ''}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-normal">
                      ({categoryCounts[cat.value] || 0})
                    </span>
                  </li>
                )
              })}
            </ul>
          </details>

          {/* Desktop Static Sidebar */}
          <div className="hidden md:block bg-[#F8F6F3] p-6 rounded-2xl sticky top-24 border border-gray-100">
            <h3 className="font-headings font-bold text-xl text-[var(--islamic-green)] mb-4">Categories</h3>
            <ul className="space-y-3 text-[var(--charcoal)]/80">
              {CATEGORIES.map((cat) => {
                const isActive = categoryParam === cat.value
                return (
                  <li 
                    key={cat.value}
                    onClick={() => handleCategoryClick(cat.value)}
                    className="flex items-center justify-between hover:text-[var(--islamic-gold)] cursor-pointer transition-colors py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-[var(--islamic-gold)] scale-110' : 'bg-gray-300'}`} />
                      <span className={isActive ? 'font-bold text-[var(--islamic-green)]' : ''}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-normal">
                      ({categoryCounts[cat.value] || 0})
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
            <span className="text-[var(--charcoal)]/60 text-sm whitespace-nowrap">
              Showing {filteredAndSortedBooks.length} resources
            </span>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative group flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--islamic-gold)] transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search books..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)]/20 focus:border-[var(--islamic-gold)] transition-all shadow-sm"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              {/* Sort Dropdown */}
              <select 
                className="bg-white border text-sm border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)] cursor-pointer"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
          
          {filteredAndSortedBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredAndSortedBooks.map((book) => (
                <ProductCard 
                  key={book.id}
                  product={book}
                  showWishlist={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500">No books found matching your selection.</p>
              {(categoryParam !== 'all' || urlSearchQuery) && (
                <button 
                  onClick={() => {
                    setSearchInput('')
                    handleCategoryClick('all')
                  }}
                  className="mt-4 text-sm font-bold text-[var(--islamic-green)] hover:underline"
                >
                  Clear Filters & Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
