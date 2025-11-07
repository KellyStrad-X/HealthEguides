'use client';

import { useState, useEffect } from 'react';
import { Guide } from '@/lib/guides';
import SaleHeader from '@/components/SaleHeader';
import Header from '@/components/Header';
import GuideLandingHero from '@/components/GuideLandingHero';
import GuideProblemAgitation from '@/components/GuideProblemAgitation';
import GuideBenefits from '@/components/GuideBenefits';
import GuideEmailCapture from '@/components/GuideEmailCapture';
import SubscriptionModal from '@/components/SubscriptionModal';
import { trackViewContent } from '@/components/MetaPixel';

interface GuidePageClientProps {
  guide: Guide;
}

export default function GuidePageClient({ guide }: GuidePageClientProps) {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Track ViewContent event when guide page loads
  useEffect(() => {
    trackViewContent(guide.title, guide.id, guide.price);
  }, [guide]);

  return (
    <>
      <SaleHeader onClaimClick={() => setShowSubscriptionModal(true)} />
      <Header />
      <GuideLandingHero guide={guide} />
      <GuideProblemAgitation guide={guide} />
      <GuideBenefits guide={guide} />
      <GuideEmailCapture guide={guide} />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  );
}
