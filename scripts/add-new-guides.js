/**
 * Add new placeholder guides from the backlog to Firebase
 *
 * This script creates 21 new guides based on the guide backlog
 * All guides created with comingSoon: true until HTML is uploaded
 *
 * Run with: node scripts/add-new-guides.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
  console.log('📄 Loaded .env.local with dotenv');
} catch (err) {
  console.log('📄 Loading .env.local manually (dotenv not available)');
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
  } else {
    console.warn('⚠️  .env.local file not found at:', envPath);
  }
}

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    if (admin.apps.length > 0) {
      return admin.app();
    }

    const hasIndividualFields = process.env.FIREBASE_PROJECT_ID &&
                                process.env.FIREBASE_CLIENT_EMAIL &&
                                process.env.FIREBASE_PRIVATE_KEY;

    if (!hasIndividualFields && !process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('❌ Missing Firebase credentials in .env.local\n');
      console.error('Required environment variables:');
      console.error('  FIREBASE_PROJECT_ID=' + (process.env.FIREBASE_PROJECT_ID ? '✅' : '❌ MISSING'));
      console.error('  FIREBASE_CLIENT_EMAIL=' + (process.env.FIREBASE_CLIENT_EMAIL ? '✅' : '❌ MISSING'));
      console.error('  FIREBASE_PRIVATE_KEY=' + (process.env.FIREBASE_PRIVATE_KEY ? '✅' : '❌ MISSING'));
      process.exit(1);
    }

    if (hasIndividualFields) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('✅ Firebase initialized');
      console.log('   Project: ' + process.env.FIREBASE_PROJECT_ID);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase initialized with service account JSON');
    }

    return admin.app();
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    process.exit(1);
  }
}

// New guides from backlog
const newGuides = [
  // HORMONAL HEALTH
  {
    id: "cycle-syncing-guide",
    title: "The Cycle Syncing Guide",
    description: "Align your daily activities, nutrition, and workouts with your menstrual cycle phases. Optimize energy, productivity, and wellness by working WITH your hormones.",
    emoji: "🌸",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    features: [
      "Actionable 28-day framework",
      "Phase-specific nutrition recommendations",
      "Optimized workout plans for each phase",
      "Energy management strategies"
    ],
    slug: "cycle-syncing",
    metaDescription: "Complete guide to cycle syncing with evidence-based strategies for optimizing energy, nutrition, and workouts throughout your menstrual cycle.",
    keywords: ["cycle syncing", "menstrual cycle", "hormone health", "women's health", "cycle tracking", "energy optimization"],
    category: "Hormone Health",
    comingSoon: true
  },
  {
    id: "pcos-beyond-birth-control",
    title: "PCOS Beyond Birth Control",
    description: "Comprehensive guide for managing PCOS symptoms through lifestyle, nutrition, supplements, and treatments beyond just birth control.",
    emoji: "💜",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    features: [
      "Holistic PCOS management approach",
      "Insulin resistance reversal strategies",
      "Inflammation reduction protocols",
      "Stress management for hormone balance"
    ],
    slug: "pcos-beyond-birth-control",
    metaDescription: "Complete guide to managing PCOS beyond birth control with evidence-based strategies for insulin resistance, inflammation, and hormone balance.",
    keywords: ["PCOS", "polycystic ovary syndrome", "insulin resistance", "hormone health", "women's health", "holistic PCOS"],
    category: "Hormone Health",
    comingSoon: true
  },
  {
    id: "decoding-hormone-labs",
    title: "Decoding Your Hormone Labs",
    description: "Demystifying hormone labs - which tests to request, how to read results, what 'normal' ranges really mean, and when to advocate for further testing.",
    emoji: "🔬",
    gradient: "linear-gradient(135deg, #4ECDC4 0%, #556FB5 100%)",
    features: [
      "Complete hormone testing guide",
      "How to interpret lab results",
      "When to request additional testing",
      "Scripts for advocating with doctors"
    ],
    slug: "hormone-labs",
    metaDescription: "Learn how to request, read, and interpret hormone lab results to advocate for your health and have informed conversations with providers.",
    keywords: ["hormone labs", "lab results", "hormone testing", "women's health", "thyroid", "fertility testing"],
    category: "Hormone Health",
    comingSoon: true
  },

  // LONGEVITY & OPTIMIZATION
  {
    id: "longevity-nutrition-guide",
    title: "Longevity Nutrition Guide",
    description: "Evidence-based nutrition strategies that extend healthspan - not fad diets, but sustainable eating patterns proven to support longevity.",
    emoji: "🥗",
    gradient: "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)",
    features: [
      "Blue Zone principles for modern life",
      "Meal plans and shopping guides",
      "Anti-inflammatory nutrition protocols",
      "Sustainable eating strategies"
    ],
    slug: "longevity-nutrition",
    metaDescription: "Evidence-based nutrition strategies for extending healthspan with Blue Zone principles adapted for modern busy women.",
    keywords: ["longevity", "nutrition", "healthy aging", "blue zones", "anti-aging diet", "healthspan"],
    category: "Nutrition & Diet",
    comingSoon: true
  },
  {
    id: "health-wearables-guide",
    title: "The Health Wearables Guide",
    description: "Complete guide to health wearables - which one to choose, what metrics matter, how to interpret data, and actionable changes based on insights.",
    emoji: "⌚",
    gradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    features: [
      "Oura vs Apple Watch vs Whoop comparison",
      "Women-specific tracking features",
      "HRV and sleep stage interpretation",
      "Actionable insights from your data"
    ],
    slug: "health-wearables",
    metaDescription: "Complete guide to health wearables for women with honest comparisons, metric interpretation, and cycle-tracking features.",
    keywords: ["health wearables", "Oura ring", "Apple Watch", "fitness tracking", "cycle tracking", "HRV"],
    category: "Wellness",
    comingSoon: true
  },

  // MODERN MOTHERHOOD
  {
    id: "lighthouse-parenting-guide",
    title: "The Lighthouse Parenting Guide",
    description: "Introduction to lighthouse parenting as alternative to exhausting gentle parenting - firm boundaries + emotional support without sacrificing yourself.",
    emoji: "💡",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    features: [
      "Lighthouse parenting framework",
      "Setting limits while staying connected",
      "Practical scripts for common situations",
      "Boundary examples by age group"
    ],
    slug: "lighthouse-parenting",
    metaDescription: "Master lighthouse parenting with evidence-based strategies for firm boundaries, emotional support, and connected parenting without burnout.",
    keywords: ["lighthouse parenting", "gentle parenting", "parenting styles", "boundaries", "motherhood", "parenting advice"],
    category: "Motherhood",
    comingSoon: true
  },
  {
    id: "boundaries-burnt-out-moms",
    title: "Boundaries for Burnt-Out Moms",
    description: "Practical boundary-setting guide for moms drowning in expectations - from family, partners, kids, society. How to say no without guilt.",
    emoji: "🛡️",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    features: [
      "Boundaries by category (partner, kids, in-laws)",
      "Scripts for saying no gracefully",
      "Stop people-pleasing strategies",
      "Guilt-free boundary maintenance"
    ],
    slug: "mom-boundaries",
    metaDescription: "Practical boundary-setting guide for burnt-out moms with specific scripts for partners, kids, in-laws, and society expectations.",
    keywords: ["mom boundaries", "motherhood", "burnt-out moms", "saying no", "self-care", "people-pleasing"],
    category: "Motherhood",
    comingSoon: true
  },
  {
    id: "mom-guilt-solution",
    title: "The Mom Guilt Solution",
    description: "Addressing the crushing weight of mom guilt - where it comes from, why it's pervasive, and how to release it. Reframing 'good enough' mothering.",
    emoji: "💗",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    features: [
      "Understanding mom guilt roots",
      "Cognitive reframing practices",
      "Self-compassion for mothers",
      "Good enough mothering framework"
    ],
    slug: "mom-guilt",
    metaDescription: "Release mom guilt with evidence-based cognitive reframing and self-compassion practices specifically designed for mothers.",
    keywords: ["mom guilt", "motherhood", "parenting", "self-compassion", "perfectionism", "good enough parenting"],
    category: "Motherhood",
    comingSoon: true
  },

  // MENTAL HEALTH & STRESS
  {
    id: "somatic-healing-guide",
    title: "Somatic Healing for Stress",
    description: "Introduction to somatic practices for releasing trauma and stress held in the body - breathwork, body scanning, movement, nervous system regulation.",
    emoji: "🧘‍♀️",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    features: [
      "Simple daily somatic practices",
      "Breathwork techniques for stress release",
      "Body scanning and awareness",
      "Nervous system regulation strategies"
    ],
    slug: "somatic-healing",
    metaDescription: "Learn somatic practices for releasing trauma and stress held in the body with breathwork, movement, and nervous system regulation.",
    keywords: ["somatic healing", "trauma release", "stress management", "breathwork", "nervous system", "body-based therapy"],
    category: "Mental Health",
    comingSoon: true
  },
  {
    id: "anxiety-toolkit",
    title: "The Anxiety Toolkit",
    description: "Evidence-based anxiety management techniques - grounding exercises, cognitive strategies, lifestyle factors, when to seek professional help.",
    emoji: "🌟",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    features: [
      "Grounding exercises for panic attacks",
      "Cognitive strategies for racing thoughts",
      "Social anxiety management",
      "When to seek professional help"
    ],
    slug: "anxiety-toolkit",
    metaDescription: "Evidence-based anxiety management toolkit with grounding exercises, cognitive strategies, and techniques organized by situation.",
    keywords: ["anxiety", "anxiety management", "panic attacks", "mental health", "stress", "grounding techniques"],
    category: "Mental Health",
    comingSoon: true
  },
  {
    id: "stress-proofing-practices",
    title: "Daily Stress-Proofing Practices",
    description: "Building resilience through daily micro-practices - morning routines, nervous system regulation, preventing burnout before it happens.",
    emoji: "✨",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    features: [
      "10-minute-or-less daily practices",
      "Morning and evening routines",
      "Nervous system regulation",
      "Burnout prevention strategies"
    ],
    slug: "stress-proofing",
    metaDescription: "Build resilience with daily 10-minute stress-proofing practices that fit into real life and prevent burnout.",
    keywords: ["stress management", "burnout prevention", "resilience", "daily practices", "nervous system", "wellness"],
    category: "Mental Health",
    comingSoon: true
  },

  // WORK-LIFE BALANCE
  {
    id: "working-moms-guide",
    title: "The Working Mom's Guide",
    description: "Practical strategies for working moms to manage career + caregiving without losing themselves. Time management, mental load reduction, flexible work negotiation.",
    emoji: "💼",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    features: [
      "Career and caregiving balance",
      "Mental load reduction strategies",
      "Flexible work negotiation scripts",
      "Realistic strategies from real moms"
    ],
    slug: "working-moms",
    metaDescription: "Practical strategies for working moms to manage career and caregiving without burnout, with flexible work negotiation tips.",
    keywords: ["working moms", "work-life balance", "motherhood", "career", "mental load", "flexible work"],
    category: "Work-Life Balance",
    comingSoon: true
  },
  {
    id: "negotiating-flexible-work",
    title: "Negotiating Flexible Work",
    description: "Step-by-step guide to negotiating remote work, flexible hours, or compressed schedules. Make the business case and handle pushback.",
    emoji: "🏡",
    gradient: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
    features: [
      "Business case templates",
      "Negotiation scripts and tactics",
      "Handling common objections",
      "Success stories and examples"
    ],
    slug: "flexible-work",
    metaDescription: "Step-by-step guide to negotiating remote work and flexible hours with scripts, business case templates, and objection handling.",
    keywords: ["flexible work", "remote work", "work from home", "negotiation", "work-life balance", "career"],
    category: "Work-Life Balance",
    comingSoon: true
  },
  {
    id: "time-management-women",
    title: "Time Management for Women",
    description: "Time management specifically for women managing career, household, caregiving, relationships, self-care. Energy management over time management.",
    emoji: "⏰",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    features: [
      "Energy management strategies",
      "Systems that reduce mental load",
      "Saying no and delegating",
      "Acknowledging invisible labor"
    ],
    slug: "time-management-women",
    metaDescription: "Time management for women juggling multiple roles with energy management, systems to reduce mental load, and practical strategies.",
    keywords: ["time management", "productivity", "mental load", "women", "work-life balance", "energy management"],
    category: "Work-Life Balance",
    comingSoon: true
  },

  // RELATIONSHIPS & DATING
  {
    id: "intentional-dating-guide",
    title: "Intentional Dating Guide",
    description: "Modern dating guide focused on intentional partner selection - knowing what you want, communicating early, recognizing compatibility vs. chemistry.",
    emoji: "💕",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
    features: [
      "2025 dating landscape navigation",
      "Boundary-setting from date one",
      "Compatibility vs. chemistry",
      "Avoiding time-wasters"
    ],
    slug: "intentional-dating",
    metaDescription: "Modern dating guide for women seeking serious relationships with intentional partner selection and boundary-setting strategies.",
    keywords: ["dating", "intentional dating", "relationships", "dating advice", "partner selection", "modern dating"],
    category: "Relationships",
    comingSoon: true
  },
  {
    id: "better-partner-guide",
    title: "Being a Better Partner",
    description: "Strengthening existing relationships through better communication, emotional regulation, conflict resolution, and maintaining individuality.",
    emoji: "💑",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    features: [
      "Team mindset vs. adversarial",
      "Communication frameworks",
      "Conflict resolution strategies",
      "Practical relationship exercises"
    ],
    slug: "better-partner",
    metaDescription: "Strengthen your relationship with evidence-based communication, emotional regulation, and conflict resolution strategies.",
    keywords: ["relationships", "partnership", "communication", "conflict resolution", "couples", "relationship advice"],
    category: "Relationships",
    comingSoon: true
  },
  {
    id: "relationship-boundaries",
    title: "Relationship Boundaries Guide",
    description: "Setting and maintaining healthy boundaries with romantic partners - recognizing violations, having hard conversations, when boundaries mean the relationship isn't right.",
    emoji: "🛡️",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    features: [
      "Boundary-setting in relationships",
      "Recognizing boundary violations",
      "Hard conversation scripts",
      "Self-love as foundation"
    ],
    slug: "relationship-boundaries",
    metaDescription: "Set and maintain healthy boundaries in romantic relationships with practical scripts and strategies for recognizing violations.",
    keywords: ["relationship boundaries", "boundaries", "relationships", "self-love", "healthy relationships", "dating"],
    category: "Relationships",
    comingSoon: true
  },

  // PERSONALIZED WELLNESS TECH
  {
    id: "cycle-tracking-guide",
    title: "Cycle Tracking 101",
    description: "How to use apps and wearables to track menstrual cycles, identify patterns, understand fertility windows, spot irregularities worth investigating.",
    emoji: "📱",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    features: [
      "App and wearable comparison",
      "Cycle literacy fundamentals",
      "Fertility window tracking",
      "When patterns indicate problems"
    ],
    slug: "cycle-tracking",
    metaDescription: "Learn to track your menstrual cycle with apps and wearables to understand fertility, identify patterns, and spot irregularities.",
    keywords: ["cycle tracking", "menstrual cycle", "fertility tracking", "apps", "wearables", "women's health"],
    category: "Women's Health",
    comingSoon: true
  },

  // CONFIDENCE & SELF-PRESENTATION
  {
    id: "dressing-for-confidence",
    title: "Dressing for Confidence",
    description: "Discovering personal style that builds confidence - moving beyond trends to what actually makes you feel good. Wardrobe audits and building signature style.",
    emoji: "👗",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    features: [
      "Enclothed cognition principles",
      "Personal style discovery",
      "Wardrobe audit process",
      "Building signature style"
    ],
    slug: "dressing-confidence",
    metaDescription: "Discover your personal style and build confidence through wardrobe choices with enclothed cognition and signature style development.",
    keywords: ["personal style", "confidence", "fashion", "wardrobe", "body positivity", "style"],
    category: "Confidence & Style",
    comingSoon: true
  },

  // FEMALE FRIENDSHIPS
  {
    id: "adult-friendships-guide",
    title: "Adult Female Friendships Guide",
    description: "Making and maintaining meaningful friendships as an adult woman - where to meet friends, moving from acquaintance to close friend, maintaining through life changes.",
    emoji: "👭",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    features: [
      "Where to meet friends as an adult",
      "Deepening acquaintance to friendship",
      "Maintaining friendships through change",
      "Practical strategies for busy women"
    ],
    slug: "adult-friendships",
    metaDescription: "Make and maintain meaningful female friendships as an adult with practical strategies for meeting friends and staying connected.",
    keywords: ["female friendships", "making friends", "adult friendships", "women friends", "friendship", "social connection"],
    category: "Friendships",
    comingSoon: true
  },

  // TECH & PARENTING
  {
    id: "screen-time-guide",
    title: "Screen Time Sanity",
    description: "Evidence-based guidelines for kids' screen time by age - how much, what type of content, setting boundaries, managing pushback.",
    emoji: "📱",
    gradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    features: [
      "Age-appropriate screen time guidelines",
      "Content quality recommendations",
      "Boundary-setting strategies",
      "Managing pushback from kids"
    ],
    slug: "screen-time",
    metaDescription: "Evidence-based screen time guidelines for kids by age with boundary-setting strategies and realistic middle-ground approaches.",
    keywords: ["screen time", "kids", "parenting", "technology", "digital parenting", "children"],
    category: "Parenting",
    comingSoon: true
  }
];

async function addNewGuides() {
  console.log('\n🌱 Adding new placeholder guides from backlog...\n');

  initializeFirebase();
  const db = admin.firestore();

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const guide of newGuides) {
    try {
      const guideRef = db.collection('guides').doc(guide.id);
      const doc = await guideRef.get();

      if (doc.exists) {
        console.log(`⏭️  Skipped (already exists): ${guide.title}`);
        skipped++;
        continue;
      }

      const timestamp = new Date().toISOString();
      await guideRef.set({
        ...guide,
        hasHtmlGuide: false,
        comingSoon: true,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      console.log(`✅ Created: ${guide.title}`);
      created++;
    } catch (error) {
      console.error(`❌ Error with ${guide.title}:`, error.message);
      errors++;
    }
  }

  console.log('\n📊 Complete!');
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${newGuides.length}\n`);

  process.exit(0);
}

// Run the script
addNewGuides().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
