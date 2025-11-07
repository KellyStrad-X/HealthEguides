'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Guide } from '@/lib/guides';

interface GuideProgress {
  guideId: string;
  isRead: boolean;
  lastViewed: Date;
}

export default function MyGuidesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [guideProgress, setGuideProgress] = useState<Map<string, GuideProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetch guides
  useEffect(() => {
    fetch('/api/guides')
      .then(res => res.json())
      .then(data => {
        setGuides(data.filter((g: Guide) => !g.comingSoon));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch guides:', err);
        setLoading(false);
      });
  }, []);

  // Fetch user's guide progress
  useEffect(() => {
    if (!user?.uid) return;

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/user/guide-progress?userId=${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          const progressMap = new Map();
          data.forEach((p: any) => {
            progressMap.set(p.guideId, {
              guideId: p.guideId,
              isRead: p.isRead,
              lastViewed: new Date(p.lastViewed),
            });
          });
          setGuideProgress(progressMap);
        }
      } catch (err) {
        console.error('Failed to fetch guide progress:', err);
      }
    };

    fetchProgress();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading your guides...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get unique categories from guides
  const categories = Array.from(new Set(guides.map(guide => guide.category))).sort();

  // Filter guides by category
  const filteredGuides = selectedCategory === 'All'
    ? guides
    : guides.filter(guide => guide.category === selectedCategory);

  const handleGuideClick = (guide: Guide) => {
    router.push(`/guides/${guide.slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">My Guides</h1>
          <p className="text-lg text-gray-600">
            Your complete library of health guides
          </p>
        </div>

        {/* Category Filter Bubbles */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
            }`}
          >
            All Guides
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-gray-600">
            Showing {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'}
          </p>
        </div>

        {/* Guides Grid */}
        {filteredGuides.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600">
              No guides found in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {filteredGuides.map((guide) => {
              const progress = guideProgress.get(guide.id);
              const isRead = progress?.isRead || false;

              return (
                <div
                  key={guide.id}
                  onClick={() => handleGuideClick(guide)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] cursor-pointer transition-all group relative"
                >
                  {/* Read Badge */}
                  {isRead && (
                    <div className="absolute top-3 right-3 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                      <span>✓</span>
                      <span className="hidden sm:inline">Read</span>
                    </div>
                  )}

                  {/* Gradient header with emoji */}
                  <div
                    className="h-24 sm:h-32 flex items-center justify-center relative overflow-hidden"
                    style={{ background: guide.gradient }}
                  >
                    <div className="text-4xl sm:text-6xl transition-transform duration-300 group-hover:scale-110">
                      {guide.emoji}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-6">
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {guide.description}
                    </p>

                    <button className="w-full py-2 px-3 sm:px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-xs sm:text-sm">
                      {isRead ? 'Read Again' : 'Start Reading'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
