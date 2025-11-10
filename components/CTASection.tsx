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
    <section className="py-20 bg-gradient-warm animated-gradient">
      <div className="section-container text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Start Your Health Journey Today
        </h2>

        <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
          Get unlimited access to our complete library of evidence-based guides
        </p>

        {/* Sunday Release Banner */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-full mb-10 shadow-lg">
          <span className="text-2xl">🗓️</span>
          <span className="font-bold text-white text-lg">Plus: New guide released every Sunday!</span>
          <span className="text-2xl">📚</span>
        </div>

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
