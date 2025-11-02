'use client';

import { useRouter } from 'next/navigation';
import { Guide } from '@/lib/guides';

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  const router = useRouter();

  // Defensive guards for missing data
  const safeFeatures = Array.isArray(guide.features) ? guide.features : [];
  const safePrice = typeof guide.price === 'number' && !isNaN(guide.price) ? guide.price : 0;

  const handleClick = () => {
    // Don't navigate if coming soon
    if (guide.comingSoon) return;

    // Track click event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click_guide_card', {
        guide_name: guide.title,
        guide_slug: guide.slug,
      });
    }

    // Navigate to guide page using Next.js router for client-side navigation
    router.push(`/${guide.slug}`);
  };

  return (
    <div
      className={`glass-card overflow-hidden relative ${
        guide.comingSoon
          ? 'opacity-60 cursor-default'
          : 'hover-lift hover:scale-[1.02] cursor-pointer'
      } group`}
      onClick={handleClick}
    >
      {/* Coming Soon Badge */}
      {guide.comingSoon && (
        <div className="absolute top-4 right-4 z-10 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
          Coming Soon
        </div>
      )}

      {/* Gradient header with emoji */}
      <div
        className="h-32 flex items-center justify-center relative overflow-hidden"
        style={{ background: guide.gradient }}
      >
        <div className={`text-6xl transition-transform duration-300 ${!guide.comingSoon ? 'group-hover:scale-110' : ''}`}>
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
          {safeFeatures.map((feature, index) => (
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
              ${safePrice.toFixed(2)}
            </span>
          </div>

          <button
            className={`w-full text-center ${
              guide.comingSoon
                ? 'bg-gray-600 text-white/50 cursor-default'
                : 'btn-primary'
            }`}
            disabled={guide.comingSoon}
          >
            {guide.comingSoon ? 'Coming Soon' : 'Get Your Guide →'}
          </button>
        </div>
      </div>
    </div>
  );
}
