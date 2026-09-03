import React from "react";
import GridSkeleton from "@/components/skeletons/GridSkeleton";
import CategoryPillsSkeleton from "@/components/skeletons/CategoryPillsSkeleton";

export default function BooksLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12" aria-hidden="true">
      {/* Title Skeleton */}
      <div className="mb-8 md:mb-10 text-center">
        <div className="h-9 md:h-12 w-64 rounded-xl mx-auto mb-3 animate-shimmer" />
        <div className="h-1 w-24 bg-[var(--islamic-gold)]/40 rounded mx-auto mb-4" />
        <div className="h-4 rounded-md w-full max-w-xl mx-auto mb-2 animate-shimmer" />
        <div className="h-4 rounded-md w-2/3 max-w-md mx-auto animate-shimmer" />
      </div>

      {/* Mobile Category Pill Strip Skeleton */}
      <div className="md:hidden">
        <CategoryPillsSkeleton />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar Skeleton */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-[#F8F6F3] p-6 rounded-2xl border border-gray-100/60 space-y-4">
            <div className="h-6 w-32 rounded-md animate-shimmer" />
            <div className="space-y-3 pt-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full animate-shimmer" />
                  <div className="h-4 w-28 rounded-md animate-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div className="h-4 w-36 rounded-md animate-shimmer" />
            <div className="h-10 w-40 rounded-xl animate-shimmer" />
          </div>

          <GridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
