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
      className="relative min-h-[70vh] flex items-center justify-center animated-gradient shimmer-effect overflow-hidden"
      style={{ background: guide.gradient }}
    >
      {/* Decorative emoji */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="text-[200px] absolute top-10 left-10">{guide.emoji}</div>
        <div className="text-[200px] absolute bottom-10 right-10">{guide.emoji}</div>
      </div>

      <div className="section-container text-center z-10 py-20">
        <div className="text-7xl mb-6">{guide.emoji}</div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          {guide.title}
        </h1>

        <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          {guide.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <div className="flex items-center gap-2 glass-card px-6 py-3 rounded-full">
            <span className="text-2xl">🎉</span>
            <span className="font-semibold">7 Days Free</span>
          </div>
          <div className="flex items-center gap-2 glass-card px-6 py-3 rounded-full">
            <span className="text-2xl">⚡</span>
            <span className="font-semibold">Instant Access</span>
          </div>
          <div className="flex items-center gap-2 glass-card px-6 py-3 rounded-full">
            <span className="text-2xl">📚</span>
            <span className="font-semibold">All Guides Included</span>
          </div>
        </div>

        <button
          onClick={scrollToCTA}
          className="btn-primary text-xl px-12 py-5 shadow-2xl"
        >
          Start Free Trial!
        </button>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
    </section>
  );
}
