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
          // Merge: Firestore data takes priority, hardcoded guide is fallback
          return {
            ...guide, // Start with hardcoded defaults
            ...firestoreGuide, // Override with any Firestore data
            // Ensure we preserve the ID
            id: guide.id,
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
    // Warning log removed

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

    // Normalize all guides to ensure required fields are valid
    // This prevents client-side crashes from missing/invalid data
    const normalizedGuides = guidesData.map(guide => ({
      ...guide,
      features: Array.isArray(guide.features) ? guide.features : [],
      price: typeof guide.price === 'number' && !isNaN(guide.price) ? guide.price : 0,
      keywords: Array.isArray(guide.keywords) ? guide.keywords : [],
    }));

    return normalizedGuides;
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    // Normalize hardcoded guides before returning as fallback
    return hardcodedGuides.map(guide => ({
      ...guide,
      features: Array.isArray(guide.features) ? guide.features : [],
      price: typeof guide.price === 'number' && !isNaN(guide.price) ? guide.price : 0,
      keywords: Array.isArray(guide.keywords) ? guide.keywords : [],
    }));
  }
}

/**
 * Fetches a single guide by slug
 * Checks hardcoded guides first, then Firebase
 * Always normalizes the guide data before returning
 */
export async function getGuideBySlugFromAll(slug: string): Promise<Guide | null> {
  // Check hardcoded guides first (faster)
  const hardcodedGuide = hardcodedGuides.find(g => g.slug === slug);
  if (hardcodedGuide) {
    // Normalize before returning
    return {
      ...hardcodedGuide,
      features: Array.isArray(hardcodedGuide.features) ? hardcodedGuide.features : [],
      price: typeof hardcodedGuide.price === 'number' && !isNaN(hardcodedGuide.price) ? hardcodedGuide.price : 0,
      keywords: Array.isArray(hardcodedGuide.keywords) ? hardcodedGuide.keywords : [],
    };
  }

  // If not in hardcoded, fetch all guides (including Firebase) and find by slug
  const allGuides = await getAllGuides();
  const guide = allGuides.find(g => g.slug === slug);

  // getAllGuides() already normalizes, but be explicit
  if (guide) {
    return {
      ...guide,
      features: Array.isArray(guide.features) ? guide.features : [],
      price: typeof guide.price === 'number' && !isNaN(guide.price) ? guide.price : 0,
      keywords: Array.isArray(guide.keywords) ? guide.keywords : [],
    };
  }

  return null;
}
