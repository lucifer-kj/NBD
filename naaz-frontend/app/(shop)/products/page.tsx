"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Search, X, Filter, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/providers/session-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductCard from "@/components/product-card"

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  slug: string
  categoryId: string
}

interface ProductsResponse {
  products: Product[]
  total: number
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string>("all")
  const [stockStatus, setStockStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const pageSize = 9
  const { isAuthenticated } = useAuth()
  // TODO: Re-enable when wishlist is connected to Django
  // const [wishlist, setWishlist] = useState<string[]>([])
  // const [wishlistLoading, setWishlistLoading] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check for search parameter from header redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const searchParam = urlParams.get('search')
    if (searchParam) {
      setSearch(searchParam)
    }
  }, [])

  useEffect(() => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    fetch(`${BACKEND_URL}/api/categories/`)
      .then(res => res.json())
      .then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    let url = `${BACKEND_URL}/api/products/?page=${currentPage}&pageSize=${pageSize}`
    if (selectedCategory) url += `&category=${selectedCategory}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    if (priceRange !== "all") url += `&priceRange=${priceRange}`
    if (stockStatus !== "all") url += `&stockStatus=${stockStatus}`
    if (sortBy !== "newest") url += `&sortBy=${sortBy}`
    
    fetch(url)
      .then(res => res.json())
      .then((data: ProductsResponse) => {
        setProducts(data.products)
        setTotal(data.total)
      })
      .finally(() => setLoading(false))
  }, [selectedCategory, search, priceRange, stockStatus, sortBy, currentPage])

  // Fetch wishlist on load
  // TODO: Re-implement wishlist against Django API
  useEffect(() => {
    // Placeholder for Django wishlist fetch
  }, [isAuthenticated])

  const totalPages = Math.ceil(total / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // TODO: Re-implement wishlist against Django API
  const handleWishlist = async (productId: string) => {
    if (!isAuthenticated) return
    console.log('Wishlist feature coming soon', productId)
  }

  const clearSearch = () => {
    setSearch("")
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters & Categories
          <ChevronDown className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Hidden on mobile unless toggled */}
        <aside className={`lg:col-span-1 bg-white rounded-lg shadow p-6 h-fit transition-all duration-300 ${
          sidebarOpen ? 'block' : 'hidden lg:block'
        }`}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-xl font-bold">Filters</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <h2 className="text-xl font-bold mb-4 hidden lg:block">Categories</h2>
        <ul className="space-y-2 mb-6">
          <li>
            <button
              className={`w-full text-left px-2 py-1 rounded ${!selectedCategory ? 'bg-[var(--primary)] text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button
                className={`w-full text-left px-2 py-1 rounded ${selectedCategory === cat.id ? 'bg-[var(--primary)] text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold mb-3">Price Range</h3>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-500">₹0 - ₹500</SelectItem>
            <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
            <SelectItem value="1000-2000">₹1000 - ₹2000</SelectItem>
            <SelectItem value="2000+">₹2000+</SelectItem>
          </SelectContent>
        </Select>

        <h3 className="text-lg font-semibold mb-3 mt-6">Stock Status</h3>
        <Select value={stockStatus} onValueChange={setStockStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select stock status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </aside>

      {/* Main Content */}
        <main className="lg:col-span-3">
          <div className="flex flex-col gap-4 mb-6">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
            <p className="text-gray-600 mt-1">
              {loading ? "Loading..." : `${total} product${total !== 1 ? 's' : ''} found`}
              {search && (
                <span className="ml-2 text-sm text-gray-500">
                  for &quot;{search}&quot;
                </span>
              )}
            </p>
          </div>
            
            {/* Search and Sort - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-10"
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </form>
            <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Results Summary */}
        {search && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm text-blue-800">
                Showing results for: <strong>&quot;{search}&quot;</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 self-start sm:self-center"
              >
                Clear search
              </Button>
            </div>
          </div>
        )}

          {/* Product Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-12">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">No products found.</div>
          ) : (
            products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                showWishlist={false}
                onWishlistToggle={handleWishlist}
                isInWishlist={false}
                wishlistLoading={false}
              />
            ))
          )}
        </div>

          {/* Pagination - Mobile Responsive */}
        {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
                className="w-full sm:w-auto"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
              <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
              if (totalPages <= 5) {
                    pageNum = i + 1;
              } else if (currentPage <= 3) {
                    pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
              } else {
                    pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 sm:w-10 sm:h-10 text-sm"
                >
                  {pageNum}
                </Button>
                  );
            })}
              </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
                className="w-full sm:w-auto"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
      </div>
    </div>
  )
} 