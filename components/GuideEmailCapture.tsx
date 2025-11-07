'use client';

import { Guide } from '@/lib/guides';
import { useState, useRef, useEffect } from 'react';
import { trackInitiateCheckout } from '@/components/MetaPixel';

interface GuideEmailCaptureProps {
  guide: Guide;
}

export default function GuideEmailCapture({ guide }: GuideEmailCaptureProps) {
  // Defensive guard for missing data
  const safePrice = typeof guide.price === 'number' && !isNaN(guide.price) ? guide.price : 0;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when section comes into view
  useEffect(() => {
    const section = document.getElementById('get-guide');
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Small delay to ensure smooth scroll completes
            setTimeout(() => {
              emailInputRef.current?.focus();
            }, 300);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate terms agreement
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and medical disclaimer to continue.');
      return;
    }

    setLoading(true);

    try {
      // Track begin_checkout event (Google Analytics)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'begin_checkout', {
          value: safePrice,
          currency: 'USD',
          items: [
            {
              item_id: guide.id,
              item_name: guide.title,
              price: safePrice,
            },
          ],
        });
      }

      // Track InitiateCheckout event (Meta Pixel)
      trackInitiateCheckout(guide.title, guide.id, safePrice);

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          guideIds: [guide.id], // Single guide purchase
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
                ${safePrice.toFixed(2)}
              </div>
              <p className="text-white/70">
                Enter your email to get started. You&apos;ll be redirected to secure
                checkout.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  ref={emailInputRef}
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

              {/* Terms Agreement Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="terms-agreement"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0"
                  required
                />
                <label htmlFor="terms-agreement" className="text-sm text-white/80 leading-relaxed">
                  I agree to the{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                  . I understand this guide provides educational information only and is not medical advice. I should consult a healthcare provider before making health decisions.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full btn-primary text-xl py-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Get Your Guide'}
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
