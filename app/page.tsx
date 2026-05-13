import HeroSection from "@/components/home/HeroSection"
import NewsletterSection from "@/components/newsletter-section"
import LatestProductsSection from "@/components/latest-products-section"
import BentoGrid from "@/components/home/BentoGrid"
import LegacySection from "@/components/home/LegacySection"
import ContactInfoStrip from "@/components/home/ContactInfoStrip"
import { getProducts } from "@/lib/shopify"
import { ReshapedProduct } from "@/types/shopify"

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

      {/* Shop By Category — Gapless Bento Grid */}
      <BentoGrid />

      {/* Latest Products Section */}
      <LatestProductsSection products={products} loading={loading} />

      {/* Legacy Section — History & Vision */}
      <LegacySection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  )
}