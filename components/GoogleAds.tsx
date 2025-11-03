'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    gtag: any;
    dataLayer: any;
  }
}

export default function GoogleAds() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  useEffect(() => {
    if (!adsId) return;

    // Initialize gtag if not already done
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
    }

    // Configure Google Ads
    window.gtag('config', adsId);
  }, [adsId, pathname, searchParams]);

  return null;
}

// Helper function to track purchase conversions
export const trackGoogleAdsPurchase = (
  transactionId: string,
  value: number,
  currency: string = 'USD'
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

    if (adsId && conversionLabel) {
      // Send conversion event to Google Ads
      window.gtag('event', 'conversion', {
        send_to: `${adsId}/${conversionLabel}`,
        value: value,
        currency: currency,
        transaction_id: transactionId
      });
    }
  }
};

// Helper function to track page views for remarketing
export const trackGoogleAdsPageView = (pageUrl: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

    if (adsId) {
      window.gtag('event', 'page_view', {
        send_to: adsId,
        page_location: pageUrl
      });
    }
  }
};

// Helper function to track when users view a product
export const trackGoogleAdsViewItem = (
  itemId: string,
  itemName: string,
  value: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

    if (adsId) {
      window.gtag('event', 'view_item', {
        send_to: adsId,
        items: [{
          id: itemId,
          name: itemName,
          category: 'Health Guides',
          price: value
        }],
        value: value,
        currency: 'USD'
      });
    }
  }
};

// Helper function to track when users begin checkout
export const trackGoogleAdsBeginCheckout = (
  items: Array<{ id: string; name: string; price: number }>,
  value: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

    if (adsId) {
      window.gtag('event', 'begin_checkout', {
        send_to: adsId,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          category: 'Health Guides',
          price: item.price
        })),
        value: value,
        currency: 'USD'
      });
    }
  }
};
