import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const html = formData.get('html') as File;
    const guideId = formData.get('guideId') as string;

    if (!html || !guideId) {
      return NextResponse.json(
        { error: 'Missing HTML file or guide ID' },
        { status: 400 }
      );
    }

    // Verify guide exists in Firestore (if configured)
    try {
      const guideDoc = await adminDb.collection('guides').doc(guideId).get();
      if (!guideDoc.exists) {
        console.warn(`Guide ${guideId} not found in Firestore, continuing anyway...`);
      }
    } catch (err) {
      console.warn('Firestore not configured, skipping guide verification');
    }

    // Convert File to text
    const htmlContent = await html.text();

    // Save to /public/guides/{guideId}.html
    const guidesDir = join(process.cwd(), 'public', 'guides');

    // Ensure directory exists
    try {
      await mkdir(guidesDir, { recursive: true });
    } catch (err) {
      // Directory might already exist, that's ok
    }

    // Write HTML file
    const filePath = join(guidesDir, `${guideId}.html`);
    await writeFile(filePath, htmlContent, 'utf-8');

    // Update guide record with HTML URL and mark as available (if Firestore is configured)
    const htmlUrl = `/guides/${guideId}.html`;
    try {
      await adminDb.collection('guides').doc(guideId).update({
        htmlUrl,
        hasHtmlGuide: true,
        comingSoon: false, // Mark guide as available now that HTML is uploaded
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not update Firestore record (may not be configured)');
    }

    return NextResponse.json({
      success: true,
      url: htmlUrl,
      path: filePath
    });
  } catch (error) {
    console.error('Error uploading HTML:', error);
    return NextResponse.json(
      { error: 'Failed to upload HTML guide' },
      { status: 500 }
    );
  }
}
