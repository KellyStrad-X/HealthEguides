'use client';

import { Guide } from '@/lib/guides';
import { useState } from 'react';

interface GuideEmailCaptureProps {
  guide: Guide;
}

export default function GuideEmailCapture({ guide }: GuideEmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Submit email to API
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          guideSlug: guide.slug,
          guideTitle: guide.title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit email');
      }

      // Track events
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'email_submit', {
          guide_name: guide.title,
          guide_slug: guide.slug,
        });
        (window as any).gtag('event', 'begin_checkout', {
          value: guide.price,
          currency: 'USD',
          items: [
            {
              item_id: guide.id,
              item_name: guide.title,
              price: guide.price,
            },
          ],
        });
      }

      // Redirect to Gumroad
      window.location.href = guide.gumroadUrl;
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section id="get-guide" className="py-20 bg-[#0a0a0a]">
      <div className="section-container">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 sm:p-12">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{guide.emoji}</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Get {guide.title}
              </h2>
              <div className="text-5xl font-bold gradient-text mb-4">
                ${guide.price.toFixed(2)}
              </div>
              <p className="text-white/70">
                Enter your email to get started. You&apos;ll be redirected to secure
                checkout.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-xl py-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Get Your Guide Now - $${guide.price.toFixed(2)}`}
              </button>

              <p className="text-xs text-white/50 text-center">
                By proceeding, you agree to receive emails about this purchase. You
                can unsubscribe at any time.
              </p>
            </form>

            {/* Trust badges */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <span>Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-8 text-center text-white/60 text-sm">
            <p className="mb-2">⭐⭐⭐⭐⭐</p>
            <p>Join 5,000+ women who trust our guides</p>
          </div>
        </div>
      </div>
    </section>
  );
}
