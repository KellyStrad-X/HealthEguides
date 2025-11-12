'use client';

import { useRouter } from 'next/navigation';
import { Guide } from '@/lib/guides';

interface GuideOverviewProps {
  guide: Guide;
}

export default function GuideOverview({ guide }: GuideOverviewProps) {
  const router = useRouter();
  const safeFeatures = Array.isArray(guide.features) ? guide.features : [];

  const handleStartReading = () => {
    // Navigate to the guide content page
    router.push(`/guides/${guide.slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] py-12 sm:py-20">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">{guide.emoji}</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              {guide.title}
            </h1>
            <p className="text-base sm:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed">
              {guide.description}
            </p>

            {/* Start Reading CTA */}
            <button
              onClick={handleStartReading}
              className="inline-flex items-center gap-2 sm:gap-3 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base sm:text-lg font-semibold rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Start Reading
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* What's Inside Section */}
          <div className="glass-card p-6 sm:p-8 md:p-10 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
              What's Inside This Guide
            </h2>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {safeFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-xl sm:text-2xl flex-shrink-0">📖</span>
                  <div>
                    <p className="text-base sm:text-lg text-white/90">{feature}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">📋</div>
                <p className="text-xs sm:text-sm text-white/70">Actionable checklists</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">📊</div>
                <p className="text-xs sm:text-sm text-white/70">Tracking templates</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">💡</div>
                <p className="text-xs sm:text-sm text-white/70">Expert insights</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <button
              onClick={handleStartReading}
              className="inline-flex items-center gap-2 sm:gap-3 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base sm:text-lg font-semibold rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Start Reading Now
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
