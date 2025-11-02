/**
 * Quick test to see if .env.local is being read correctly
 */

const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', '.env.local');

console.log('🔍 Debug Info:\n');
console.log('Current directory:', __dirname);
console.log('Looking for .env.local at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  console.log('\n📄 File size:', content.length, 'bytes');
  console.log('Line count:', content.split('\n').length);

  // Check for Firebase variables (without printing values)
  console.log('\n🔑 Firebase variables found in file:');
  console.log('  FIREBASE_PROJECT_ID:', content.includes('FIREBASE_PROJECT_ID=') ? '✅ FOUND' : '❌ NOT FOUND');
  console.log('  FIREBASE_CLIENT_EMAIL:', content.includes('FIREBASE_CLIENT_EMAIL=') ? '✅ FOUND' : '❌ NOT FOUND');
  console.log('  FIREBASE_PRIVATE_KEY:', content.includes('FIREBASE_PRIVATE_KEY=') ? '✅ FOUND' : '❌ NOT FOUND');
}

console.log('\n🌍 Current environment variables:');
console.log('  FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ SET' : '❌ NOT SET');
console.log('  FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ SET' : '❌ NOT SET');
console.log('  FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ SET (length: ' + (process.env.FIREBASE_PRIVATE_KEY?.length || 0) + ')' : '❌ NOT SET');
