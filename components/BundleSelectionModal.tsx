'use client';

import { useState, useEffect } from 'react';
import { Guide } from '@/lib/guides';
import Link from 'next/link';

interface BundleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGuide: Guide;
}

export default function BundleSelectionModal({ isOpen, onClose, currentGuide }: BundleSelectionModalProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuides, setSelectedGuides] = useState<string[]>([currentGuide.id]);
  const [email, setEmail] = useState('');
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/guides')
        .then(res => res.json())
        .then(data => {
          // Filter out coming soon guides and current guide (we'll add it back)
          const availableGuides = data.filter((g: Guide) => !g.comingSoon);

          // Get 2 recommended guides from the same category or different categories
          const sameCategory = availableGuides.filter(
            (g: Guide) => g.id !== currentGuide.id && g.category === currentGuide.category
          );
          const otherGuides = availableGuides.filter(
            (g: Guide) => g.id !== currentGuide.id && g.category !== currentGuide.category
          );

          // Pick 2 recommended guides
          const recommended = [
            ...(sameCategory.length > 0 ? [sameCategory[0]] : []),
            ...(sameCategory.length > 1 ? [sameCategory[1]] : otherGuides[0] ? [otherGuides[0]] : []),
          ].filter(Boolean);

          // If we don't have 2 recommended, fill from other guides
          while (recommended.length < 2 && otherGuides.length > recommended.length) {
            recommended.push(otherGuides[recommended.length]);
          }

          setGuides([currentGuide, ...recommended, ...availableGuides.filter(
            (g: Guide) => g.id !== currentGuide.id && !recommended.some(r => r.id === g.id)
          )]);
        })
        .catch(err => console.error('Failed to fetch guides:', err));
    }
  }, [isOpen, currentGuide]);

  const toggleGuide = (guide: Guide) => {
    if (guide.comingSoon) return;

    if (selectedGuides.includes(guide.id)) {
      // Don't allow deselecting current guide if it's the only one selected
      if (guide.id === currentGuide.id && selectedGuides.length === 1) return;
      setSelectedGuides(selectedGuides.filter(id => id !== guide.id));
    } else if (selectedGuides.length < 3) {
      setSelectedGuides([...selectedGuides, guide.id]);
    }
  };

  const handleClaimBundle = () => {
    if (selectedGuides.length !== 3) return;
    setShowEmailCapture(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'bundle_claim_from_guide', {
          from_guide: currentGuide.id,
          selected_guides: selectedGuides,
          bundle_price: 10,
        });
      }

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white text-2xl"
        >
          ×
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-4">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-sm uppercase tracking-wide">Special Bundle Offer</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white">
              3 Guides for Just $10
            </h2>

            <p className="text-lg text-white/90 mb-2">
              We&apos;ve pre-selected {currentGuide.title} for you. Choose 2 more!
            </p>

            <div className="flex items-center justify-center gap-4">
              <span className="line-through text-white/60">$14.97</span>
              <span className="text-2xl font-bold text-yellow-300">$10.00</span>
              <span className="bg-yellow-300 text-purple-900 px-3 py-1 rounded-full font-bold text-sm">
                SAVE $4.97
              </span>
            </div>
          </div>

          {!showEmailCapture ? (
            <>
              {/* Selection UI */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <p className="text-lg font-semibold mb-2 text-white">
                    Your Selection ({selectedGuides.length}/3)
                  </p>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-300 to-green-400 transition-all duration-300"
                      style={{ width: `${(selectedGuides.length / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {guides.slice(0, 6).map((guide) => {
                    const isSelected = selectedGuides.includes(guide.id);
                    const isCurrent = guide.id === currentGuide.id;
                    const isDisabled = !isSelected && selectedGuides.length >= 3;

                    return (
                      <button
                        key={guide.id}
                        onClick={() => !isDisabled && toggleGuide(guide)}
                        disabled={isDisabled}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-300 text-left relative
                          ${isSelected
                            ? 'border-yellow-300 bg-yellow-300/20 scale-105'
                            : isDisabled
                              ? 'border-white/20 bg-white/5 opacity-50 cursor-not-allowed'
                              : 'border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/20 hover:scale-105'
                          }
                        `}
                      >
                        {isCurrent && (
                          <div className="absolute top-1 right-1 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">
                            Current
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <div className="text-2xl flex-shrink-0">{guide.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-xs mb-1 line-clamp-2 text-white">
                              {guide.title}
                            </h3>
                          </div>
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <span className="text-yellow-300 text-xl">✓</span>
                            ) : (
                              <span className="text-white/40 text-xl">○</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Link to full catalog */}
                <div className="text-center pt-4 border-t border-white/20">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                  >
                    <span>Browse Full Catalog</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button
                  onClick={handleClaimBundle}
                  disabled={selectedGuides.length !== 3}
                  className={`
                    px-10 py-4 text-lg font-bold rounded-full shadow-xl transition-all duration-300
                    ${selectedGuides.length === 3
                      ? 'bg-yellow-300 text-purple-900 hover:bg-yellow-200 hover:scale-105'
                      : 'bg-white/20 text-white/50 cursor-not-allowed'
                    }
                  `}
                >
                  {selectedGuides.length === 3
                    ? '🎉 Claim Bundle for $10 →'
                    : `Select ${3 - selectedGuides.length} More Guide${3 - selectedGuides.length !== 1 ? 's' : ''}`
                  }
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4 text-white">Almost There!</h3>
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
                  className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />

                {error && (
                  <div className="text-red-300 text-sm text-center bg-red-500/20 border border-red-300/30 rounded-lg py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full px-8 py-4 bg-yellow-300 text-purple-900 rounded-lg font-bold text-lg hover:bg-yellow-200 transition-all disabled:opacity-50"
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
    </div>
  );
}
