import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { validateAdminAuth } from '@/lib/admin-auth';
import { getStorage } from 'firebase-admin/storage';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import path from 'path';

// Maximum PDF file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Validate admin authentication
    const authResult = validateAdminAuth(request);
    if (authResult !== true) {
      return authResult;
    }

    const formData = await request.formData();
    const pdf = formData.get('pdf') as File;
    const guideId = formData.get('guideId') as string;

    if (!pdf || !guideId) {
      return NextResponse.json(
        { error: 'Missing PDF file or guide ID' },
        { status: 400 }
      );
    }

    // Validate file size
    if (pdf.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type (must be PDF)
    if (pdf.type !== 'application/pdf' && !pdf.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
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

    // Verify guide exists
    const guideDoc = await adminDb.collection('guides').doc(sanitizedGuideId).get();
    if (!guideDoc.exists) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }

    // Convert File to Buffer
    const bytes = await pdf.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try to use Firebase Storage first, fallback to local storage
    let pdfUrl: string;

    try {
      const storage = getStorage();
      const bucket = storage.bucket();
      const file = bucket.file(`guides/${sanitizedGuideId}.pdf`);

      await file.save(buffer, {
        metadata: {
          contentType: 'application/pdf',
        },
      });

      // Make file publicly accessible
      await file.makePublic();

      pdfUrl = file.publicUrl();

      // Update guide with PDF URL
      await adminDb.collection('guides').doc(sanitizedGuideId).update({
        pdfUrl,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        url: pdfUrl,
        storage: 'firebase'
      });
    } catch (firebaseError) {
    // Warning log removed

      // Fallback to local storage in public/guides
      const guidesDir = join(process.cwd(), 'public', 'guides');

      try {
        await mkdir(guidesDir, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      const filePath = join(guidesDir, `${sanitizedGuideId}.pdf`);
      await writeFile(filePath, buffer);

      pdfUrl = `/guides/${sanitizedGuideId}.pdf`;

      // Update guide with local PDF URL
      await adminDb.collection('guides').doc(sanitizedGuideId).update({
        pdfUrl,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        url: pdfUrl,
        storage: 'local'
      });
    }
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to upload PDF' },
      { status: 500 }
    );
  }
}
