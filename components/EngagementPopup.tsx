'use client';

import { useState, useEffect, useCallback } from 'react';
import { track } from '@vercel/analytics';

interface EngagementPopupProps {
  onOpenSubscriptionModal: () => void;
  onOpenGuideRequestForm: () => void;
  isUserLoggedIn: boolean;
  /**
   * Minimum time in seconds before popup can show (default: 15)
   */
  dwellTimeThreshold?: number;
  /**
   * Minimum scroll depth percentage (0-100) before popup can show (default: 20)
   */
  scrollDepthThreshold?: number;
  /**
   * Maximum number of times to show popup per session (default: 1)
   */
  maxShowsPerSession?: number;
  /**
   * Enable exit-intent detection (default: true)
   */
  enableExitIntent?: boolean;
  /**
   * Page source for analytics tracking
   */
  source?: string;
}

export default function EngagementPopup({
  onOpenSubscriptionModal,
  onOpenGuideRequestForm,
  isUserLoggedIn,
  dwellTimeThreshold = 15,
  scrollDepthThreshold = 20,
  maxShowsPerSession = 1,
  enableExitIntent = true,
  source = 'unknown',
}: EngagementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [dwellTimeMet, setDwellTimeMet] = useState(false);
  const [scrollDepthMet, setScrollDepthMet] = useState(false);
  const [currentScrollDepth, setCurrentScrollDepth] = useState(0);
  const [timeOnPage, setTimeOnPage] = useState(0);

  // Session storage key for tracking shows
  const SESSION_KEY = 'engagement_popup_shows';

  // Don't show popup if user is logged in
  useEffect(() => {
    if (isUserLoggedIn) {
      setIsVisible(false);
    }
  }, [isUserLoggedIn]);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeOnPage(elapsed);

      // Check if dwell time threshold is met
      if (elapsed >= dwellTimeThreshold) {
        setDwellTimeMet(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dwellTimeThreshold]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Calculate scroll depth percentage
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = scrollableHeight > 0
        ? Math.round((scrollTop / scrollableHeight) * 100)
        : 0;

      setCurrentScrollDepth(scrollPercentage);

      // Check if scroll depth threshold is met
      if (scrollPercentage >= scrollDepthThreshold) {
        setScrollDepthMet(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDepthThreshold]);

  // Exit-intent detection
  useEffect(() => {
    if (!enableExitIntent) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse is leaving viewport from top (common exit pattern)
      if (e.clientY <= 10 && !isVisible && !isDismissed) {
        // Only trigger if conditions are met
        if ((dwellTimeMet && scrollDepthMet) || timeOnPage >= dwellTimeThreshold * 1.5) {
          showPopup('exit_intent');
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [enableExitIntent, isVisible, isDismissed, dwellTimeMet, scrollDepthMet, timeOnPage, dwellTimeThreshold]);

  // Check if popup should be shown based on dwell time + scroll depth
  useEffect(() => {
    if (isUserLoggedIn || isVisible || isDismissed) return;

    // Show popup when both dwell time AND scroll depth thresholds are met
    if (dwellTimeMet && scrollDepthMet) {
      showPopup('dwell_time');
    }
  }, [dwellTimeMet, scrollDepthMet, isUserLoggedIn, isVisible, isDismissed]);

  const showPopup = (triggerType: 'dwell_time' | 'exit_intent') => {
    // Check session storage for number of shows
    const showsCount = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10);

    if (showsCount >= maxShowsPerSession) {
      return; // Don't show if limit reached
    }

    // Increment show count
    sessionStorage.setItem(SESSION_KEY, String(showsCount + 1));

    setIsVisible(true);

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Track popup shown event
    track('engagement_popup_shown', {
      trigger_type: triggerType,
      time_on_page: timeOnPage,
      scroll_depth: currentScrollDepth,
      source,
      shows_count: showsCount + 1,
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    document.body.style.overflow = '';

    // Track dismissal
    track('engagement_popup_dismissed', {
      time_on_page: timeOnPage,
      scroll_depth: currentScrollDepth,
      source,
    });
  };

  const handleStartTrial = () => {
    // Track click
    track('engagement_popup_clicked', {
      action: 'start_trial',
      time_on_page: timeOnPage,
      scroll_depth: currentScrollDepth,
      source,
    });

    setIsVisible(false);
    document.body.style.overflow = '';
    onOpenSubscriptionModal();
  };

  const handleRequestGuide = () => {
    // Track click
    track('engagement_popup_clicked', {
      action: 'request_guide',
      time_on_page: timeOnPage,
      scroll_depth: currentScrollDepth,
      source,
    });

    setIsVisible(false);
    document.body.style.overflow = '';
    onOpenGuideRequestForm();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-900 bg-white/60 hover:bg-white/80 rounded-full p-2 transition-all shadow-sm"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 md:px-8 pb-8 pt-2">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-4">
              <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Don't See What You're Looking For?
            </h2>
            <p className="text-gray-700 text-lg">
              We're adding new guides every week
            </p>
          </div>

          {/* Content */}
          <div className="mb-6 bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-5">
            {/* Personal Message */}
            <p className="text-gray-800 leading-relaxed mb-4 text-center italic text-base">
              We're building this library <span className="font-semibold text-purple-700">for you</span>. Your voice matters, and we're committed to creating guides that truly support your health & lifestyle journey. Let us know what you need—we're listening.
            </p>

            {/* Bullet Points */}
            <ul className="space-y-2.5 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>New guides released every Friday</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Request any topic—we prioritize member suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>7-day free trial with full access</span>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={handleRequestGuide}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Request a Guide
            </button>

            <button
              onClick={handleStartTrial}
              className="w-full py-4 bg-white/80 hover:bg-white border-2 border-purple-300 hover:border-purple-400 text-purple-700 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
            >
              Start Free Trial
            </button>
          </div>

          {/* Catalog Preview */}
          <div className="mt-6">
            <p className="text-center text-sm font-medium text-gray-800 mb-3">
              Get instant access to all of our guides in our catalog
            </p>
            <div className="rounded-xl overflow-hidden border-2 border-purple-200 shadow-md">
              <img
                src="/catalog-preview.png"
                alt="Catalog preview showing available health and lifestyle guides"
                className="w-full h-auto"
              />
            </div>
          </div>

          <p className="text-xs text-gray-600 text-center mt-4">
            Don't miss out—new guides every Friday
          </p>
        </div>
      </div>
    </div>
  );
}
