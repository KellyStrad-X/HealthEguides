'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Guide } from '@/lib/guides';

interface GuideCardProps {
  guide: Guide;
  showFavorite?: boolean;
}

export default function GuideCard({ guide, showFavorite = true }: GuideCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Defensive guards for missing data
  const safeFeatures = Array.isArray(guide.features) ? guide.features : [];

  if (!Array.isArray(guide.features)) {
    // Error log removed - TODO: Add proper error handling
  }

  // Check if guide is favorited
  useEffect(() => {
    if (!user?.uid) return;

    const checkFavorite = async () => {
      try {
        const response = await fetch(`/api/favorites/check?guideId=${guide.id}`, {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorited);
        }
      } catch (err) {
    // Error log removed - TODO: Add proper error handling
      }
    };

    checkFavorite();
  }, [user, guide.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!user) {
      // Redirect to login or show modal
      return;
    }

    setIsTogglingFavorite(true);

    try {
      const token = await user.getIdToken();
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ guideId: guide.id }),
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (err) {
    // Error log removed - TODO: Add proper error handling
    } finally {
      setIsTogglingFavorite(false);
    }
  };

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

      {/* Favorite Heart Button */}
      {showFavorite && user && !guide.comingSoon && (
        <button
          onClick={handleFavoriteClick}
          disabled={isTogglingFavorite}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-200 group/heart"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className="w-5 h-5 transition-all duration-200"
            fill={isFavorited ? '#ef4444' : 'none'}
            stroke={isFavorited ? '#ef4444' : 'white'}
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
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

        {/* Footer with CTA */}
        <div className="pt-4 border-t border-white/10">
          <button
            className={`w-full text-center ${
              guide.comingSoon
                ? 'bg-gray-600 text-white/50 cursor-default'
                : 'btn-primary'
            }`}
            disabled={guide.comingSoon}
          >
            {guide.comingSoon ? 'Coming Soon' : 'View Guide'}
          </button>
        </div>
      </div>
    </div>
  );
}
