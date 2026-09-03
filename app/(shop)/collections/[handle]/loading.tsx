import React from "react";
import GridSkeleton from "@/components/skeletons/GridSkeleton";
import CategoryPillsSkeleton from "@/components/skeletons/CategoryPillsSkeleton";

export default function CollectionLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12" aria-hidden="true">
      {/* Title & Description Placeholder */}
      <div className="mb-8 text-center">
        <div className="h-9 md:h-12 w-64 mx-auto rounded-xl mb-3 animate-shimmer" />
        <div className="h-4 w-96 max-w-full mx-auto rounded-md animate-shimmer" />
      </div>

      {/* Mobile Category Strip Skeleton */}
      <div className="lg:hidden">
        <CategoryPillsSkeleton />
      </div>

      {/* Product Grid Skeleton */}
      <GridSkeleton count={8} />
    </div>
  );
}
