'use client';

import { Guide } from '@/lib/guides';
import { useState, useRef, useEffect } from 'react';
import SubscriptionModal from './SubscriptionModal';

interface GuideEmailCaptureProps {
  guide: Guide;
}

export default function GuideEmailCapture({ guide }: GuideEmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and medical disclaimer to continue.');
      return;
    }

    // Track subscription begin event (Google Analytics)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'begin_subscription', {
        from_guide: guide.id,
        guide_name: guide.title,
      });
    }

    // Open subscription modal to let user choose plan
    setShowSubscriptionModal(true);
  };

  return (
    <section id="get-guide" className="py-12 sm:py-20 bg-[#0a0a0a]">
      <div className="section-container">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-6 sm:p-8 md:p-12">
            <div className="text-center mb-6 sm:mb-8">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">{guide.emoji}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Get {guide.title} + All Our Guides
              </h2>
              <div className="mb-3 sm:mb-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full mb-2 sm:mb-3">
                  <span className="text-xl sm:text-2xl">🎉</span>
                  <span className="font-bold text-xs sm:text-sm uppercase tracking-wide">7 Days Free</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white/90">
                  Then $5/month
                </div>
              </div>
              <p className="text-sm sm:text-base text-white/70">
                Start your free trial to access this guide and our entire library.
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
                disabled={!agreedToTerms}
                className="w-full btn-primary text-xl py-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Your Free Trial
              </button>

              <p className="text-xs text-white/50 text-center">
                By proceeding, you agree to receive emails about your subscription. You
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
                  <span>🎁</span>
                  <span>7-Day Free Trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-8 text-center text-white/60 text-sm">
            <p className="mb-2">⭐⭐⭐⭐⭐</p>
            <p>Join 5,000+ women accessing our complete guide library</p>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        initialEmail={email}
        source="guide_email_capture"
      />
    </section>
  );
}
