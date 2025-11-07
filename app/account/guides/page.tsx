'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Guide } from '@/lib/guides';
import { db } from '@/lib/firebase-admin-init';

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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mb-4"></div>
          <p className="text-white/60">Loading your guides...</p>
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
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">My Guides</h1>
          <p className="text-xl text-white/70">
            Access your complete library of health guides
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold">{totalGuides}</div>
            <div className="text-white/60 text-sm">Total Guides</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold">{readGuides}</div>
            <div className="text-white/60 text-sm">Guides Read</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-3xl mb-2">📖</div>
            <div className="text-2xl font-bold">{totalGuides - readGuides}</div>
            <div className="text-white/60 text-sm">To Read</div>
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {recentlyViewed.map(guide => (
                <div
                  key={guide.id}
                  onClick={() => handleGuideClick(guide)}
                  className="flex-shrink-0 w-48 glass-card p-4 cursor-pointer hover-lift hover:scale-105"
                >
                  <div className="text-4xl mb-2">{guide.emoji}</div>
                  <h3 className="font-semibold text-sm line-clamp-2">{guide.title}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50"
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
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    filter === f
                      ? 'bg-gradient-purple text-white shadow-lg'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
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
          <div className="text-center py-12 glass-card">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-white/70">
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
                  className="glass-card overflow-hidden relative hover-lift hover:scale-[1.02] cursor-pointer group"
                >
                  {/* Read Badge */}
                  {isRead && (
                    <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
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
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {guide.description}
                    </p>

                    <button className="w-full btn-primary text-sm py-2">
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
