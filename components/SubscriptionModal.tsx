'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  featuredGuides?: Array<{
    emoji: string;
    title: string;
    description: string;
  }>;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscriptionModal({ isOpen, onClose, featuredGuides }: SubscriptionModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Default featured guides if none provided
  const defaultGuides = [
    {
      emoji: '😴',
      title: 'Sleep Optimization Guide',
      description: 'Science-backed strategies for better sleep quality'
    },
    {
      emoji: '✨',
      title: 'Retinol Guide',
      description: 'Everything you need to know about retinol skincare'
    },
    {
      emoji: '🧘',
      title: 'Stress and Cortisol Management',
      description: 'Proven techniques to reduce stress and balance hormones'
    }
  ];

  const guides = featuredGuides || defaultGuides;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create checkout session - API will determine price ID based on plan
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan, // Send plan type, not price ID
          email,
          userId: user?.uid || undefined,
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
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to start subscription. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 w-full sm:rounded-2xl sm:max-w-2xl max-h-screen overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close button */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-50/95 via-purple-50/95 to-pink-50/95 backdrop-blur-sm z-10 flex justify-end p-4 border-b border-purple-100">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 bg-white/60 hover:bg-white/80 rounded-full p-2 transition-all shadow-sm"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 md:p-8 pb-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Get Access to All Guides</h2>
            <p className="text-gray-700">Start your 7-day free trial today</p>
          </div>

          {/* Featured Guides */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-purple-700 uppercase mb-4">Includes Access To:</h3>
            <div className="space-y-3">
              {guides.map((guide, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 hover:border-purple-200 transition-all shadow-sm">
                  <span className="text-2xl flex-shrink-0">{guide.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{guide.title}</h4>
                    <p className="text-sm text-gray-700">{guide.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Women Trust Us */}
          <div className="mb-8 bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-purple-900 mb-3">Why Women Trust Our Guides</h3>
            <ul className="space-y-2.5 text-sm text-purple-900">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>New guides released every Friday</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Focused on women's health and well-being</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Comprehensive guides covering all life stages</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime - no commitments</span>
              </li>
            </ul>
          </div>

          {/* Pricing Options */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Choose Your Plan</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`p-5 rounded-xl border-2 transition-all shadow-sm ${
                  selectedPlan === 'monthly'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md'
                    : 'border-purple-200 bg-white/60 hover:border-purple-300 hover:shadow'
                }`}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">$5</p>
                  <p className="text-sm text-gray-700">per month</p>
                  {selectedPlan === 'monthly' && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-full">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setSelectedPlan('annual')}
                className={`p-5 rounded-xl border-2 transition-all relative shadow-sm ${
                  selectedPlan === 'annual'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md'
                    : 'border-purple-200 bg-white/60 hover:border-purple-300 hover:shadow'
                }`}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-md">
                    Save $10
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">$50</p>
                  <p className="text-sm text-gray-700">per year</p>
                  {selectedPlan === 'annual' && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-full">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </button>
            </div>
            <p className="text-xs text-gray-600 text-center mt-3">
              7-day free trial • Cancel anytime
            </p>
          </div>

          {/* Email Input */}
          {!user && (
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          )}

          {/* Terms checkbox */}
          <div className="mb-6">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-purple-600 hover:text-purple-700 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-purple-600 hover:text-purple-700 font-medium">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Subscribe button */}
          <button
            onClick={handleSubscribe}
            disabled={loading || !agreedToTerms}
            className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Start Free Trial'}
          </button>

          <p className="text-xs text-gray-600 text-center mt-4">
            You won't be charged until your 7-day trial ends. Cancel anytime before then at no cost.
          </p>
        </div>
      </div>
    </div>
  );
}
