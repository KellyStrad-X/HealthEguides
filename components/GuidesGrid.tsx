'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Guide } from '@/lib/guides';
import GuideCard from './GuideCard';
import SubscriptionModal from './SubscriptionModal';

export default function GuidesGrid() {
  const { user } = useAuth();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

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
      <section id="catalog" className="py-20 bg-[#0a0a0a] scroll-mt-[120px]">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Browse Our Guides
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-6">
              Evidence-based solutions for wellness, health, and lifestyle
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Catalog
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mb-4"></div>
            <p className="text-white/60">Loading guides...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.slice(0, 6).map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          {user ? (
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-full bg-gradient-purple hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Full Catalog
              <span>→</span>
            </Link>
          ) : (
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-full bg-gradient-purple hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Access to All Our Guides
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </div>
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
