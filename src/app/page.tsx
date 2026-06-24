import { HeroSection } from "@/components/home/HeroSection";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { KitsSection } from "@/components/home/KitsSection";
import { RoastExplanationSection } from "@/components/home/RoastExplanationSection";
import { StorySection } from "@/components/home/StorySection";
import { OriginSection } from "@/components/home/OriginSection";
import { B2BSection } from "@/components/home/B2BSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { getSiteContent } from "@/lib/orders-db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();
  const sections = content.sections;
  return (
    <>
      <HeroSection content={content.hero} />
      <PromoCarousel
        slides={content.carousel.filter((slide) => slide.enabled)}
      />
      {sections.featuredEnabled && <FeaturedProducts />}
      {sections.kitsEnabled && <KitsSection />}
      <RoastExplanationSection />
      {sections.storyEnabled && <StorySection content={sections} />}
      {sections.originEnabled && <OriginSection />}
      {sections.b2bEnabled && <B2BSection content={sections} />}
      {sections.testimonialsEnabled && <TestimonialsSection />}
      {sections.faqEnabled && <FAQSection />}
    </>
  );
}
