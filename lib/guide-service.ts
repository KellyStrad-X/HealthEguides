import { guides as hardcodedGuides, Guide } from '@/lib/guides';
import { adminDb } from '@/lib/firebase-admin';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Fetches all guides from both hardcoded list and Firebase
 * This is shared logic used by both the API route and page components
 */
export async function getAllGuides(): Promise<Guide[]> {
  console.log('[getAllGuides] Starting guide fetch...');
  try {
    let guidesData = [...hardcodedGuides];
    console.log('[getAllGuides] Hardcoded guides count:', guidesData.length);
    const hardcodedIds = new Set(hardcodedGuides.map(g => g.id));

    // Try to fetch and merge with Firestore data
    try {
      const guidesSnapshot = await adminDb.collection('guides').get();
      const firestoreGuides = new Map();

      guidesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('[getAllGuides] Firestore guide:', doc.id, {
          hasFeatures: !!data.features,
          featuresType: typeof data.features,
          featuresIsArray: Array.isArray(data.features),
          hasPrice: !!data.price,
          priceType: typeof data.price,
          priceValue: data.price
        });
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

    // Normalize all guides to ensure required fields are valid
    // This prevents client-side crashes from missing/invalid data
    const normalizedGuides = guidesData.map(guide => {
      const normalized = {
        ...guide,
        features: Array.isArray(guide.features) ? guide.features : [],
        price: typeof guide.price === 'number' && !isNaN(guide.price) ? guide.price : 0,
        keywords: Array.isArray(guide.keywords) ? guide.keywords : [],
      };

      // Log if normalization changed anything
      if (!Array.isArray(guide.features) || typeof guide.price !== 'number') {
        console.log('[getAllGuides] NORMALIZED guide:', guide.id, {
          beforeFeatures: guide.features,
          afterFeatures: normalized.features,
          beforePrice: guide.price,
          afterPrice: normalized.price
        });
      }

      return normalized;
    });

    console.log('[getAllGuides] Returning', normalizedGuides.length, 'guides');
    // Log first guide structure to verify
    if (normalizedGuides.length > 0) {
      console.log('[getAllGuides] First guide sample:', {
        id: normalizedGuides[0].id,
        hasFeatures: !!normalizedGuides[0].features,
        featuresLength: normalizedGuides[0].features?.length,
        hasPrice: !!normalizedGuides[0].price,
        priceValue: normalizedGuides[0].price
      });
    }

    return normalizedGuides;
  } catch (error) {
    console.error('Error fetching guides:', error);
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
