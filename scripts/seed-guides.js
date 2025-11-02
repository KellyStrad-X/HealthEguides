/**
 * Seed Firebase with placeholder guides from lib/guides.ts
 *
 * This script creates all hardcoded guides in Firebase Firestore
 * with comingSoon: true so they appear in the admin dashboard.
 *
 * Run with: node scripts/seed-guides.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return admin.app();
    }

    // Try service account JSON first
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase initialized with service account JSON');
    }
    // Fall back to individual fields
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('✅ Firebase initialized with individual fields');
    } else {
      throw new Error('Firebase credentials not found in environment variables');
    }

    return admin.app();
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    console.error('\nMake sure you have one of the following in .env.local:');
    console.error('  1. FIREBASE_SERVICE_ACCOUNT (full JSON)');
    console.error('  2. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }
}

// Hardcoded guides (matching lib/guides.ts)
const guides = [
  {
    id: "perimenopause-playbook",
    title: "The Perimenopause Playbook",
    description: "Navigate perimenopause with confidence. Evidence-based strategies for managing symptoms and thriving during this transition.",
    emoji: "🌸",
    gradient: "linear-gradient(135deg, #4ECDC4 0%, #556FB5 100%)",
    features: [
      "Complete symptom management guide",
      "Evidence-based treatment options",
      "Lifestyle & nutrition strategies",
      "Sleep optimization techniques"
    ],
    price: 4.99,
    slug: "perimenopause",
    gumroadUrl: "https://example.gumroad.com/l/perimenopause",
    metaDescription: "Complete guide to navigating perimenopause with evidence-based strategies for symptom management, treatment options, and lifestyle changes.",
    keywords: ["perimenopause", "menopause", "hormone health", "women's health", "symptom management"],
    category: "Hormone Health",
    comingSoon: true,
    hasHtmlGuide: false
  },
  {
    id: "pcos-guide",
    title: "PCOS Management Guide",
    description: "Take control of PCOS with comprehensive strategies for managing symptoms, optimizing fertility, and improving overall health.",
    emoji: "💜",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    features: [
      "Insulin resistance management",
      "Fertility optimization strategies",
      "Evidence-based supplement guide",
      "Exercise & nutrition protocols"
    ],
    price: 4.99,
    slug: "pcos",
    gumroadUrl: "https://example.gumroad.com/l/pcos",
    metaDescription: "Comprehensive PCOS management guide with strategies for insulin resistance, fertility, and symptom control.",
    keywords: ["PCOS", "polycystic ovary syndrome", "fertility", "insulin resistance", "women's health"],
    category: "Women's Health",
    comingSoon: true,
    hasHtmlGuide: false
  },
  {
    id: "fertility-boost",
    title: "Natural Fertility Boost",
    description: "Optimize your fertility naturally with evidence-based strategies for preconception health and reproductive wellness.",
    emoji: "🌱",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    features: [
      "Cycle tracking & optimization",
      "Preconception nutrition guide",
      "Lifestyle factors for fertility",
      "Partner health strategies"
    ],
    price: 4.99,
    slug: "fertility",
    gumroadUrl: "https://example.gumroad.com/l/fertility",
    metaDescription: "Natural fertility optimization guide with evidence-based strategies for preconception health and reproductive wellness.",
    keywords: ["fertility", "preconception", "conception", "reproductive health", "pregnancy planning"],
    category: "Fertility",
    comingSoon: true,
    hasHtmlGuide: false
  },
  {
    id: "stress-cortisol",
    title: "Stress & Cortisol Management",
    description: "Learn to balance cortisol and reduce stress for better health and energy.",
    emoji: "🧘‍♀️",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    features: [
      "Cortisol regulation strategies",
      "Stress reduction techniques",
      "Sleep & recovery protocols",
      "Mindfulness practices"
    ],
    price: 4.99,
    slug: "stress-cortisol",
    gumroadUrl: "https://example.gumroad.com/l/stress-cortisol",
    metaDescription: "Comprehensive guide to managing stress and balancing cortisol levels for optimal health.",
    keywords: ["stress management", "cortisol", "adrenal health", "wellness", "mental health"],
    category: "Wellness",
    comingSoon: true,
    hasHtmlGuide: false
  },
  {
    id: "sleep-optimization",
    title: "Sleep Optimization Guide",
    description: "Evidence-based strategies for deep, restorative sleep every night.",
    emoji: "😴",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    features: [
      "Sleep hygiene protocols",
      "Circadian rhythm optimization",
      "Natural sleep supplements",
      "Environmental factors"
    ],
    price: 4.99,
    slug: "sleep-optimization",
    gumroadUrl: "https://example.gumroad.com/l/sleep-optimization",
    metaDescription: "Science-backed strategies for improving sleep quality and achieving restorative rest.",
    keywords: ["sleep", "insomnia", "sleep quality", "wellness", "rest"],
    category: "Wellness",
    comingSoon: true,
    hasHtmlGuide: false
  },
  {
    id: "gut-health",
    title: "Gut Health Revolution",
    description: "Heal your gut and transform your overall health with proven protocols.",
    emoji: "🌿",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    features: [
      "Microbiome optimization",
      "Elimination diet protocols",
      "Digestive health strategies",
      "Supplement recommendations"
    ],
    price: 4.99,
    slug: "gut-health",
    gumroadUrl: "https://example.gumroad.com/l/gut-health",
    metaDescription: "Complete guide to healing your gut and optimizing digestive health naturally.",
    keywords: ["gut health", "microbiome", "digestive health", "IBS", "wellness"],
    category: "Digestive Health",
    comingSoon: true,
    hasHtmlGuide: false
  },
  {
    id: "energy-vitality",
    title: "Energy & Vitality Boost",
    description: "Combat fatigue and reclaim your energy with natural solutions.",
    emoji: "⚡",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    features: [
      "Energy-boosting nutrition",
      "Fatigue root cause analysis",
      "Exercise optimization",
      "Supplement protocols"
    ],
    price: 4.99,
    slug: "energy-vitality",
    gumroadUrl: "https://example.gumroad.com/l/energy-vitality",
    metaDescription: "Natural strategies to overcome fatigue and boost your energy levels sustainably.",
    keywords: ["energy", "fatigue", "vitality", "wellness", "adrenal fatigue"],
    category: "Wellness",
    comingSoon: true,
    hasHtmlGuide: false
  },
  {
    id: "retinol-guide",
    title: "Retinol Guide: Anti-Aging Essentials",
    description: "Master retinol for youthful, radiant skin. Evidence-based protocols for beginners to advanced users.",
    emoji: "✨",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    features: [
      "Step-by-step retinol introduction",
      "Product recommendations by strength",
      "Side effect management strategies",
      "Complete anti-aging protocol"
    ],
    price: 4.99,
    slug: "retinol-guide",
    gumroadUrl: "https://example.gumroad.com/l/retinol-guide",
    metaDescription: "Complete retinol guide for anti-aging with evidence-based protocols, product recommendations, and side effect management.",
    keywords: ["retinol", "anti-aging", "skincare", "skin health", "retinoids"],
    category: "Skincare",
    comingSoon: true,
    hasHtmlGuide: false
  }
];

async function seedGuides() {
  console.log('\n🌱 Starting guide seeding process...\n');

  // Initialize Firebase
  initializeFirebase();
  const db = admin.firestore();

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const guide of guides) {
    try {
      const guideRef = db.collection('guides').doc(guide.id);
      const doc = await guideRef.get();

      const timestamp = new Date().toISOString();
      const guideData = {
        ...guide,
        updatedAt: timestamp
      };

      if (doc.exists) {
        // Update existing guide but preserve hasHtmlGuide and comingSoon if already set
        const existingData = doc.data();
        await guideRef.update({
          ...guideData,
          hasHtmlGuide: existingData.hasHtmlGuide || false,
          comingSoon: existingData.comingSoon !== undefined ? existingData.comingSoon : true,
          createdAt: existingData.createdAt || timestamp
        });
        console.log(`✏️  Updated: ${guide.title}`);
        updated++;
      } else {
        // Create new guide
        await guideRef.set({
          ...guideData,
          hasHtmlGuide: false,
          comingSoon: true,
          createdAt: timestamp
        });
        console.log(`✅ Created: ${guide.title}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error with ${guide.title}:`, error.message);
      errors++;
    }
  }

  console.log('\n📊 Seeding Complete!');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${guides.length}\n`);

  process.exit(0);
}

// Run the seeding
seedGuides().catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
