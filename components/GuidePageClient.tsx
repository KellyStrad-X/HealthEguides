'use client';

import { useState } from 'react';
import { Guide } from '@/lib/guides';
import SaleHeader from '@/components/SaleHeader';
import GuideLandingHero from '@/components/GuideLandingHero';
import GuideProblemAgitation from '@/components/GuideProblemAgitation';
import GuideBenefits from '@/components/GuideBenefits';
import GuideEmailCapture from '@/components/GuideEmailCapture';
import BundleSelectionModal from '@/components/BundleSelectionModal';

interface GuidePageClientProps {
  guide: Guide;
}

export default function GuidePageClient({ guide }: GuidePageClientProps) {
  const [showBundleModal, setShowBundleModal] = useState(false);

  return (
    <>
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
