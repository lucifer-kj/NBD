import React from "react";
import GridSkeleton from "@/components/skeletons/GridSkeleton";

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12" aria-hidden="true">
      {/* Search Input Bar Skeleton */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="h-12 w-full rounded-2xl animate-shimmer" />
      </div>

      {/* Results Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-4 w-36 rounded-md animate-shimmer" />
        <div className="h-8 w-24 rounded-lg animate-shimmer" />
      </div>

      {/* Results Grid Skeleton */}
      <GridSkeleton count={8} />
    </div>
  );
}
