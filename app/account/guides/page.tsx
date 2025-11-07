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
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter guides
  const filteredGuides = guides.filter(guide => {
    // Apply read/unread filter
    if (filter === 'read' && !guideProgress.get(guide.id)?.isRead) return false;
    if (filter === 'unread' && guideProgress.get(guide.id)?.isRead) return false;

    // Apply search filter
    if (searchQuery && !guide.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Calculate stats
  const totalGuides = guides.length;
  const readGuides = Array.from(guideProgress.values()).filter(p => p.isRead).length;
  const recentlyViewed = Array.from(guideProgress.values())
    .sort((a, b) => b.lastViewed.getTime() - a.lastViewed.getTime())
    .slice(0, 3)
    .map(p => guides.find(g => g.id === p.guideId))
    .filter(Boolean) as Guide[];

  const handleGuideClick = (guide: Guide) => {
    router.push(`/guides/${guide.slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">My Guides</h1>
          <p className="text-lg text-gray-600">
            Your complete library of health guides
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{totalGuides}</div>
                <div className="text-sm text-gray-600">Total Guides</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{readGuides}</div>
                <div className="text-sm text-gray-600">Guides Read</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📖
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{totalGuides - readGuides}</div>
                <div className="text-sm text-gray-600">To Read</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentlyViewed.map(guide => (
                <div
                  key={guide.id}
                  onClick={() => handleGuideClick(guide)}
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="text-3xl flex-shrink-0">{guide.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{guide.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    filter === f
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Guides Grid */}
        {filteredGuides.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600">
              {searchQuery ? 'No guides match your search' : 'No guides found in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => {
              const progress = guideProgress.get(guide.id);
              const isRead = progress?.isRead || false;

              return (
                <div
                  key={guide.id}
                  onClick={() => handleGuideClick(guide)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] cursor-pointer transition-all group"
                >
                  {/* Read Badge */}
                  {isRead && (
                    <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                      <span>✓</span>
                      <span>Read</span>
                    </div>
                  )}

                  {/* Gradient header with emoji */}
                  <div
                    className="h-32 flex items-center justify-center relative overflow-hidden"
                    style={{ background: guide.gradient }}
                  >
                    <div className="text-6xl transition-transform duration-300 group-hover:scale-110">
                      {guide.emoji}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {guide.description}
                    </p>

                    <button className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm">
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
