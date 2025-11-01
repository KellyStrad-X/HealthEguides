'use client';

export default function CTASection() {
  const scrollToCatalog = () => {
    const catalogSection = document.getElementById('catalog');
    catalogSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBundle = () => {
    const bundleSection = document.getElementById('bundle-offer');
    bundleSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-gradient-warm animated-gradient">
      <div className="section-container text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Start Your Health Journey Today
        </h2>

        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Choose from our library of evidence-based guides
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={scrollToBundle}
            className="inline-flex items-center gap-2 px-10 py-5 text-lg font-semibold rounded-full bg-yellow-300 text-purple-900 hover:bg-yellow-200 transition-all duration-300 hover:scale-105 shadow-2xl"
          >
            🔥 Get 3 for $10
          </button>
          <button
            onClick={scrollToCatalog}
            className="inline-flex items-center gap-2 px-10 py-5 text-lg font-semibold rounded-full bg-white text-primary hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl"
          >
            Browse Guides
          </button>
        </div>
      </div>
    </section>
  );
}
