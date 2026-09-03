import React from "react";

interface ProductCardSkeletonProps {
  className?: string;
}

export default function ProductCardSkeleton({ className = "" }: ProductCardSkeletonProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100/80 p-3.5 sm:p-4 flex flex-col justify-between shadow-xs overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div>
        {/* Image Placeholder */}
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-3 animate-shimmer" />

        {/* Category Pill Placeholder */}
        <div className="h-3 w-16 rounded-full mb-2 animate-shimmer" />

        {/* Title Lines */}
        <div className="space-y-1.5 mb-2.5">
          <div className="h-4 w-11/12 rounded-md animate-shimmer" />
          <div className="h-4 w-3/4 rounded-md animate-shimmer" />
        </div>

        {/* Rating Stars Placeholder */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-xs animate-shimmer" />
          ))}
        </div>
      </div>

      <div>
        {/* Price Row Placeholder */}
        <div className="flex items-baseline justify-between mb-3 pt-2 border-t border-gray-50">
          <div className="h-5 w-20 rounded-md animate-shimmer" />
          <div className="h-3 w-12 rounded-md animate-shimmer" />
        </div>

        {/* Add to Cart Full-Width Block Button Placeholder (mobile & desktop) */}
        <div className="w-full h-11 min-h-[44px] rounded-xl animate-shimmer" />
      </div>
    </div>
  );
}
