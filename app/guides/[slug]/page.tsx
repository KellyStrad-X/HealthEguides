'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { guides } from '@/lib/guides';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Force dynamic rendering since this page uses search params
export const dynamic = 'force-dynamic';

interface GuideViewerProps {
  params: {
    slug: string;
  };
}

function GuideViewerContent({ params }: GuideViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideHtml, setGuideHtml] = useState<string>('');
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [guide, setGuide] = useState<any>(null);
  const [guideLoaded, setGuideLoaded] = useState(false);

  // Fetch guide data (supports both hardcoded and Firebase guides)
  useEffect(() => {
    async function fetchGuide() {
      setGuideLoaded(false);

      // Fetch from API to get both hardcoded and Firebase guides
      try {
        const response = await fetch('/api/guides', {
          cache: 'no-store' // Always get fresh data
        });
        const allGuides = await response.json();
        const foundGuide = allGuides.find((g: any) => g.slug === params.slug);
        setGuide(foundGuide || null);
      } catch (err) {
    // Error handling: TODO - Add proper error logging
        // Fallback to hardcoded guides if API fails
        const hardcodedGuide = guides.find(g => g.slug === params.slug);
        setGuide(hardcodedGuide || null);
      } finally {
        setGuideLoaded(true);
      }
    }

    fetchGuide();
  }, [params.slug]);

  useEffect(() => {
    async function validateAccess() {
      // Wait for guide and auth to be loaded before checking
      if (!guideLoaded || authLoading) {
        return;
      }

      if (!guide) {
        setError('Guide not found');
        setLoading(false);
        return;
      }

      // Check if user has admin session (bypass subscription check)
      try {
        const adminCheck = await fetch('/api/admin/auth', {
          method: 'GET',
          credentials: 'include',
        });

        if (adminCheck.ok) {
          const adminData = await adminCheck.json();
          if (adminData.authenticated) {
            // Admin access - bypass subscription check
            setAccessGranted(true);
            await loadGuideContentForSubscriber();
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        // Not admin, continue with normal validation
      }

      // Check if user is logged in
      if (!user) {
        // No user logged in - redirect to home page to sign up for subscription
        router.push('/');
        return;
      }

      // Check if user has active subscription
      try {
        const res = await fetch('/api/validate-subscription-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            email: user.email,
            guideId: guide.id,
          }),
        });

        const data = await res.json();

        if (data.hasAccess) {
    // Debug log removed
          setAccessGranted(true);
          await loadGuideContentForSubscriber();
          setLoading(false);
          return;
        } else {
          // User is logged in but doesn't have active subscription
          setError('Active subscription required to access this guide.');
          setLoading(false);
          return;
        }
      } catch (err) {
    // Error log removed - TODO: Add proper error handling
        setError('Unable to validate subscription. Please try again.');
        setLoading(false);
        return;
      }
    }

    validateAccess();
  }, [params.slug, guide, guideLoaded, authLoading, user, router]);

  // Track guide view for subscribed users
  useEffect(() => {
    if (accessGranted && user && guide) {
      // Track that user viewed this guide
      fetch('/api/user/guide-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          guideId: guide.id,
          isRead: false, // Just mark as viewed, not necessarily fully read
        }),
      }).catch(err => console.error('Failed to track guide view:', err));
    }
  }, [accessGranted, user, guide]);

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        // Always show header at top of page
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide header
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  async function loadGuideContentForSubscriber() {
    try {
      // Fetch guide content for subscriber (no token needed)
      const response = await fetch('/api/get-guide-content-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({ guideId: guide?.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to load guide content');
      }

      const data = await response.json();

      if (data.placeholder || !data.html) {
        setGuideHtml(`
          <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <h1 style="color: #4ECDC4; margin-bottom: 20px;">${guide?.emoji} ${guide?.title}</h1>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #4ECDC4;">
              <h2 style="margin-top: 0;">Guide Content Coming Soon!</h2>
              <p>Your subscription gives you access to this guide. The full content will be available here shortly.</p>
              <p>This guide will include:</p>
              <ul>
                ${guide?.features.map((f: string) => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          </div>
        `);
      } else {
        setGuideHtml(data.html);
      }
    } catch (err) {
    // Error log removed - TODO: Add proper error handling
      setGuideHtml(`
        <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
          <h1>${guide?.emoji} ${guide?.title}</h1>
          <p>Error loading guide content. Please refresh the page or contact support.</p>
        </div>
      `);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4ECDC4] mb-4"></div>
          <p className="text-lg text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-white p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Subscription Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#556FB5] text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Start Your Free Trial
            </Link>

            <Link
              href="/account/subscription"
              className="block w-full px-6 py-3 border-2 border-[#4ECDC4] text-[#4ECDC4] rounded-lg font-semibold hover:bg-[#4ECDC4] hover:text-white transition"
            >
              Manage Subscription
            </Link>

            <a
              href="mailto:support@healtheguides.com"
              className="block text-gray-500 hover:text-[#4ECDC4] transition text-sm"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!accessGranted) {
    return null; // Will redirect to home page
  }

  // Display the guide content
  return (
    <div className="min-h-screen bg-white">
      {/* Collapsing header with logo/home link */}
      <header
        className={`sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50 transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Back to Home Button */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#4ECDC4] hover:bg-gray-50 rounded-lg transition-all font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>Home</span>
          </Link>

          {/* Center Logo */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-[#4ECDC4] hover:opacity-80 transition">
            Health eGuides
          </Link>

          {/* Spacer for layout balance */}
          <div className="w-24"></div>
        </div>
      </header>

      {/* Guide content - Admin-controlled trusted content */}
      <div
        className="guide-content"
        dangerouslySetInnerHTML={{ __html: guideHtml }}
      />

      {/* Catalog Preview Section */}
      <section className="bg-gradient-to-br from-[#f8f9fa] to-white py-16 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Explore More Health Guides
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Discover our full collection of evidence-based health guides
          </p>

          {/* Catalog Screenshot */}
          <div className="mb-8 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
            <Link href="/catalog">
              <img
                src="/catalog-preview.png"
                alt="Health eGuides Catalog"
                className="w-full h-auto hover:scale-105 transition-transform duration-300 cursor-pointer"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = 'block';
                }}
              />
            </Link>
            <div
              style={{ display: 'none' }}
              className="bg-white p-12 border-2 border-dashed border-gray-300 rounded-lg"
            >
              <p className="text-gray-500 text-sm">
                📚 View our complete catalog of health guides
              </p>
            </div>
          </div>

          <Link
            href="/catalog"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#4ECDC4] to-[#556FB5] text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            View Full Catalog
          </Link>
        </div>
      </section>

      {/* Simple footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
        <div className="max-width-4xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 HealthEGuides. All rights reserved.</p>
          <p className="mt-2">
            Need help? <a href="mailto:support@healtheguides.com" className="text-[#4ECDC4] hover:underline">Contact Support</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function GuideViewer({ params }: GuideViewerProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4ECDC4] mb-4"></div>
          <p className="text-lg text-gray-600">Loading guide...</p>
        </div>
      </div>
    }>
      <GuideViewerContent params={params} />
    </Suspense>
  );
}
