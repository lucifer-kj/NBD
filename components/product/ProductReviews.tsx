'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReviewForm from '../review-form';
import StarRating from '../star-rating';
import { Star, CheckCircle, User } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  verified?: string;
  reviewer?: {
    name: string;
  };
}
interface ProductReviewsProps {
  productId: string;
  productTitle?: string;
}

export default function ProductReviews({ productId, productTitle }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const numericalId = productId.includes('gid://') ? productId.split('/').pop() : productId;
      const res = await fetch(`/api/reviews?productId=${numericalId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmit = async (review: { name: string; email: string; rating: number; title: string; comment: string }) => {
    setIsSubmitting(true);
    const numericalId = productId.includes('gid://') ? productId.split('/').pop() : productId;
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          external_id: numericalId,
          name: review.name,
          email: review.email,
          rating: review.rating,
          title: review.title,
          body: review.comment,
        }),
      });

      if (res.ok) {
        alert('Review submitted successfully! It will appear after moderation.');
        fetchReviews();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error submitting review. Please try again.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-20 pt-10 border-t border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <h2 className="text-xl md:text-2xl font-headings font-bold text-[var(--islamic-green)] leading-tight">
          Customer Reviews {productTitle && <span className="block sm:inline text-sm md:text-base text-gray-400 font-normal mt-1 sm:mt-0 sm:ml-2">for {productTitle}</span>}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
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
            reviews.map((review: Review) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      {review.verified === 'buyer' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--islamic-green)] bg-[var(--islamic-green)]/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <CheckCircle size={10} fill="currentColor" className="text-white" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">{review.title}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(review.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="relative mb-6">
                  <span className="absolute -left-2 -top-2 text-4xl text-gray-100 font-serif leading-none opacity-50">&quot;</span>
                  <p className="text-gray-600 text-sm leading-relaxed relative z-10 italic">
                    {review.body}
                  </p>
                  <span className="absolute -right-2 -bottom-4 text-4xl text-gray-100 font-serif leading-none opacity-50">&quot;</span>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200">
                    <User size={14} className="text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">{review.reviewer?.name || 'Anonymous'}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-tight">Kolkata, India</span>
                  </div>
                </div>
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
