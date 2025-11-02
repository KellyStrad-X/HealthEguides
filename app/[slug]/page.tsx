import { notFound } from 'next/navigation';
import { getAllGuideSlugs } from '@/lib/guides';
import { getGuideBySlugFromAll } from '@/lib/guide-service';
import type { Metadata } from 'next';
import { HeaderProvider } from '@/lib/headerContext';
import GuidePageClient from '@/components/GuidePageClient';
import Footer from '@/components/Footer';

interface PageProps {
  params: {
    slug: string;
  };
}

// Allow dynamic params to support Firebase-created guides
// Static routes like /catalog, /about etc. will still match first due to Next.js routing priority
export const dynamicParams = true;
export const dynamic = 'force-dynamic'; // Prevent static generation to avoid hydration issues
export const revalidate = 0; // Always fetch fresh data

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const guide = await getGuideBySlugFromAll(params.slug);

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
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Health E-Guides',
    };
  }
}

export default async function GuidePage({ params }: PageProps) {
  try {
    const guide = await getGuideBySlugFromAll(params.slug);

    if (!guide) {
      notFound();
    }

    return (
      <HeaderProvider>
        <main className="min-h-screen">
          <GuidePageClient guide={guide} />
          <Footer />
        </main>
      </HeaderProvider>
    );
  } catch (error) {
    console.error('Error loading guide page:', error);
    notFound();
  }
}
