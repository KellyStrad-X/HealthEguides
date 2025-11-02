import { notFound } from 'next/navigation';
import { getGuideBySlug, getAllGuideSlugs } from '@/lib/guides';
import type { Metadata } from 'next';
import { HeaderProvider } from '@/lib/headerContext';
import SaleHeader from '@/components/SaleHeader';
import GuideLandingHero from '@/components/GuideLandingHero';
import GuideProblemAgitation from '@/components/GuideProblemAgitation';
import GuideBenefits from '@/components/GuideBenefits';
import GuideEmailCapture from '@/components/GuideEmailCapture';
import Footer from '@/components/Footer';

interface PageProps {
  params: {
    slug: string;
  };
}

// Allow dynamic params to support Firebase-created guides
// Static routes like /catalog, /about etc. will still match first due to Next.js routing priority
export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({
    slug: slug,
  }));
}

async function fetchGuideBySlug(slug: string) {
  // Try to get from hardcoded guides first (faster)
  const hardcodedGuide = getGuideBySlug(slug);
  if (hardcodedGuide) {
    return hardcodedGuide;
  }

  // If not found in hardcoded, fetch from API to check Firebase
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/guides`, {
      cache: 'no-store' // Don't cache to ensure we get latest Firebase data
    });
    const guides = await response.json();
    return guides.find((g: any) => g.slug === slug);
  } catch (error) {
    console.error('Error fetching guides:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = await fetchGuideBySlug(params.slug);

  if (!guide) {
    return {
      title: 'Guide Not Found',
    };
  }

  return {
    title: `${guide.title} | Health E-Guides`,
    description: guide.metaDescription,
    keywords: guide.keywords?.join(', ') || '',
  };
}

export default async function GuidePage({ params }: PageProps) {
  const guide = await fetchGuideBySlug(params.slug);

  if (!guide) {
    notFound();
  }

  return (
    <HeaderProvider>
      <main className="min-h-screen">
        <SaleHeader />
        <GuideLandingHero guide={guide} />
        <GuideProblemAgitation guide={guide} />
        <GuideBenefits guide={guide} />
        <GuideEmailCapture guide={guide} />
        <Footer />
      </main>
    </HeaderProvider>
  );
}
