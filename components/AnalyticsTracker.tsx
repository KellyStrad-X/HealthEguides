'use client';

import { useEffect, useRef } from 'react';
import { track } from '@vercel/analytics';

interface AnalyticsTrackerProps {
  /**
   * Page identifier for analytics (e.g., 'homepage', 'catalog')
   */
  page: string;
}

export default function AnalyticsTracker({ page }: AnalyticsTrackerProps) {
  const scrollDepthTracked = useRef({
    25: false,
    50: false,
    75: false,
    100: false,
  });
  const timeTracked = useRef({
    5: false,
    15: false,
    30: false,
    60: false,
  });
  const sectionsTracked = useRef<Set<string>>(new Set());
  const startTime = useRef(Date.now());

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Calculate scroll percentage
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = scrollableHeight > 0
        ? Math.round((scrollTop / scrollableHeight) * 100)
        : 0;

      // Track milestones
      const milestones = [25, 50, 75, 100] as const;
      milestones.forEach((milestone) => {
        if (scrollPercentage >= milestone && !scrollDepthTracked.current[milestone]) {
          scrollDepthTracked.current[milestone] = true;
          track('scroll_depth', {
            page,
            depth: milestone,
            time_on_page: Math.round((Date.now() - startTime.current) / 1000),
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [page]);

  // Track time milestones
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    const milestones = [
      { seconds: 5, key: 5 as const },
      { seconds: 15, key: 15 as const },
      { seconds: 30, key: 30 as const },
      { seconds: 60, key: 60 as const },
    ];

    milestones.forEach(({ seconds, key }) => {
      const timeout = setTimeout(() => {
        if (!timeTracked.current[key]) {
          timeTracked.current[key] = true;

          // Get current scroll depth
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollableHeight = documentHeight - windowHeight;
          const scrollPercentage = scrollableHeight > 0
            ? Math.round((scrollTop / scrollableHeight) * 100)
            : 0;

          track('time_milestone', {
            page,
            seconds,
            scroll_depth: scrollPercentage,
          });
        }
      }, seconds * 1000);

      intervals.push(timeout);
    });

    return () => intervals.forEach(clearTimeout);
  }, [page]);

  // Track section visibility
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // 50% of section must be visible
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          const sectionId = entry.target.id;

          if (!sectionsTracked.current.has(sectionId)) {
            sectionsTracked.current.add(sectionId);

            track('section_viewed', {
              page,
              section: sectionId,
              time_on_page: Math.round((Date.now() - startTime.current) / 1000),
            });
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all elements with IDs (sections should have IDs)
    const sections = document.querySelectorAll('[id]');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [page]);

  // Track page exit (when component unmounts)
  useEffect(() => {
    return () => {
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);

      // Get final scroll depth
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = scrollableHeight > 0
        ? Math.round((scrollTop / scrollableHeight) * 100)
        : 0;

      track('page_exit', {
        page,
        time_on_page: timeOnPage,
        final_scroll_depth: scrollPercentage,
        sections_viewed: Array.from(sectionsTracked.current).join(','),
        sections_count: sectionsTracked.current.size,
      });
    };
  }, [page]);

  return null; // This component doesn't render anything
}
