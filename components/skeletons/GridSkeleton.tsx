import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";

interface GridSkeletonProps {
  count?: number;
}

export default function GridSkeleton({ count = 8 }: GridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6"
      aria-hidden="true"
    >
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
