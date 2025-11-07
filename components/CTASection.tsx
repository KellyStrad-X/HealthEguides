'use client';

export default function CTASection() {
  const scrollToCatalog = () => {
    const catalogSection = document.getElementById('catalog');
    if (catalogSection) {
      const headerOffset = 120; // Account for sticky header height
      const elementPosition = catalogSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToSubscription = () => {
    const subscriptionSection = document.getElementById('subscription');
    if (subscriptionSection) {
      const headerOffset = 120; // Account for sticky header height
      const elementPosition = subscriptionSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-warm animated-gradient">
      <div className="section-container text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Start Your Health Journey Today
        </h2>

        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Get unlimited access to our complete library of evidence-based guides
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={scrollToSubscription}
            className="inline-flex items-center gap-2 px-10 py-5 text-lg font-semibold rounded-full bg-yellow-300 text-purple-900 hover:bg-yellow-200 transition-all duration-300 hover:scale-105 shadow-2xl"
          >
            🎉 Start Free Trial
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
