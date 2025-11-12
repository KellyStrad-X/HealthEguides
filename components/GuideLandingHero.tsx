'use client';

import { Guide } from '@/lib/guides';

interface GuideLandingHeroProps {
  guide: Guide;
}

export default function GuideLandingHero({ guide }: GuideLandingHeroProps) {
  const scrollToCTA = () => {
    const ctaSection = document.getElementById('get-guide');
    ctaSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative min-h-[50vh] sm:min-h-[70vh] flex items-center justify-center animated-gradient shimmer-effect overflow-hidden"
      style={{ background: guide.gradient }}
    >
      {/* Decorative emoji */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="text-[150px] sm:text-[200px] absolute top-10 left-10">{guide.emoji}</div>
        <div className="text-[150px] sm:text-[200px] absolute bottom-10 right-10">{guide.emoji}</div>
      </div>

      <div className="section-container text-center z-10 py-12 sm:py-20">
        <div className="text-5xl sm:text-7xl mb-4 sm:mb-6">{guide.emoji}</div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
          {guide.title}
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
          {guide.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
          <div className="flex items-center gap-2 glass-card px-4 py-2 sm:px-6 sm:py-3 rounded-full">
            <span className="text-xl sm:text-2xl">🎉</span>
            <span className="text-sm sm:text-base font-semibold">7 Days Free</span>
          </div>
          <div className="flex items-center gap-2 glass-card px-4 py-2 sm:px-6 sm:py-3 rounded-full">
            <span className="text-xl sm:text-2xl">⚡</span>
            <span className="text-sm sm:text-base font-semibold">Instant Access</span>
          </div>
          <div className="flex items-center gap-2 glass-card px-4 py-2 sm:px-6 sm:py-3 rounded-full">
            <span className="text-xl sm:text-2xl">📚</span>
            <span className="text-sm sm:text-base font-semibold">All Guides Included</span>
          </div>
        </div>

        <button
          onClick={scrollToCTA}
          className="btn-primary text-base sm:text-xl px-8 py-4 sm:px-12 sm:py-5 shadow-2xl"
        >
          Start Free Trial!
        </button>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
    </section>
  );
}
