'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Guide } from '@/lib/guides';
import GuideCard from './GuideCard';
import SubscriptionModal from './SubscriptionModal';

export default function GuidesGrid() {
  const { user } = useAuth();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/guides')
      .then(res => res.json())
      .then(data => {
        setGuides(data);
        setLoading(false);
      })
      .catch(err => {
    // Error log removed - TODO: Add proper error handling
        setLoading(false);
      });
  }, []);

  return (
    <>
      <section id="catalog" className="py-8 sm:py-20 bg-[#0a0a0a] scroll-mt-[120px]">
        <div className="section-container">
          <div className="text-center mb-6 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">
              Browse Our Guides
            </h2>
          </div>

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mb-4"></div>
            <p className="text-white/60">Loading guides...</p>
          </div>
        ) : (
          <>
            {/* Mobile Carousel */}
            <div className="md:hidden -mx-4">
              <div
                ref={carouselRef}
                className="flex overflow-x-auto gap-4 px-4 scrollbar-hide"
                style={{
                  scrollSnapType: 'none',
                }}
              >
                {guides.map((guide, index) => (
                  <div
                    key={`${guide.id}-${index}`}
                    className="flex-shrink-0"
                    style={{ width: 'calc(85% - 8px)' }}
                  >
                    <div className="scale-[0.85] origin-center">
                      <GuideCard guide={guide} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {guides.slice(0, 6).map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </>
        )}

        {/* View Catalog Button */}
        <div className="text-center mt-4 sm:mt-12 mb-4 sm:mb-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View Catalog
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Get Access Button (Non-logged in users only) */}
        {!user && (
          <div className="text-center">
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-full bg-gradient-purple hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Access to All Our Guides
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>

    {/* Subscription Modal */}
    <SubscriptionModal
      isOpen={showSubscriptionModal}
      onClose={() => setShowSubscriptionModal(false)}
    />
  </>
  );
}
