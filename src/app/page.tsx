import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Hero from "@/components/marketing/Hero";
import Faq from "@/components/marketing/Faq";
import PricingTable from "@/components/marketing/PricingTable";
import {
  CtaBand,
  FeatureSplits,
  Integrations,
  Metrics,
  Testimonials,
  ToolGrid,
} from "@/components/marketing/Sections";
import { sectionLabel } from "@/components/brand";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ToolGrid />
        <FeatureSplits />
        <Metrics />
        <Integrations />
        <PricingTable />

        <section id="faq" className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className={sectionLabel}>FAQ</span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
                Questions teams ask before switching
              </h2>
            </div>
            <Faq />
          </div>
        </section>

        <Testimonials />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
