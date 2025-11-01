'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Force dynamic rendering since this page uses search params
export const dynamic = 'force-dynamic';

function PurchaseSuccessContent() {
  const searchParams = useSearchParams();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchaseDetails() {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/get-access-from-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (data.purchases) {
          setPurchases(data.purchases);
        } else {
          setError('Unable to retrieve purchase details');
        }
      } catch (err) {
        console.error('Error fetching purchase:', err);
        setError('Unable to retrieve purchase details');
      }

      setLoading(false);
    }

    fetchPurchaseDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4ECDC4] mb-4"></div>
          <p className="text-lg text-gray-600">Processing your purchase...</p>
        </div>
      </div>
    );
  }

  if (error || purchases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-white p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Issue</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Unable to find your purchase. Please check your email for access links.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#556FB5] text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Purchase Complete!
          </h1>
          <p className="text-xl text-gray-600">
            Your {purchases.length > 1 ? 'guides are' : 'guide is'} ready to read
          </p>
        </div>

        {/* Access Cards */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {purchases.length > 1 ? 'Your Guides' : 'Your Guide'}
          </h2>

          <div className="space-y-4">
            {purchases.map((purchase: any) => (
              <div
                key={purchase.guideId}
                className="p-6 bg-gradient-to-r from-[#4ECDC4]/10 to-[#556FB5]/10 rounded-lg border-2 border-[#4ECDC4]/20 hover:border-[#4ECDC4] transition"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {purchase.guideName}
                </h3>
                <Link
                  href={`/guides/${purchase.guideId}?access=${purchase.accessToken}`}
                  className="inline-block px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#556FB5] text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Start Reading →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Email Confirmation Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
            <span className="text-2xl mr-2">📧</span>
            Check Your Email
          </h3>
          <p className="text-blue-800">
            We've sent you an email with {purchases.length > 1 ? 'all your access links' : 'your access link'}.
            Save it for future reference – {purchases.length > 1 ? 'they' : 'it'} never expire!
          </p>
        </div>

        {/* Mobile Tips */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center">
            <span className="text-2xl mr-2">📱</span>
            Reading on Mobile?
          </h3>
          <div className="text-purple-800 space-y-2">
            <p><strong>iPhone/iPad:</strong> Tap the share button → "Add to Home Screen" for app-like access</p>
            <p><strong>Android:</strong> Tap the menu → "Install app" for app-like access</p>
            <p className="text-sm text-purple-700">Works offline after the first load!</p>
          </div>
        </div>

        {/* Support */}
        <div className="text-center text-gray-600">
          <p className="mb-2">Need help?</p>
          <a
            href="mailto:support@healtheguides.com"
            className="text-[#4ECDC4] hover:underline font-semibold"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4ECDC4] mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PurchaseSuccessContent />
    </Suspense>
  );
}
