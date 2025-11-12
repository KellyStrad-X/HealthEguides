'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Stats() {
  const { user } = useAuth();

  // Don't show messaging for logged-in users
  if (user) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-[#0a0a0a]">
      <div className="section-container">
        <div className="glass-card p-8 sm:p-12">
          <div className="text-center max-w-3xl mx-auto">
            {/* Decorative element */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>

            {/* Sentiment message */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed italic mb-6">
              We're building this library <span className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">for you</span>. Your voice matters, and we're committed to creating guides that truly support your health & lifestyle journey. Let us know what you need—we're listening.
            </p>

            {/* Subtle call to action */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base text-white/70">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>New guides every Sunday</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Evidence-based content</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Request any topic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
