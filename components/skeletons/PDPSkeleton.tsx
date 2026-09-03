import React from "react";

export default function PDPSkeleton() {
  return (
    <div className="bg-white min-h-screen" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-12 rounded-md animate-shimmer" />
          <div className="h-3 w-3 rounded-full animate-shimmer" />
          <div className="h-4 w-20 rounded-md animate-shimmer" />
          <div className="h-3 w-3 rounded-full animate-shimmer" />
          <div className="h-4 w-32 rounded-md animate-shimmer" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left Column: Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-3xl overflow-hidden animate-shimmer shadow-xs" />
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-16 rounded-xl shrink-0 animate-shimmer" />
              ))}
            </div>
          </div>

          {/* Right Column: Details Skeleton */}
          <div className="space-y-6">
            {/* Tag / Category */}
            <div className="h-6 w-28 rounded-full animate-shimmer" />

            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 md:h-10 w-full max-w-md rounded-xl animate-shimmer" />
              <div className="h-8 md:h-10 w-2/3 rounded-xl animate-shimmer" />
            </div>

            {/* Price & Rating */}
            <div className="flex items-center gap-4">
              <div className="h-8 w-28 rounded-xl animate-shimmer" />
              <div className="h-5 w-24 rounded-full animate-shimmer" />
            </div>

            {/* Specs / Care Quick Triggers on Mobile */}
            <div className="flex gap-3 pt-2">
              <div className="flex-1 h-14 rounded-xl animate-shimmer" />
              <div className="flex-1 h-14 rounded-xl animate-shimmer" />
            </div>

            {/* Description Lines */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <div className="h-4 w-full rounded-md animate-shimmer" />
              <div className="h-4 w-5/6 rounded-md animate-shimmer" />
              <div className="h-4 w-3/4 rounded-md animate-shimmer" />
            </div>

            {/* Quantity Selector & Action Buttons (Desktop) */}
            <div className="hidden lg:flex items-center gap-4 pt-6 border-t border-gray-100">
              <div className="w-32 h-14 rounded-xl animate-shimmer" />
              <div className="flex-1 h-14 rounded-xl animate-shimmer" />
              <div className="flex-1 h-14 rounded-xl animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Conversion Bar Placeholder */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-[90] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-2 max-w-md mx-auto">
          <div className="flex justify-between items-center">
            <div className="h-3 w-28 rounded-md animate-shimmer" />
            <div className="h-4 w-16 rounded-md animate-shimmer" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-11 rounded-xl animate-shimmer" />
            <div className="flex-1 h-11 rounded-xl animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
