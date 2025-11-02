'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Guide } from '@/lib/guides';
import GuideCard from './GuideCard';

export default function GuidesGrid() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/guides')
      .then(res => res.json())
      .then(data => {
        setGuides(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch guides:', err);
        setLoading(false);
      });
  }, []);

  return (
    <section id="catalog" className="py-20 bg-[#0a0a0a]">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Browse Our Guides
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Evidence-based solutions for your health journey
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mb-4"></div>
            <p className="text-white/60">Loading guides...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.slice(0, 6).map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-full bg-gradient-purple hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View Full Catalog
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
