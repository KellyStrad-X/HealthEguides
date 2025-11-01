import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Health E-Guides | Evidence-Based Women's Health Guides",
  description: "Affordable, research-backed digital health guides for women. Evidence-based solutions for perimenopause, PCOS, fertility, and more.",
  keywords: ["women's health", "health guides", "perimenopause", "PCOS", "fertility"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics - Add your GA4 ID */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
        {/* Gumroad Overlay Script */}
        <script src="https://gumroad.com/js/gumroad.js" async />
      </head>
      <body className="scrollbar-thin">
        {children}
      </body>
    </html>
  );
}
