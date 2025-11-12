'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionModal from './SubscriptionModal';

export default function BundleOffer() {
  const { user } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Hide this section for logged-in users
  if (user) {
    return null;
  }

  return (
    <>
      <section id="subscription" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 relative overflow-hidden scroll-mt-[120px]">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-[100px] sm:text-[150px]">🎁</div>
          <div className="absolute bottom-10 right-10 text-[100px] sm:text-[150px]">✨</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[150px] sm:text-[200px]">💝</div>
        </div>

        <div className="section-container relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 sm:px-6 sm:py-2 rounded-full mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">🔥</span>
              <span className="font-bold text-xs sm:text-sm uppercase tracking-wide">Try Free for 7 Days</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              Start Your 7-Day Free Trial
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-2">
              Get unlimited access to all wellness & lifestyle guides. Just $5/month after trial.
            </p>

            <div className="flex items-center justify-center gap-3 sm:gap-4 text-base sm:text-lg">
              <span className="text-2xl sm:text-3xl font-bold text-yellow-300">7 Days Free</span>
              <span className="bg-yellow-300 text-purple-900 px-2 py-1 sm:px-3 sm:py-1 rounded-full font-bold text-xs sm:text-sm">
                Cancel Anytime
              </span>
            </div>
          </div>

          {/* New Guide Announcement */}
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-4 sm:p-6 shadow-2xl transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                <span className="text-2xl sm:text-3xl">📅</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">New Guide Every Sunday!</h3>
                <span className="text-2xl sm:text-3xl">🎉</span>
              </div>
              <p className="text-white text-center text-sm sm:text-base md:text-lg">
                Subscribe now and get a brand new guide delivered every Sunday. Your library keeps growing!
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="px-8 py-4 sm:px-12 sm:py-5 text-lg sm:text-xl font-bold rounded-full shadow-2xl transition-all duration-300 bg-yellow-300 text-purple-900 hover:bg-yellow-200 hover:scale-105 cursor-pointer"
            >
              🎉 Start Your Free Trial →
            </button>

            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/80">
              ✓ 7 days free • ✓ All guides included • ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        source="homepage_cta"
      />
    </>
  );
}
