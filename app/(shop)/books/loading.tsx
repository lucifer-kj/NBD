import React from 'react';

export default function BooksLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center animate-pulse">
        {/* Title Skeleton */}
        <div className="h-10 md:h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-4" />
        <div className="h-1 w-24 bg-[var(--islamic-gold)]/30 rounded mx-auto mb-6" />
        {/* Subtitle Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-full max-w-xl mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 max-w-md mx-auto" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-[#F8F6F3] p-6 rounded-2xl border border-gray-100/50 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="space-y-3 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 animate-pulse">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-10 w-44 bg-gray-200 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="bg-white border border-[#e9e3d9]/60 rounded-2xl p-5 flex flex-col justify-between h-[360px] animate-pulse"
              >
                {/* Image Placeholder */}
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl mb-4" />
                
                {/* Title and Ratings */}
                <div className="space-y-3 flex-1 mb-4">
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, starIndex) => (
                      <div key={starIndex} className="w-3.5 h-3.5 rounded-full bg-gray-200" />
                    ))}
                  </div>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="space-y-1">
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="h-10 w-24 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
