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
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (!pixelId) return;
    if (typeof window === 'undefined') return;
    if (typeof window.fbq !== 'function') return;

    window.fbq('track', 'PageView');
  }, [pixelId, pathname, searchParamsString]);

  return null;
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
