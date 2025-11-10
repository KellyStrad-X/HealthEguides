'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Stats() {
  const { user } = useAuth();

  // Don't show trial messaging for logged-in users
  if (user) {
    return null;
  }

  const benefits = [
    {
      title: "7-Day Free Trial",
      description: "Try all our guides risk-free",
      emoji: "💰"
    },
    {
      title: "Instant Access",
      description: "Download immediately after purchase",
      emoji: "⚡"
    },
    {
      title: "Evidence-Based",
      description: "Backed by research and expert insights",
      emoji: "📚"
    }
  ];

  return (
    <section className="py-16 bg-[#0a0a0a]">
      <div className="section-container">
        <div className="glass-card p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-4">{benefit.emoji}</div>
                <div className="text-xl sm:text-2xl font-bold mb-2">
                  {benefit.title}
                </div>
                <div className="text-sm sm:text-base text-white/70">
                  {benefit.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
