'use client';

import { useState } from 'react';
import { guides } from '@/lib/guides';

// Placeholder guides (will eventually be replaced with most popular)
const placeholderGuides = [
  {
    id: 'placeholder-1',
    title: 'Thyroid Health Essentials',
    description: 'Master your thyroid health with comprehensive strategies for optimal hormone balance.',
    emoji: '🦋',
    category: 'Hormone Health'
  },
  {
    id: 'placeholder-2',
    title: 'Stress & Cortisol Management',
    description: 'Learn to balance cortisol and reduce stress for better health and energy.',
    emoji: '🧘‍♀️',
    category: 'Wellness'
  },
  {
    id: 'placeholder-3',
    title: 'Sleep Optimization Guide',
    description: 'Evidence-based strategies for deep, restorative sleep every night.',
    emoji: '😴',
    category: 'Wellness'
  },
  {
    id: 'placeholder-4',
    title: 'Gut Health Revolution',
    description: 'Heal your gut and transform your overall health with proven protocols.',
    emoji: '🌿',
    category: 'Digestive Health'
  },
  {
    id: 'placeholder-5',
    title: 'Energy & Vitality Boost',
    description: 'Combat fatigue and reclaim your energy with natural solutions.',
    emoji: '⚡',
    category: 'Wellness'
  },
  {
    id: 'placeholder-6',
    title: 'Weight Management Guide',
    description: 'Sustainable, evidence-based approach to reaching your ideal weight.',
    emoji: '🎯',
    category: 'Wellness'
  },
];

const allGuides = [...guides, ...placeholderGuides];

export default function BundleOffer() {
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleGuide = (guideId: string) => {
    if (selectedGuides.includes(guideId)) {
      setSelectedGuides(selectedGuides.filter(id => id !== guideId));
    } else if (selectedGuides.length < 3) {
      setSelectedGuides([...selectedGuides, guideId]);
    }
  };

  const handleClaimBundle = () => {
    if (selectedGuides.length !== 3) {
      return;
    }
    setShowEmailCapture(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Track event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'bundle_claim', {
          selected_guides: selectedGuides,
          bundle_price: 10,
        });
      }

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          guideIds: selectedGuides,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section id="bundle-offer" className="py-20 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-[150px]">🎁</div>
        <div className="absolute bottom-10 right-10 text-[150px]">✨</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[200px]">💝</div>
      </div>

      <div className="section-container relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-4">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-sm uppercase tracking-wide">Limited Time Bundle</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            3 Guides for Just $10
          </h2>

          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-2">
            Save over 40%! Choose any 3 guides and get instant access.
          </p>

          <div className="flex items-center justify-center gap-4 text-lg">
            <span className="line-through text-white/60">$14.97</span>
            <span className="text-3xl font-bold text-yellow-300">$10.00</span>
            <span className="bg-yellow-300 text-purple-900 px-3 py-1 rounded-full font-bold text-sm">
              SAVE $4.97
            </span>
          </div>
        </div>

        {/* Guide selection */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 relative">
            <div className="text-center mb-6">
              <p className="text-lg font-semibold mb-2">
                Select Your 3 Guides ({selectedGuides.length}/3)
              </p>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-300 to-green-400 transition-all duration-300"
                  style={{ width: `${(selectedGuides.length / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allGuides.map((guide, index) => {
                const isSelected = selectedGuides.includes(guide.id);
                const isDisabled = !isSelected && selectedGuides.length >= 3;
                const isHidden = !showMore && index >= 3;

                return (
                  <button
                    key={guide.id}
                    onClick={() => !isDisabled && toggleGuide(guide.id)}
                    disabled={isDisabled}
                    className={`
                      p-4 rounded-xl border-2 transition-all duration-500 ease-in-out text-left
                      ${isHidden ? 'opacity-0 scale-95 h-0 overflow-hidden p-0 border-0' : 'opacity-100 scale-100'}
                      ${isSelected
                        ? 'border-yellow-300 bg-yellow-300/20 scale-105'
                        : isDisabled
                          ? 'border-white/20 bg-white/5 opacity-50 cursor-not-allowed'
                          : 'border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/20 hover:scale-105 cursor-pointer'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">{guide.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                          {guide.title}
                        </h3>
                        <p className="text-xs text-white/70 line-clamp-2">
                          {guide.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <span className="text-yellow-300 text-2xl">✓</span>
                        ) : (
                          <span className="text-white/40 text-2xl">○</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* See More / See Less Button - Small and bottom right */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowMore(!showMore)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-300 font-medium"
              >
                {showMore ? (
                  <>
                    <span>See Less</span>
                    <span className="text-sm">↑</span>
                  </>
                ) : (
                  <>
                    <span>See More</span>
                    <span className="text-sm">↓</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CTA Button / Email Capture */}
        <div className="text-center">
          {!showEmailCapture ? (
            <>
              <button
                onClick={handleClaimBundle}
                disabled={selectedGuides.length !== 3}
                className={`
                  px-12 py-5 text-xl font-bold rounded-full shadow-2xl transition-all duration-300
                  ${selectedGuides.length === 3
                    ? 'bg-yellow-300 text-purple-900 hover:bg-yellow-200 hover:scale-105 cursor-pointer'
                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                  }
                `}
              >
                {selectedGuides.length === 3
                  ? '🎉 Claim Bundle for $10 →'
                  : `Select ${3 - selectedGuides.length} More Guide${3 - selectedGuides.length !== 1 ? 's' : ''}`
                }
              </button>

              {selectedGuides.length === 3 && (
                <p className="mt-4 text-sm text-white/80">
                  ✓ Instant access • ✓ Read on any device • ✓ Money-back guarantee
                </p>
              )}
            </>
          ) : (
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Almost There!</h3>
              <p className="text-white/90 mb-6">
                Enter your email to complete your bundle purchase
              </p>

              <form onSubmit={handleCheckout} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
                />

                {error && (
                  <div className="text-red-300 text-sm text-center bg-red-500/20 border border-red-300/30 rounded-lg py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full px-8 py-4 bg-yellow-300 text-purple-900 rounded-lg font-bold text-lg hover:bg-yellow-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Checkout - $10'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailCapture(false);
                    setEmail('');
                    setError('');
                  }}
                  className="w-full px-4 py-2 text-white/70 hover:text-white text-sm transition-colors"
                >
                  ← Change Selection
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
