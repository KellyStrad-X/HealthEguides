'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    if (!pixelId) return;

    // Initialize Meta Pixel
    if (!window.fbq) {
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', pixelId);
    }

    // Track page view
    window.fbq('track', 'PageView');
  }, [pixelId, pathname, searchParams]);

  if (!pixelId) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}

// Helper functions to track events from other components
export const trackViewContent = (contentName: string, contentId: string, value: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: 'Health Guides',
      content_ids: [contentId],
      content_type: 'product',
      value: value,
      currency: 'USD'
    });
  }
};

export const trackInitiateCheckout = (contentName: string, contentId: string, value: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: contentName,
      content_category: 'Health Guides',
      content_ids: [contentId],
      content_type: 'product',
      value: value,
      currency: 'USD',
      num_items: 1
    });
  }
};

export const trackPurchase = (
  contentNames: string[],
  contentIds: string[],
  value: number,
  numItems: number
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_name: contentNames.join(', '),
      content_ids: contentIds,
      content_type: 'product',
      value: value,
      currency: 'USD',
      num_items: numItems
    });
  }
};

export const trackAddToCart = (contentName: string, contentId: string, value: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: contentName,
      content_category: 'Health Guides',
      content_ids: [contentId],
      content_type: 'product',
      value: value,
      currency: 'USD'
    });
  }
};
