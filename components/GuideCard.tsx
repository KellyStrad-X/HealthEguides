'use client';

import { Guide } from '@/lib/guides';

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  const handleClick = () => {
    // Track click event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click_guide_card', {
        guide_name: guide.title,
        guide_slug: guide.slug,
      });
    }

    // Navigate to guide page
    window.location.href = `/${guide.slug}`;
  };

  return (
    <div
      className="glass-card overflow-hidden hover-lift hover:scale-[1.02] cursor-pointer group"
      onClick={handleClick}
    >
      {/* Gradient header with emoji */}
      <div
        className="h-32 flex items-center justify-center relative overflow-hidden"
        style={{ background: guide.gradient }}
      >
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {guide.emoji}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
          {guide.title}
        </h3>

        <p className="text-white/70 mb-6 leading-relaxed line-clamp-3">
          {guide.description}
        </p>

        {/* Features list */}
        <ul className="space-y-2 mb-6">
          {guide.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-white/80">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Footer with price and CTA */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold gradient-text">
              ${guide.price.toFixed(2)}
            </span>
          </div>

          <button className="w-full btn-primary text-center">
            Get Your Guide →
          </button>
        </div>
      </div>
    </div>
  );
}
