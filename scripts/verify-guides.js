/**
 * Verify guide statuses in Firebase Firestore
 *
 * This script checks all guides in Firestore and shows their current status
 * Useful for confirming which guides are published vs coming soon
 *
 * Run with: node scripts/verify-guides.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} catch (err) {
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

    if (hasIndividualFields) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('✅ Firebase initialized\n');
    } else {
      console.error('❌ Missing Firebase credentials');
      process.exit(1);
    }

    return admin.app();
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    process.exit(1);
  }
}

async function verifyGuides() {
  console.log('🔍 Verifying guides in Firestore...\n');

  initializeFirebase();
  const db = admin.firestore();

  try {
    const snapshot = await db.collection('guides').get();

    if (snapshot.empty) {
      console.log('📭 No guides found in Firestore\n');
      process.exit(0);
    }

    const available = [];
    const comingSoon = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const guide = {
        id: doc.id,
        title: data.title,
        hasHtml: data.hasHtmlGuide || false,
        comingSoon: data.comingSoon !== false // Default to true if not explicitly false
      };

      if (guide.comingSoon) {
        comingSoon.push(guide);
      } else {
        available.push(guide);
      }
    });

    console.log('📊 GUIDE STATUS SUMMARY\n');
    console.log(`Total Guides: ${snapshot.size}`);
    console.log(`Available: ${available.length}`);
    console.log(`Coming Soon: ${comingSoon.length}\n`);

    if (available.length > 0) {
      console.log('✅ AVAILABLE GUIDES (comingSoon: false)\n');
      available.forEach(guide => {
        const htmlStatus = guide.hasHtml ? '✓ HTML' : '✗ No HTML';
        console.log(`   ${guide.title}`);
        console.log(`   ID: ${guide.id} | ${htmlStatus}\n`);
      });
    }

    if (comingSoon.length > 0) {
      console.log('⏳ COMING SOON GUIDES (comingSoon: true)\n');
      comingSoon.forEach(guide => {
        const htmlStatus = guide.hasHtml ? '✓ HTML (but marked coming soon)' : '✗ No HTML';
        console.log(`   ${guide.title}`);
        console.log(`   ID: ${guide.id} | ${htmlStatus}\n`);
      });
    }

    // Check for guides with HTML but still marked coming soon
    const mismatched = comingSoon.filter(g => g.hasHtml);
    if (mismatched.length > 0) {
      console.log('⚠️  ATTENTION: These guides have HTML but are marked "Coming Soon":\n');
      mismatched.forEach(guide => {
        console.log(`   - ${guide.title} (${guide.id})`);
      });
      console.log('\n   Consider updating these to comingSoon: false\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run verification
verifyGuides();
