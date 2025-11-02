import { notFound } from 'next/navigation';
import { getGuideBySlug, getAllGuideSlugs } from '@/lib/guides';
import type { Metadata } from 'next';
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

// Only match slugs from generateStaticParams - don't catch other routes like /catalog, /about, etc.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = getGuideBySlug(params.slug);

  if (!guide) {
    return {
      title: 'Guide Not Found',
    };
  }

  return {
    title: `${guide.title} | Health E-Guides`,
    description: guide.metaDescription,
    keywords: guide.keywords.join(', '),
  };
}

export default function GuidePage({ params }: PageProps) {
  const guide = getGuideBySlug(params.slug);

  if (!guide) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <SaleHeader />
      <GuideLandingHero guide={guide} />
      <GuideProblemAgitation guide={guide} />
      <GuideBenefits guide={guide} />
      <GuideEmailCapture guide={guide} />
      <Footer />
    </main>
  );
}
