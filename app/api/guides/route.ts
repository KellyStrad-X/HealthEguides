import { NextResponse } from 'next/server';
import { guides as hardcodedGuides } from '@/lib/guides';
import { adminDb } from '@/lib/firebase-admin';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Start with hardcoded guides as base
    let guidesData = [...hardcodedGuides];

    // Try to enhance with Firestore data
    try {
      const guidesSnapshot = await adminDb.collection('guides').get();
      const firestoreData = new Map();

      guidesSnapshot.forEach((doc) => {
        const data = doc.data();
        firestoreData.set(doc.id, {
          hasHtmlGuide: data.hasHtmlGuide,
          comingSoon: data.comingSoon,
          htmlUrl: data.htmlUrl,
        });
      });

      // Merge Firestore data with hardcoded guides
      guidesData = guidesData.map((guide) => {
        const firestoreGuide = firestoreData.get(guide.id);

        if (firestoreGuide) {
          // If Firestore says comingSoon is false, use that
          if (firestoreGuide.comingSoon === false) {
            return { ...guide, comingSoon: false };
          }
        }

        // Check if HTML file exists locally
        const htmlPath = join(process.cwd(), 'public', 'guides', `${guide.id}.html`);
        if (existsSync(htmlPath)) {
          // HTML exists, mark as available
          return { ...guide, comingSoon: false };
        }

        // Otherwise keep the guide's original comingSoon status
        return guide;
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

    return NextResponse.json(guidesData);
  } catch (error) {
    console.error('Error fetching guides:', error);
    // Return hardcoded guides as fallback
    return NextResponse.json(hardcodedGuides);
  }
}
