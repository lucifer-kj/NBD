import React from "react";
import GridSkeleton from "@/components/skeletons/GridSkeleton";

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12" aria-hidden="true">
      {/* Title Placeholder */}
      <div className="mb-8 text-center">
        <div className="h-8 md:h-10 w-48 mx-auto rounded-xl mb-3 animate-shimmer" />
        <div className="h-4 w-72 mx-auto rounded-md animate-shimmer" />
      </div>

      <GridSkeleton count={8} />
    </div>
  );
}
