import React from "react";

export default function LatestProductsSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-white" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="h-8 md:h-10 w-64 mx-auto rounded-lg mb-3 animate-shimmer" />
          <div className="w-16 h-0.5 bg-[#c19a4e]/40 mx-auto" />
        </div>

        {/* Mobile Layout (md:hidden) */}
        <div className="md:hidden space-y-8">
          {/* Mobile Featured Pick Card Skeleton */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0c2e1f]/40 to-[#051d13]/60 border border-[#c19a4e]/20 h-[380px] flex flex-col justify-between overflow-hidden relative">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 rounded-full animate-shimmer" />
              <div className="h-4 w-16 rounded-full animate-shimmer" />
            </div>
            <div className="aspect-[4/3] w-full max-w-[240px] mx-auto rounded-2xl animate-shimmer" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 rounded-md animate-shimmer" />
              <div className="h-4 w-1/3 rounded-md animate-shimmer" />
              <div className="h-11 w-full rounded-xl animate-shimmer mt-2" />
            </div>
          </div>

          {/* Mobile Horizontal Card Carousel Skeleton */}
          <div>
            <div className="h-4 w-32 rounded-md mb-3 animate-shimmer" />
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory -mx-4 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-[200px] flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-3.5 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="aspect-[4/3] w-full rounded-xl mb-2.5 animate-shimmer" />
                    <div className="h-3 w-14 rounded-full mb-2 animate-shimmer" />
                    <div className="h-4 w-full rounded-md mb-1.5 animate-shimmer" />
                    <div className="h-4 w-2/3 rounded-md mb-2 animate-shimmer" />
                  </div>
                  <div className="pt-2 border-t border-gray-50">
                    <div className="h-4 w-16 rounded-md mb-2.5 animate-shimmer" />
                    <div className="h-11 w-full rounded-xl animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout (hidden md:grid) */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Featured Column Skeleton */}
          <div className="lg:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-[#0c2e1f]/30 to-[#051d13]/50 border border-[#c19a4e]/20 h-[520px] flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="h-5 w-28 rounded-full animate-shimmer" />
              <div className="h-5 w-20 rounded-full animate-shimmer" />
            </div>
            <div className="aspect-[4/3] w-3/4 mx-auto rounded-2xl animate-shimmer" />
            <div className="space-y-3">
              <div className="h-6 w-3/4 rounded-md animate-shimmer" />
              <div className="h-5 w-1/4 rounded-md animate-shimmer" />
              <div className="h-12 w-full rounded-xl animate-shimmer mt-2" />
            </div>
          </div>

          {/* Grid Products Skeleton */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="aspect-[4/3] w-full rounded-xl mb-3 animate-shimmer" />
                  <div className="h-3.5 w-16 rounded-full mb-2 animate-shimmer" />
                  <div className="h-4 w-11/12 rounded-md mb-1.5 animate-shimmer" />
                  <div className="h-4 w-2/3 rounded-md mb-2 animate-shimmer" />
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <div className="h-4 w-20 rounded-md mb-2 animate-shimmer" />
                  <div className="h-8 w-full rounded-lg animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
