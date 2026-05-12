"use client";

import { ReshapedProduct } from "@/types/shopify";
import ProductCard from "./product-card";
import { motion } from "framer-motion";
import { useState } from "react";
import { fadeInUp, staggerContainer } from "@/lib/motion.config";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ChevronRight } from "lucide-react";

interface LatestProductsSectionProps {
  products: ReshapedProduct[];
  loading?: boolean;
  onViewAll?: () => void;
}

const skeletonArray = Array.from({ length: 4 });

export default function LatestProductsSection({ products, loading = false }: LatestProductsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const reduced = useReducedMotion();
  const [ref, inView] = useScrollReveal();
  const showViewAll = !showAll && !loading && products.length > 4;
  const visibleProducts = showAll ? products : products.slice(0, 4);

  return (
    <section className="section-padding bg-[var(--islamic-beige)]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainer}
          className="text-center mb-10 md:mb-14"
        >
          <motion.h2 variants={fadeInUp} className="text-section-fluid font-headings font-bold text-[var(--islamic-green)] mb-3">
            Latest Products
          </motion.h2>
          <motion.div variants={fadeInUp} className="gold-divider mx-auto mb-4" />
          <motion.p variants={fadeInUp} className="text-subtitle text-[var(--charcoal)]/70 max-w-2xl mx-auto">
            Check out our newest arrivals and best sellers.
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Grid for desktop/tablet */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {loading
              ? skeletonArray.map((_, i) => <ProductSkeleton key={i} />)
              : visibleProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-40px" }}
                    variants={reduced ? undefined : fadeInUp}
                  >
                    <ProductCard product={product} showWishlist={false} />
                  </motion.div>
                ))}
          </div>

          {/* Mobile horizontal scroll with snap */}
          <div className="sm:hidden flex gap-4 overflow-x-auto snap-x pb-3 -mx-4 px-4 scrollbar-thin scrollbar-thumb-[var(--islamic-gold)] scrollbar-track-transparent">
            {(loading ? skeletonArray : visibleProducts).map((item, i) => (
              <motion.div
                key={loading ? i : (item as ReshapedProduct).id}
                className="min-w-[80vw] max-w-xs snap-center flex-shrink-0"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={reduced ? undefined : fadeInUp}
              >
                {loading ? (
                  <ProductSkeleton />
                ) : (
                  <ProductCard product={item as ReshapedProduct} showWishlist={false} />
                )}
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          {showViewAll && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setShowAll(true)}
                className="btn-primary touch-target inline-flex items-center gap-2 group"
              >
                View All Products
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm flex flex-col animate-pulse overflow-hidden">
      <div className="aspect-[4/3] bg-[var(--medium-gray)] w-full" />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="h-5 bg-[var(--medium-gray)] rounded w-3/4 mb-2" />
        <div className="h-4 bg-[var(--medium-gray)] rounded w-1/2 mb-4" />
        <div className="h-10 bg-[var(--islamic-gold)]/30 rounded-xl w-full" />
      </div>
    </div>
  );
}