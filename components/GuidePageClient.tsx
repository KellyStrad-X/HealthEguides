'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Guide } from '@/lib/guides';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import Header from '@/components/Header';
import GuideLandingHero from '@/components/GuideLandingHero';
import GuideProblemAgitation from '@/components/GuideProblemAgitation';
import GuideBenefits from '@/components/GuideBenefits';
import GuideEmailCapture from '@/components/GuideEmailCapture';
import GuideOverview from '@/components/GuideOverview';
import SubscriptionModal from '@/components/SubscriptionModal';
import { trackViewContent } from '@/components/MetaPixel';

interface GuidePageClientProps {
  guide: Guide;
}

export default function GuidePageClient({ guide }: GuidePageClientProps) {
  const { user } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Track ViewContent event when guide page loads
  useEffect(() => {
    trackViewContent(guide.title, guide.id, guide.price || 0);
  }, [guide]);

  // Show simplified overview for logged-in users
  if (user) {
    return (
      <>
        <ScrollProgressBar />
        <Header />
        <GuideOverview guide={guide} />
      </>
    );
  }

  // Show full sales page for non-logged-in users
  return (
    <>
      <ScrollProgressBar />
      <Header />
      <GuideLandingHero guide={guide} />
      <GuideProblemAgitation guide={guide} />
      <GuideBenefits guide={guide} />
      <GuideEmailCapture guide={guide} />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        source="guide_page"
      />
    </>
  );
}
