'use client';

import { useState, useEffect } from 'react';
import { Guide } from '@/lib/guides';
import Link from 'next/link';
import SaleHeader from '@/components/SaleHeader';
import GuideLandingHero from '@/components/GuideLandingHero';
import GuideProblemAgitation from '@/components/GuideProblemAgitation';
import GuideBenefits from '@/components/GuideBenefits';
import GuideEmailCapture from '@/components/GuideEmailCapture';
import BundleSelectionModal from '@/components/BundleSelectionModal';
import { trackViewContent } from '@/components/MetaPixel';

interface GuidePageClientProps {
  guide: Guide;
}

export default function GuidePageClient({ guide }: GuidePageClientProps) {
  const [showBundleModal, setShowBundleModal] = useState(false);

  // Track ViewContent event when guide page loads
  useEffect(() => {
    trackViewContent(guide.title, guide.id, guide.price);
  }, [guide]);

  return (
    <>
      {/* Simple Navigation Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-[#4ECDC4] hover:bg-gray-50 rounded-lg transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="font-medium">Home</span>
          </Link>

          <Link href="/" className="text-xl font-bold text-[#4ECDC4] hover:opacity-80 transition">
            Health eGuides
          </Link>

          <Link
            href="/catalog"
            className="px-4 py-2 text-gray-600 hover:text-[#4ECDC4] hover:bg-gray-50 rounded-lg transition-all font-medium"
          >
            Catalog
          </Link>
        </div>
      </header>

      <SaleHeader onClaimClick={() => setShowBundleModal(true)} />
      <GuideLandingHero guide={guide} />
      <GuideProblemAgitation guide={guide} />
      <GuideBenefits guide={guide} />
      <GuideEmailCapture guide={guide} />
      <BundleSelectionModal
        isOpen={showBundleModal}
        onClose={() => setShowBundleModal(false)}
        currentGuide={guide}
      />
    </>
  );
}
