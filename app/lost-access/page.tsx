'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LostAccess() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/resend-access-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.error || 'Failed to send access email');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Lost Your Access Link?
            </h1>
            <p className="text-gray-600">
              Enter your email and we'll resend your guide access links
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Email Sent!</h3>
                  <p className="text-green-800 text-sm">
                    Check your inbox for your access links. Don't forget to check spam/junk folders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">❌</span>
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#4ECDC4] focus:outline-none transition mb-4"
            />

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#556FB5] text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Resend Access Links'}
            </button>
          </form>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center text-sm">
              <span className="text-xl mr-2">ℹ️</span>
              What to expect
            </h3>
            <ul className="text-blue-800 text-sm space-y-1 ml-7">
              <li>• Email arrives within 1-2 minutes</li>
              <li>• Check your spam/junk folder</li>
              <li>• Can only request once per hour</li>
            </ul>
          </div>

          {/* Support Link */}
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">Still can't find it?</p>
            <a
              href="mailto:support@healtheguides.com"
              className="text-[#4ECDC4] hover:underline font-semibold"
            >
              Contact Support →
            </a>
          </div>

          {/* Back to Home */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-[#4ECDC4] transition text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
