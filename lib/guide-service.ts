import { guides as hardcodedGuides, Guide } from '@/lib/guides';
import { adminDb } from '@/lib/firebase-admin';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Fetches all guides from both hardcoded list and Firebase
 * This is shared logic used by both the API route and page components
 */
export async function getAllGuides(): Promise<Guide[]> {
  try {
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
          guidesData.push(firestoreGuide as Guide);
        }
      });

    } catch (err) {
      console.warn('Firestore not configured or error fetching guides:', err);

      // Fallback: Just check if HTML files exist locally
      guidesData = guidesData.map((guide) => {
        const htmlPath = join(process.cwd(), 'public', 'guides', `${guide.id}.html`);
        if (existsSync(htmlPath)) {
          return { ...guide, comingSoon: false };
        }
        return guide;
      });
    }

    // Sort guides: available ones (with HTML) first, then coming soon
    guidesData.sort((a, b) => {
      const aAvailable = !a.comingSoon;
      const bAvailable = !b.comingSoon;

      if (aAvailable && !bAvailable) return -1; // a first
      if (!aAvailable && bAvailable) return 1;  // b first
      return 0; // keep original order within groups
    });

    return guidesData;
  } catch (error) {
    console.error('Error fetching guides:', error);
    return hardcodedGuides;
  }
}

/**
 * Fetches a single guide by slug
 * Checks hardcoded guides first, then Firebase
 */
export async function getGuideBySlugFromAll(slug: string): Promise<Guide | null> {
  // Check hardcoded guides first (faster)
  const hardcodedGuide = hardcodedGuides.find(g => g.slug === slug);
  if (hardcodedGuide) {
    return hardcodedGuide;
  }

  // If not in hardcoded, fetch all guides (including Firebase) and find by slug
  const allGuides = await getAllGuides();
  return allGuides.find(g => g.slug === slug) || null;
}
