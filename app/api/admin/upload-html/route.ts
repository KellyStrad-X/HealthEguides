import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { validateAdminAuth } from '@/lib/admin-auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import path from 'path';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Validate admin authentication
    const authResult = validateAdminAuth(request);
    if (authResult !== true) {
      return authResult;
    }

    const formData = await request.formData();
    const html = formData.get('html') as File;
    const guideId = formData.get('guideId') as string;

    if (!html || !guideId) {
      return NextResponse.json(
        { error: 'Missing HTML file or guide ID' },
        { status: 400 }
      );
    }

    // Validate file size
    if (html.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type (must be HTML)
    const validTypes = ['text/html', 'application/xhtml+xml'];
    if (!validTypes.includes(html.type) && !html.name.endsWith('.html')) {
      return NextResponse.json(
        { error: 'File must be an HTML file' },
        { status: 400 }
      );
    }

    // Sanitize guide ID to prevent path traversal attacks
    const sanitizedGuideId = path.basename(guideId).replace(/[^a-zA-Z0-9-_]/g, '');
    if (!sanitizedGuideId || sanitizedGuideId !== guideId) {
      return NextResponse.json(
        { error: 'Invalid guide ID. Use only alphanumeric characters, hyphens, and underscores.' },
        { status: 400 }
      );
    }

    // Verify guide exists in Firestore (if configured)
    try {
      const guideDoc = await adminDb.collection('guides').doc(sanitizedGuideId).get();
      if (!guideDoc.exists) {
    // Warning log removed
      }
    } catch (err) {
    // Warning log removed
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
    const filePath = join(guidesDir, `${sanitizedGuideId}.html`);
    await writeFile(filePath, htmlContent, 'utf-8');

    // Update guide record with HTML URL and mark as available (if Firestore is configured)
    const htmlUrl = `/guides/${sanitizedGuideId}.html`;
    try {
      await adminDb.collection('guides').doc(sanitizedGuideId).update({
        htmlUrl,
        hasHtmlGuide: true,
        comingSoon: false, // Mark guide as available now that HTML is uploaded
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
    // Warning log removed
    }

    return NextResponse.json({
      success: true,
      url: htmlUrl,
      path: filePath
    });
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to upload HTML guide' },
      { status: 500 }
    );
  }
}
