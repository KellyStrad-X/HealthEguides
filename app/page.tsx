import { HeaderProvider } from '@/lib/headerContext';
import SaleHeader from '@/components/SaleHeader';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import BundleOffer from '@/components/BundleOffer';
import GuidesGrid from '@/components/GuidesGrid';
import WhyChooseUs from '@/components/WhyChooseUs';
import GuideRequestSection from '@/components/GuideRequestSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <HeaderProvider>
      <main className="min-h-screen">
        <SaleHeader />
        <Header />
        <Hero />
        <Stats />
        <BundleOffer />
        <GuidesGrid />
        <WhyChooseUs />
        <GuideRequestSection />
        <CTASection />
        <Footer />
      </main>
    </HeaderProvider>
  );
}
