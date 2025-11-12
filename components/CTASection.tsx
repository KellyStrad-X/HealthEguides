'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function CTASection() {
  const { user } = useAuth();

  // Hide this section for logged-in users
  if (user) {
    return null;
  }
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
    <section className="py-12 sm:py-20 bg-gradient-warm animated-gradient">
      <div className="section-container text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
          Start Your Wellness Journey Today
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 sm:mb-6 max-w-2xl mx-auto">
          Get unlimited access to our complete library of wellness & lifestyle guides
        </p>

        {/* Sunday Release Banner */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-6 sm:mb-10 shadow-lg">
          <span className="text-xl sm:text-2xl">🗓️</span>
          <span className="font-bold text-white text-sm sm:text-base md:text-lg">Plus: New guide released every Sunday!</span>
          <span className="text-xl sm:text-2xl">📚</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <button
            onClick={scrollToSubscription}
            className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold rounded-full bg-yellow-300 text-purple-900 hover:bg-yellow-200 transition-all duration-300 hover:scale-105 shadow-2xl"
          >
            🎉 Start Free Trial
          </button>
          <button
            onClick={scrollToCatalog}
            className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold rounded-full bg-white text-primary hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl"
          >
            Browse Guides
          </button>
        </div>
      </div>
    </section>
  );
}
