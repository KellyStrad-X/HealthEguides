'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase-client';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, signUp, signIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [linkingSubscription, setLinkingSubscription] = useState(false);

  // Account creation form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Give the webhook a moment to process
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [searchParams]);

  // Auto-link subscription if user is already logged in
  useEffect(() => {
    const linkSubscriptionToAccount = async () => {
      if (user && !loading && !linkingSubscription && !accountCreated) {
        setLinkingSubscription(true);
        try {
          const token = await user.getIdToken();
          const response = await fetch('/api/subscription/link', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            setAccountCreated(true);
          }
        } catch (err) {
          console.error('Error linking subscription:', err);
        } finally {
          setLinkingSubscription(false);
        }
      }
    };

    linkSubscriptionToAccount();
  }, [user, loading, linkingSubscription, accountCreated]);

  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    console.log('🚀 Starting account creation process');

    try {
      // Validate password match
      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        setFormLoading(false);
        return;
      }

      if (password.length < 6) {
        setFormError('Password must be at least 6 characters');
        setFormLoading(false);
        return;
      }

      console.log('📧 Creating account for:', email);

      // Create Firebase Auth account
      const newUser = await signUp(email, password, displayName || undefined);

      console.log('✅ Firebase account created:', newUser.uid);

      // Link subscription to userId
      console.log('🔗 Linking subscription to userId...');
      const token = await newUser.getIdToken();
      const response = await fetch('/api/subscription/link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Link response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ Failed to link subscription:', data);
        throw new Error(data.error || 'Failed to link subscription');
      }

      const linkData = await response.json();
      console.log('✅ Subscription linked successfully:', linkData);

      setAccountCreated(true);
      setFormLoading(false);
    } catch (err: any) {
      console.error('❌ Account creation error:', err);
      setFormLoading(false);

      // User-friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        setFormError('An account with this email already exists. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setFormError('Password should be at least 6 characters');
      } else if (err.code === 'auth/invalid-email') {
        setFormError('Please enter a valid email address');
      } else {
        setFormError(err.message || 'An error occurred. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50">
          <Header />
        </div>
        <main className="section-container py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Processing your subscription...</h2>
            <p className="text-gray-600">Please wait a moment while we set up your account.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50">
          <Header />
        </div>
        <main className="section-container py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/account/guides"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Browse Guides
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show account creation form if user is not logged in and hasn't created account
  const showAccountCreation = !user && !accountCreated;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      <main className="section-container py-20">
        <div className="max-w-3xl mx-auto">
          {/* Success icon and header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to HealthEGuides!</h1>
            <p className="text-xl text-gray-600">Your subscription is now active</p>
          </div>

          {/* Trial banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white mb-8">
            <h2 className="text-2xl font-semibold mb-2">🎉 Your 7-Day Free Trial Has Started</h2>
            <p className="text-indigo-100">
              You won't be charged for 7 days. Explore all our guides risk-free and cancel anytime before your trial ends.
            </p>
          </div>

          {/* Account creation form */}
          {showAccountCreation && (
            <div className="bg-white rounded-lg shadow-sm border-2 border-indigo-400 p-8 mb-8">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <p className="text-indigo-800 font-medium text-center">
                  ⚠️ Important: Create your account now to access your subscription
                </p>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Create Your Account</h3>
                <p className="text-gray-600">
                  Set up your account to access all your guides and manage your subscription.
                </p>
              </div>

              <form onSubmit={handleAccountCreation} className="space-y-4">
                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your name"
                    disabled={formLoading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                    disabled={formLoading}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Use the same email you used for your subscription
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={formLoading}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={formLoading}
                  />
                </div>

                {/* Error message */}
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{formError}</p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Creating Account...' : 'Create Account & Continue'}
                </button>
              </form>
            </div>
          )}

          {/* Success message after account creation */}
          {accountCreated && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Account Created Successfully!</h3>
                  <p className="text-green-800">
                    Your subscription is now linked to your account. You're all set to start exploring!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What's included */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">What You Get:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Unlimited Access to All Guides</h4>
                  <p className="text-gray-600">Read any guide, anytime, on any device</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">New Guides Added Regularly</h4>
                  <p className="text-gray-600">Get instant access to new content as it's released</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Evidence-Based Content</h4>
                  <p className="text-gray-600">Educational guides informed by current health research</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Cancel Anytime</h4>
                  <p className="text-gray-600">No contracts, no commitments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-indigo-900 mb-3">📧 Check Your Email</h3>
            <p className="text-indigo-800">
              We've sent you a confirmation email with details about your subscription and tips for getting started.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {accountCreated ? (
              <>
                <Link
                  href="/account/guides"
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center shadow-lg hover:shadow-xl"
                >
                  View My Guides →
                </Link>

                <Link
                  href="/account/subscription"
                  className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors text-center"
                >
                  Manage Subscription
                </Link>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 font-medium">
                  ⚠️ Please create your account above to access your guides
                </p>
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>
              Need help? Email us at{' '}
              <a href="mailto:support@healtheguides.com" className="text-indigo-600 hover:text-indigo-700">
                support@healtheguides.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
