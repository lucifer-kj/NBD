import React from 'react';

export default function Loading() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Image Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square w-full bg-gray-100 rounded-3xl animate-pulse" />
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right Column: Info Skeleton */}
          <div className="space-y-6">
            <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
            
            <div className="space-y-2">
              <div className="h-20 w-full bg-gray-100 rounded-2xl animate-pulse" />
              <div className="h-20 w-full bg-gray-100 rounded-2xl animate-pulse" />
            </div>

            <div className="flex gap-6 pt-6 border-t border-gray-100">
              <div className="h-14 flex-1 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-14 flex-1 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="mt-20 pt-10 border-t border-gray-100">
          <div className="max-w-3xl space-y-4">
            <div className="h-8 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
