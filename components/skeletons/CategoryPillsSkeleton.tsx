import React from "react";

export default function CategoryPillsSkeleton() {
  return (
    <div 
      className="flex overflow-x-auto gap-2 pb-2 mb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4"
      aria-hidden="true"
    >
      {[100, 80, 110, 90, 85, 95].map((width, i) => (
        <div
          key={i}
          style={{ width: `${width}px` }}
          className="shrink-0 h-10 rounded-full animate-shimmer"
        />
      ))}
    </div>
  );
}
