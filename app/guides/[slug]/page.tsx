'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { guides } from '@/lib/guides';
import Link from 'next/link';

interface GuideViewerProps {
  params: {
    slug: string;
  };
}

export default function GuideViewer({ params }: GuideViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideHtml, setGuideHtml] = useState<string>('');

  const guide = guides.find(g => g.slug === params.slug);

  useEffect(() => {
    async function validateAccess() {
      if (!guide) {
        setError('Guide not found');
        setLoading(false);
        return;
      }

      // Check for session_id (coming from Stripe checkout)
      const sessionId = searchParams.get('session_id');
      const accessToken = searchParams.get('access');

      // If coming from Stripe, get access token
      if (sessionId) {
        try {
          const res = await fetch('/api/get-access-from-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });

          const data = await res.json();

          if (data.purchases && data.purchases.length > 0) {
            // Find the purchase for this guide
            const purchase = data.purchases.find((p: any) => p.guideId === guide.id);

            if (purchase) {
              // Redirect to URL with access token
              router.replace(`/guides/${params.slug}?access=${purchase.accessToken}`);
              return;
            }
          }

          setError('Unable to verify purchase. Please check your email for access link.');
          setLoading(false);
          return;
        } catch (err) {
          console.error('Session validation error:', err);
          setError('Unable to verify purchase. Please check your email for access link.');
          setLoading(false);
          return;
        }
      }

      // If access token provided, validate it
      if (accessToken) {
        try {
          const res = await fetch('/api/validate-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken, guideId: guide.id }),
          });

          const data = await res.json();

          if (data.valid) {
            setAccessGranted(true);
            // Store token in localStorage for future visits
            localStorage.setItem(`guide-${guide.id}-token`, accessToken);

            // Load the guide content
            await loadGuideContent();
          } else {
            setError(data.error || 'Invalid or expired access link.');
          }
        } catch (err) {
          console.error('Access validation error:', err);
          setError('Unable to validate access.');
        }
      } else {
        // Check localStorage for saved token
        const savedToken = localStorage.getItem(`guide-${guide.id}-token`);
        if (savedToken) {
          router.replace(`/guides/${params.slug}?access=${savedToken}`);
          return;
        }

        // No access - redirect to purchase page
        router.push(`/${params.slug}`);
        return;
      }

      setLoading(false);
    }

    validateAccess();
  }, [searchParams, params.slug, guide, router]);

  async function loadGuideContent() {
    try {
      // For now, we'll load from public/guides directory
      // In production, you'd place your HTML guides there
      const response = await fetch(`/guides/${guide?.id}.html`);

      if (response.ok) {
        const html = await response.text();
        setGuideHtml(html);
      } else {
        // Guide HTML not found - show placeholder
        setGuideHtml(`
          <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <h1 style="color: #4ECDC4; margin-bottom: 20px;">${guide?.emoji} ${guide?.title}</h1>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #4ECDC4;">
              <h2 style="margin-top: 0;">Guide Content Coming Soon!</h2>
              <p>Your access has been verified. The full guide content will be available here shortly.</p>
              <p>Your purchase includes:</p>
              <ul>
                ${guide?.features.map(f => `<li>${f}</li>`).join('')}
              </ul>
              <p style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
                <strong>📧 Note:</strong> You can bookmark this page or save the link from your email. Your access never expires!
              </p>
            </div>
          </div>
        `);
      }
    } catch (err) {
      console.error('Error loading guide:', err);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Issue</h2>
          <p className="text-gray-600 mb-6">{error}</p>

          <div className="space-y-3">
            <Link
              href={`/${params.slug}`}
              className="block w-full px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#556FB5] text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Purchase This Guide
            </Link>

            <Link
              href="/lost-access"
              className="block w-full px-6 py-3 border-2 border-[#4ECDC4] text-[#4ECDC4] rounded-lg font-semibold hover:bg-[#4ECDC4] hover:text-white transition"
            >
              I Already Purchased This
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
    return null; // Will redirect to purchase page
  }

  // Display the guide content
  return (
    <div className="min-h-screen bg-white">
      {/* Simple header with logo/home link */}
      <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#4ECDC4] hover:opacity-80 transition">
            HealthEGuides
          </Link>
          <div className="text-sm text-gray-600">
            {guide?.emoji} {guide?.title}
          </div>
        </div>
      </header>

      {/* Guide content */}
      <div
        className="guide-content"
        dangerouslySetInnerHTML={{ __html: guideHtml }}
      />

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
