import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection"
import NewsletterSection from "@/components/newsletter-section"
import LatestProductsSection from "@/components/latest-products-section"
import BentoGrid from "@/components/home/BentoGrid"
import LegacySection from "@/components/home/LegacySection"
import FAQSection from "@/components/home/FAQSection"
import BlogSection from "@/components/home/BlogSection"
import ContactInfoStrip from "@/components/home/ContactInfoStrip"
import { getProducts } from "@/lib/shopify"
import { ReshapedProduct } from "@/types/shopify"
import { Heart } from "lucide-react"

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  let products: ReshapedProduct[] = [];
  let loading = true;

  try {
    products = await getProducts({ first: 8 });
    loading = false;
  } catch (error) {
    console.error('Error fetching homepage products:', error);
  }

  return (
    <div className="min-h-screen bg-white">
      <ContactInfoStrip />
      {/* Hero Section */}
      <HeroSection />

      {/* Mobile-Only Dedicated Donation Banner Section */}
      <div className="lg:hidden block px-4 py-6 bg-[#FCFAF7] border-b border-[#e9e3d9]/60">
        <div className="max-w-md mx-auto">
          <a
            href="https://pages.razorpay.com/pl_SrYn1lmplsHeX0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-4 rounded-2xl bg-[#0D2E21] border border-[var(--islamic-gold)]/40 text-white shadow-md active:scale-98 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--islamic-gold)]">
                <Heart size={16} fill="currentColor" className="text-[var(--islamic-gold)]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold tracking-wide">Sadqa-e-Jariyah</div>
                <div className="text-[10px] text-white/50 font-light">Support our spiritual mission</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md border border-white/10">
              <svg fill="#528FF0" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
              </svg>
              <span className="text-[9px] text-white font-bold tracking-tight ml-1">Razorpay</span>
            </div>
          </a>
        </div>
      </div>

      {/* Shop By Category — Gapless Bento Grid */}
      <BentoGrid />

      {/* Latest Products Section */}
      <LatestProductsSection products={products} loading={loading} />

      {/* Legacy Section — History & Vision */}
      <LegacySection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Blog Section */}
      <BlogSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  )
}