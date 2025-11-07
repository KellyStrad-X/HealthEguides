'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GuidePreviewProps {
  guideId: string;
  guideTitle: string;
}

export default function GuidePreview({ guideId, guideTitle }: GuidePreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Assuming preview images are named: {guideId}-preview-1.png, {guideId}-preview-2.png, etc.
  const previewPages = [1, 2, 3];

  const handleImageError = (pageNum: number) => {
    setImageErrors(prev => new Set(prev).add(pageNum));
  };

  const validPages = previewPages.filter(page => !imageErrors.has(page));

  if (validPages.length === 0) {
    // No preview images available
    return null;
  }

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
        Preview - First 3 Pages
      </h3>
      <p className="text-gray-600 text-center mb-6">
        Get a sneak peek at what's inside this guide
      </p>

      <div className="relative">
        {/* Main preview image */}
        <div className="relative bg-white rounded-lg shadow-xl border-4 border-gray-200 overflow-hidden">
          <div className="aspect-[8.5/11] relative">
            <img
              src={`/guide-previews/${guideId}/page-${validPages[currentPage]}.png`}
              alt={`${guideTitle} - Page ${validPages[currentPage]} Preview`}
              className="w-full h-full object-contain"
              onError={() => handleImageError(validPages[currentPage])}
            />
          </div>

          {/* Page indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
            Page {validPages[currentPage]} of {previewPages.length}
          </div>
        </div>

        {/* Navigation arrows */}
        {validPages.length > 1 && (
          <>
            {currentPage > 0 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                aria-label="Previous page"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {currentPage < validPages.length - 1 && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                aria-label="Next page"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </>
        )}

        {/* Thumbnail navigation */}
        {validPages.length > 1 && (
          <div className="flex justify-center gap-4 mt-6">
            {validPages.map((pageNum, index) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(index)}
                className={`relative w-20 h-28 rounded border-2 transition-all ${
                  index === currentPage
                    ? 'border-indigo-600 ring-2 ring-indigo-300'
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                <img
                  src={`/guide-previews/${guideId}/page-${pageNum}.png`}
                  alt={`Page ${pageNum} thumbnail`}
                  className="w-full h-full object-cover rounded"
                />
                {index === currentPage && (
                  <div className="absolute inset-0 bg-indigo-600/20 rounded"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Blur overlay hint */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 italic">
          Subscribe to read the full guide and unlock all pages
        </p>
      </div>
    </div>
  );
}
