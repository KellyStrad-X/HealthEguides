'use client';

export default function Hero() {
  const scrollToCatalog = () => {
    const catalogSection = document.getElementById('catalog');
    catalogSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-hero animated-gradient shimmer-effect overflow-hidden">
      {/* Decorative floating emojis */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute top-20 left-[10%] text-4xl opacity-20 animate-pulse">✨</span>
        <span className="absolute top-32 right-[15%] text-4xl opacity-20 animate-pulse delay-100">💕</span>
        <span className="absolute bottom-32 left-[20%] text-4xl opacity-20 animate-pulse delay-200">🌸</span>
        <span className="absolute bottom-20 right-[10%] text-4xl opacity-20 animate-pulse delay-300">💫</span>
      </div>

      <div className="section-container text-center z-10 py-20">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Your Complete Library of
          <br />
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Women&apos;s Health Guides
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          Evidence-based digital guides for every stage of your journey
        </p>

        <button
          onClick={scrollToCatalog}
          className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
        >
          Browse Guides
          <span className="animate-bounce">↓</span>
        </button>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
    </section>
  );
}
