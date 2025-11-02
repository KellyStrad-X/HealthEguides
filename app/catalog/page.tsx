'use client';

import { useState } from 'react';
import { HeaderProvider } from '@/lib/headerContext';
import { guides, getAllCategories } from '@/lib/guides';
import GuideCard from '@/components/GuideCard';
import SaleHeader from '@/components/SaleHeader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = getAllCategories();

  const filteredGuides = selectedCategory === 'All'
    ? guides
    : guides.filter(guide => guide.category === selectedCategory);

  return (
    <HeaderProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        <SaleHeader />
        <Header />
      <div className="pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">
            Complete Catalog
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Browse all our evidence-based health guides
          </p>
        </div>

        {/* Filter Bubbles */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 scale-105'
                : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10'
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
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 scale-105'
                  : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-white/60">
            Showing {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'}
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>

        {/* Empty State */}
        {filteredGuides.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-white/50">
              No guides found in this category.
            </p>
          </div>
        )}

        {/* More Coming Soon */}
        <div className="text-center mt-16 mb-8">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-8 py-4">
            <span className="text-3xl">✨</span>
            <p className="text-xl font-semibold text-white/80">
              More Coming Soon!
            </p>
            <span className="text-3xl">✨</span>
          </div>
        </div>
      </div>
      </div>
      <Footer />
      </div>
    </HeaderProvider>
  );
}
