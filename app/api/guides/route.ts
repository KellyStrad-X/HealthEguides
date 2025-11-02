import { NextResponse } from 'next/server';
import { guides as hardcodedGuides } from '@/lib/guides';
import { adminDb } from '@/lib/firebase-admin';
import { existsSync } from 'fs';
import { join } from 'path';

// Disable caching to ensure fresh data from Firebase
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Start with hardcoded guides as base
    let guidesData = [...hardcodedGuides];
    const hardcodedIds = new Set(hardcodedGuides.map(g => g.id));

    // Try to fetch and merge with Firestore data
    try {
      const guidesSnapshot = await adminDb.collection('guides').get();
      const firestoreGuides = new Map();

      guidesSnapshot.forEach((doc) => {
        const data = doc.data();
        firestoreGuides.set(doc.id, { ...data, id: doc.id });
      });

      // Update existing hardcoded guides with Firestore data
      guidesData = guidesData.map((guide) => {
        const firestoreGuide = firestoreGuides.get(guide.id);

        if (firestoreGuide) {
          // Merge: Firestore can override comingSoon and other status fields
          return {
            ...guide,
            comingSoon: firestoreGuide.comingSoon ?? guide.comingSoon,
            hasHtmlGuide: firestoreGuide.hasHtmlGuide,
            htmlUrl: firestoreGuide.htmlUrl,
          };
        }

        // Check if HTML file exists locally
        const htmlPath = join(process.cwd(), 'public', 'guides', `${guide.id}.html`);
        if (existsSync(htmlPath)) {
          return { ...guide, comingSoon: false };
        }

        return guide;
      });

      // Add any new guides from Firestore that aren't in hardcoded list
      firestoreGuides.forEach((firestoreGuide) => {
        if (!hardcodedIds.has(firestoreGuide.id)) {
          // This is a new guide created via admin panel
          guidesData.push(firestoreGuide);
        }
      });

    } catch (err) {
      console.warn('Firestore not configured or error fetching guides, using hardcoded guides:', err);

      // Fallback: Just check if HTML files exist locally
      guidesData = guidesData.map((guide) => {
        const htmlPath = join(process.cwd(), 'public', 'guides', `${guide.id}.html`);
        if (existsSync(htmlPath)) {
          return { ...guide, comingSoon: false };
        }
        return guide;
      });
    }

    return NextResponse.json(guidesData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching guides:', error);
    // Return hardcoded guides as fallback
    return NextResponse.json(hardcodedGuides, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }
}
