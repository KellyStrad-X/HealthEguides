'use client';

import { useState } from 'react';

export default function BundleOffer() {
  const [email, setEmail] = useState('');
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleStartTrial = () => {
    setShowEmailCapture(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Track event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'begin_subscription', {
          subscription_type: 'trial',
        });
      }

      // Create Stripe subscription checkout session
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          plan: 'monthly', // Default to monthly plan
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
    <section id="subscription" className="py-20 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 relative overflow-hidden">
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
            <span className="font-bold text-sm uppercase tracking-wide">Try Free for 7 Days</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Start Your 7-Day Free Trial
          </h2>

          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-2">
            Get unlimited access to all our guides. Just $5/month or $50/year after trial.
          </p>

          <div className="flex items-center justify-center gap-4 text-lg">
            <span className="text-3xl font-bold text-yellow-300">7 Days Free</span>
            <span className="bg-yellow-300 text-purple-900 px-3 py-1 rounded-full font-bold text-sm">
              Cancel Anytime
            </span>
          </div>
        </div>

        {/* What's Included */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-6">What You'll Get</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h4 className="font-semibold mb-1">Unlimited Access</h4>
                  <p className="text-sm text-white/80">All current and future guides included</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h4 className="font-semibold mb-1">Read Anywhere</h4>
                  <p className="text-sm text-white/80">Access on any device, anytime</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <h4 className="font-semibold mb-1">Regular Updates</h4>
                  <p className="text-sm text-white/80">Guides updated with latest research</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h4 className="font-semibold mb-1">Cancel Anytime</h4>
                  <p className="text-sm text-white/80">No long-term commitment required</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button / Email Capture */}
        <div className="text-center">
          {!showEmailCapture ? (
            <>
              <button
                onClick={handleStartTrial}
                className="px-12 py-5 text-xl font-bold rounded-full shadow-2xl transition-all duration-300 bg-yellow-300 text-purple-900 hover:bg-yellow-200 hover:scale-105 cursor-pointer"
              >
                🎉 Start Your Free Trial →
              </button>

              <p className="mt-4 text-sm text-white/80">
                ✓ 7 days free • ✓ All guides included • ✓ Cancel anytime
              </p>
            </>
          ) : (
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Almost There!</h3>
              <p className="text-white/90 mb-6">
                Enter your email to start your 7-day free trial
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

                {/* Terms Agreement Checkbox */}
                <div className="border-2 border-yellow-300/40 rounded-lg p-5 bg-yellow-300/10">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="subscription-terms-agreement"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-2 border-yellow-300 bg-white/10 text-yellow-300 focus:ring-2 focus:ring-yellow-300 focus:ring-offset-0 cursor-pointer"
                      required
                    />
                    <label htmlFor="subscription-terms-agreement" className="text-sm text-white leading-relaxed cursor-pointer">
                      <span className="font-semibold">Required:</span> I agree to the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline font-semibold">
                        Terms of Service
                      </a>
                      {' '}and{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline font-semibold">
                        Privacy Policy
                      </a>
                      . I understand these guides provide educational information only and are not medical advice. Results may vary.
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="text-red-300 text-sm text-center bg-red-500/20 border border-red-300/30 rounded-lg py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !agreedToTerms}
                  className="w-full px-8 py-4 bg-yellow-300 text-purple-900 rounded-lg font-bold text-lg hover:bg-yellow-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Start Free Trial'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailCapture(false);
                    setEmail('');
                    setError('');
                    setAgreedToTerms(false);
                  }}
                  className="w-full px-4 py-2 text-white/70 hover:text-white text-sm transition-colors"
                >
                  ← Go Back
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
