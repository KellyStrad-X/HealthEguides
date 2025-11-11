import { HeaderProvider } from '@/lib/headerContext';
import SaleHeader from '@/components/SaleHeader';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import BundleOffer from '@/components/BundleOffer';
import GuidesGrid from '@/components/GuidesGrid';
import GuideRequestSection from '@/components/GuideRequestSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import HomePageClient from '@/components/HomePageClient';

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
        <GuideRequestSection />
        <CTASection />
        <Footer />
        <HomePageClient />
      </main>
    </HeaderProvider>
  );
}
