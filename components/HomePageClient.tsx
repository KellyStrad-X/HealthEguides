'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EngagementPopup from './EngagementPopup';
import SubscriptionModal from './SubscriptionModal';
import GuideRequestForm from './GuideRequestForm';
import AnalyticsTracker from './AnalyticsTracker';

export default function HomePageClient() {
  const { user } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showGuideRequestForm, setShowGuideRequestForm] = useState(false);

  return (
    <>
      {/* Analytics Tracking */}
      <AnalyticsTracker page="homepage" />

      {/* Engagement Popup */}
      <EngagementPopup
        onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
        onOpenGuideRequestForm={() => setShowGuideRequestForm(true)}
        isUserLoggedIn={!!user}
        source="homepage"
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        source="engagement_popup_homepage"
      />

      {/* Guide Request Form Modal */}
      {showGuideRequestForm && (
        <GuideRequestForm
          isModal={true}
          onClose={() => setShowGuideRequestForm(false)}
        />
      )}
    </>
  );
}
