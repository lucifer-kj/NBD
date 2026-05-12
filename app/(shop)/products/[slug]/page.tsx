"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Share2 } from "lucide-react"
import ReviewForm from "@/components/review-form"
import StarRating from "@/components/star-rating"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { useCartStore } from "@/store/cart-store"
import { useAuth } from "@/components/providers/session-provider"
import { getProduct } from "@/lib/shopify"
import { ReshapedProduct } from "@/types/shopify"



type PageProps = {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: PageProps) {
  const [product, setProduct] = useState<ReshapedProduct | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedProducts, setRelatedProducts] = useState<ReshapedProduct[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewSortBy, setReviewSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  const addToCart = useCartStore((state) => state.addItem)
  const { isAuthenticated: isAuthenticatedUser } = useAuth()

  useEffect(() => {
    const fetchProduct = async () => {
      const { slug } = await params
      setLoading(true)
      
      try {
        const fetchedProduct = await getProduct(slug);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setProduct(null);
        }
        setReviews([])
        setRelatedProducts([])
        setIsAuthenticated(isAuthenticatedUser)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params, isAuthenticatedUser])

  const handleAddToCart = () => {
    if (!product) return
    const variantId = product.variants[0]?.id;
    if (variantId) {
      addToCart(variantId, quantity)
    }
  }

  const handleReviewSubmit = async (reviewData: { rating: number; title: string; comment: string }) => {
    if (!product) return
    
    setIsSubmittingReview(true)
    try {
      console.log("Reviews endpoint not implemented yet", reviewData, product.handle)
      alert("Reviews will be enabled in a later release.")
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const getStockStatus = (available: boolean) => {
    if (!available) return { status: 'Out of Stock', color: 'destructive' }
    return { status: 'In Stock', color: 'default' }
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0

  // Calculate rating distribution
  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (reviewSortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      default:
        return 0
    }
  })

  interface Review {
    id: string
    rating: number
    title: string
    comment: string
    createdAt: string
    user: {
      name: string
    }
  }

  // TODO: Re-implement wishlist against Django API
  const handleWishlist = async () => {
    // Placeholder — will be connected to Django API
    console.log('Wishlist feature coming soon')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price)
  }

  if (loading || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{loading ? "Loading product..." : "Product not found."}</div>
      </div>
    )
  }

  const stockInfo = getStockStatus(product.availableForSale)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li><Link href="/" className="hover:text-[var(--islamic-green)]">Home</Link></li>
          <li>/</li>
          <li><Link href="/products" className="hover:text-[var(--islamic-green)]">Products</Link></li>
          <li>/</li>
          <li className="text-[var(--charcoal)]">{product.title}</li>
        </ol>
      </nav>

      {/* Wishlist Button — TODO: re-enable with Django */}
      <div className="flex justify-end mb-2">
        <Button
          aria-label="Add to wishlist"
          onClick={handleWishlist}
          className="p-2 bg-transparent hover:bg-gray-100 rounded-full"
        >
          <Heart className="w-6 h-6 text-gray-400" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage]?.url || product.featuredImage?.url || "/Images/p1.jpg"}
              alt={product.title}
              fill
              className="object-cover"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-[var(--islamic-green)]' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-2">{product.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <StarRating
                rating={averageRating}
                size="md"
                showValue={true}
              />
              <Badge variant={stockInfo.color as "default" | "secondary" | "destructive"}>{stockInfo.status}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[var(--islamic-green)]">
                {formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))}
              </span>
              {parseFloat(product.priceRange.maxVariantPrice.amount) > parseFloat(product.priceRange.minVariantPrice.amount) && (
                <span className="text-lg text-gray-500">
                  - {formatPrice(parseFloat(product.priceRange.maxVariantPrice.amount))}
                </span>
              )}
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-1 bg-transparent hover:bg-gray-100 rounded"
                >
                  -
                </Button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <Button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.availableForSale}
                  className="px-3 py-1 bg-transparent hover:bg-gray-100 rounded"
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white text-lg py-3 transition-all duration-300 shadow-md hover:shadow-xl"
                onClick={handleAddToCart}
                disabled={!product.availableForSale}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-lg py-3">
                <Heart className="w-5 h-5" />
              </Button>
              <Button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-lg py-3">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">{averageRating.toFixed(1)}</span>
                <StarRating
                  rating={averageRating}
                  size="md"
                />
                <span className="ml-2 text-sm text-gray-600">
                  ({reviews.length} reviews)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Review Statistics */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Rating Distribution */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingDistribution[rating] || 0
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Review Form for Authenticated Users */}
            {isAuthenticated && (
              <div>
                <ReviewForm
                  onSubmit={handleReviewSubmit}
                  isSubmitting={isSubmittingReview}
                />
              </div>
            )}
          </div>
        )}

        {/* Review Form for Authenticated Users (when no reviews) */}
        {isAuthenticated && reviews.length === 0 && (
          <div className="mb-8">
            <ReviewForm
              onSubmit={handleReviewSubmit}
              isSubmitting={isSubmittingReview}
            />
          </div>
        )}

        {/* Review Sorting */}
        {reviews.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">All Reviews</h3>
            <select
              value={reviewSortBy}
              onChange={(e) => setReviewSortBy(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')}
              className="border rounded-lg px-3 py-1 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        )}

        {/* Existing Reviews */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Star className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600">
              {isAuthenticated 
                ? "No reviews yet. Be the first to review this product!" 
                : "No reviews yet. Sign in to be the first to review this product!"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{review.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{review.user.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <StarRating
                            rating={review.rating}
                            size="sm"
                            showValue={true}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {relatedProducts.map((relatedProduct) => (
                <CarouselItem key={relatedProduct.id} className="basis-80 max-w-xs">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="flex flex-col items-center">
                      <Link href={`/products/${relatedProduct.handle}`}>
                        <Image 
                          src={relatedProduct.featuredImage?.url || "/Images/p1.jpg"} 
                          alt={relatedProduct.title} 
                          width={300} 
                          height={200} 
                          className="rounded-md object-cover mb-4" 
                          style={{ width: '100%', height: 'auto' }}
                        />
                      </Link>
                      <CardTitle className="text-lg font-semibold mb-2 text-center">
                        {relatedProduct.title}
                      </CardTitle>
                      <div className="text-[var(--islamic-green)] font-bold text-xl mb-2">
                        {formatPrice(parseFloat(relatedProduct.priceRange.minVariantPrice.amount))}
                      </div>
                      <Link 
                        href={`/products/${relatedProduct.handle}`} 
                        className="text-[var(--islamic-green)] underline mt-2"
                      >
                        View Product
                      </Link>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
            <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      )}
    </div>
  )
}