import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection";
import BentoGrid from "@/components/home/BentoGrid";
import LegacySection from "@/components/home/LegacySection";
import ContactInfoStrip from "@/components/home/ContactInfoStrip";
import MobileDonationBanner from "@/components/home/MobileDonationBanner";
import LatestProductsSection from "@/components/latest-products-section";
import LatestProductsSkeleton from "@/components/skeletons/LatestProductsSkeleton";
import { getProducts } from "@/lib/shopify";
import { ReshapedProduct } from "@/types/shopify";

// Below-the-fold sections loaded dynamically to keep initial mobile JS bundle lean
const FAQSection = dynamic(() => import("@/components/home/FAQSection"), {
  loading: () => <div className="py-16 max-w-4xl mx-auto px-4"><div className="h-64 rounded-3xl animate-shimmer" /></div>,
});
const BlogSection = dynamic(() => import("@/components/home/BlogSection"), {
  loading: () => <div className="py-16 max-w-7xl mx-auto px-4"><div className="h-64 rounded-3xl animate-shimmer" /></div>,
});
const SocialFollowSection = dynamic(() => import("@/components/home/SocialFollowSection"));
const NewsletterSection = dynamic(() => import("@/components/newsletter-section"));

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

// Streamed async component for trending products
async function HomeTrendingProducts() {
  let products: ReshapedProduct[] = [];
  let loading = true;
  try {
    products = await getProducts({ first: 8 });
    loading = false;
  } catch (error) {
    console.error("Error fetching homepage products:", error);
  }

  return <LatestProductsSection products={products} loading={loading} />;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <ContactInfoStrip />
      
      {/* Hero Section - paints immediately with 0 delay */}
      <HeroSection />

      {/* Mobile-Only Dedicated Donation Banner Section */}
      <MobileDonationBanner />

      {/* Shop By Category — Gapless Bento Grid */}
      <BentoGrid />

      {/* Latest Products Section — Streamed via Suspense with Custom Shimmer Skeleton */}
      <Suspense fallback={<LatestProductsSkeleton />}>
        <HomeTrendingProducts />
      </Suspense>

      {/* Legacy Section — History & Vision */}
      <LegacySection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Blog Section */}
      <BlogSection />

      {/* Social Follow Section */}
      <SocialFollowSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}