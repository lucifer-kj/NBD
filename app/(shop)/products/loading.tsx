import React from 'react';

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Title block */}
      <div className="mb-10 text-center animate-pulse">
        <div className="h-10 md:h-12 w-80 bg-gray-200 rounded-lg mx-auto mb-4" />
        <div className="h-1 w-24 bg-[var(--islamic-gold)]/30 rounded mx-auto mb-6" />
        <div className="h-4 bg-gray-200 rounded w-full max-w-xl mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 max-w-sm mx-auto" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter controls skeleton */}
        <div className="w-full lg:w-64 flex-shrink-0 animate-pulse space-y-6">
          <div className="bg-[#F8F6F3] p-6 rounded-2xl border border-gray-100/50 space-y-4">
            <div className="h-6 w-36 bg-gray-200 rounded" />
            <div className="space-y-3 pt-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid skeleton */}
        <div className="flex-1">
          {/* Header toolbar */}
          <div className="flex justify-between items-center mb-6 animate-pulse">
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="flex gap-3">
              <div className="h-10 w-36 bg-gray-200 rounded-lg" />
              <div className="h-10 w-28 bg-gray-200 rounded-lg" />
            </div>
          </div>

          {/* Grid list of cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="bg-white border border-[#e9e3d9]/60 rounded-2xl p-4 flex flex-col justify-between h-[340px] animate-pulse"
              >
                {/* Image Placeholder */}
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl mb-4" />
                
                {/* Text and rating placeholders */}
                <div className="space-y-3 flex-1 mb-4">
                  <div className="h-4 w-11/12 bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, starIndex) => (
                      <div key={starIndex} className="w-3 h-3 rounded-full bg-gray-200" />
                    ))}
                  </div>
                </div>

                {/* Price block */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="space-y-1">
                    <div className="h-3 w-10 bg-gray-200 rounded" />
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </div>
                  <div className="h-9 w-20 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
