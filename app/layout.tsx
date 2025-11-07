import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import GoogleAds from "@/components/GoogleAds";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Health E-Guides | Evidence-Based Women's Health Guides",
  description: "Affordable digital health guides for women. Educational resources informed by current health research for perimenopause, PCOS, fertility, and more.",
  keywords: ["women's health", "health guides", "perimenopause", "PCOS", "fertility"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: false });
              `}
            </Script>
          </>
        )}
        {/* Meta Pixel */}
        {metaPixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                if(s&&s.parentNode){s.parentNode.insertBefore(t,s);}else if(b.head){b.head.appendChild(t);}
                }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
                window.fbq('init', '${metaPixelId}');
              `}
          </Script>
        )}
      </head>
      <body className="scrollbar-thin">
        {metaPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
        <Suspense fallback={null}>
          <MetaPixel />
          <GoogleAds />
        </Suspense>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
