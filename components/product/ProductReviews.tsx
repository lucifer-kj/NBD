'use client';

import { useState, useEffect } from 'react';
import ReviewForm from '../review-form';
import StarRating from '../star-rating';
import { Star } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (review: { rating: number; title: string; comment: string }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          external_id: productId,
          rating: review.rating,
          title: review.title,
          body: review.comment,
        }),
      });

      if (res.ok) {
        alert('Review submitted successfully! It will appear after moderation.');
        // Optionally refetch or add optimistically
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      alert('Error submitting review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-20 pt-10 border-t border-gray-100">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-headings font-bold text-[var(--islamic-green)]">Customer Reviews</h2>
        <div className="flex items-center gap-2">
          <Star size={20} fill="#D4AF37" className="text-[var(--islamic-gold)]" />
          <span className="font-bold">
            {reviews.length > 0 
              ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
              : 'New'}
          </span>
          <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {isLoading ? (
            <p className="text-gray-500 animate-pulse">Loading reviews...</p>
          ) : reviews.length > 0 ? (
            reviews.map((review: any) => (
              <div key={review.id} className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="font-bold text-sm">{review.title}</span>
                </div>
                <p className="text-gray-600 text-sm italic mb-2">"{review.body}"</p>
                <p className="text-xs text-gray-400">By {review.user?.display_name || 'Verified Buyer'}</p>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 rounded-3xl p-10 text-center border border-dashed border-gray-200">
              <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>

        <div>
          <ReviewForm onSubmit={handleReviewSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
}
