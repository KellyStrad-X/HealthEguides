'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { HeaderProvider } from '@/lib/headerContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Subscription } from '@/lib/types/subscription';

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/get', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setSubscription(null);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription(data.subscription);
    } catch (err) {
    // Error log removed - TODO: Add proper error handling
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    setError('');

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      await fetchSubscription(); // Refresh data
      alert('Subscription canceled successfully. You will retain access until the end of your billing period.');
    } catch (err) {
    // Error log removed - TODO: Add proper error handling
      setError('Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <HeaderProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="[&>header]:!top-0">
          <Header />
        </div>

        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Subscription</h1>
            <p className="text-gray-600">View and manage your HealthEGuides subscription</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* No subscription */}
          {!subscription && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h2>
              <p className="text-gray-600 mb-6">You don't have an active subscription yet.</p>
              <button
                onClick={() => router.push('/catalog')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Browse Guides & Subscribe
              </button>
            </div>
          )}

          {/* Active subscription */}
          {subscription && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Status badge */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Subscription Status</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                    subscription.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                    subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription.status === 'trialing' ? 'Free Trial' :
                     subscription.status === 'active' ? 'Active' :
                     subscription.status === 'past_due' ? 'Payment Failed' :
                     subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Subscription details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Plan</p>
                    <p className="font-semibold text-gray-900">
                      ${(subscription.amount / 100).toFixed(2)} / {subscription.interval}
                    </p>
                  </div>

                  {subscription.trialEnd && subscription.status === 'trialing' && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Trial Ends</p>
                      <p className="font-semibold text-gray-900">{formatDate(subscription.trialEnd)}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current Period Ends</p>
                    <p className="font-semibold text-gray-900">{formatDate(subscription.currentPeriodEnd)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Next Billing Date</p>
                    <p className="font-semibold text-gray-900">
                      {subscription.cancelAtPeriodEnd ?
                        'Not scheduled (canceling)' :
                        formatDate(subscription.currentPeriodEnd)
                      }
                    </p>
                  </div>
                </div>

                {/* Trial info */}
                {subscription.status === 'trialing' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>You're on a free trial!</strong> Your subscription will automatically start on {formatDate(subscription.trialEnd!)} unless you cancel before then.
                    </p>
                  </div>
                )}

                {/* Cancellation pending */}
                {subscription.cancelAtPeriodEnd && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Subscription Canceled</strong> - You will retain access to all guides until {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                )}

                {/* Payment failed */}
                {subscription.status === 'past_due' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      <strong>Payment Failed</strong> - Please update your payment method to avoid losing access to your guides.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
                {!subscription.cancelAtPeriodEnd && subscription.status !== 'canceled' && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={canceling}
                    className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {canceling ? 'Canceling...' : 'Cancel Subscription'}
                  </button>
                )}

                <button
                  onClick={() => router.push('/catalog')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Browse Guides
                </button>
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/account')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Account
            </button>
          </div>
        </div>
        </main>

        <Footer />
      </div>
    </HeaderProvider>
  );
}
