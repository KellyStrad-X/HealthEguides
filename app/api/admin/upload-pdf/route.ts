import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdf = formData.get('pdf') as File;
    const guideId = formData.get('guideId') as string;

    if (!pdf || !guideId) {
      return NextResponse.json(
        { error: 'Missing PDF file or guide ID' },
        { status: 400 }
      );
    }

    // Verify guide exists
    const guideDoc = await adminDb.collection('guides').doc(guideId).get();
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
      const file = bucket.file(`guides/${guideId}.pdf`);

      await file.save(buffer, {
        metadata: {
          contentType: 'application/pdf',
        },
      });

      // Make file publicly accessible
      await file.makePublic();

      pdfUrl = file.publicUrl();

      // Update guide with PDF URL
      await adminDb.collection('guides').doc(guideId).update({
        pdfUrl,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        url: pdfUrl,
        storage: 'firebase'
      });
    } catch (firebaseError) {
      console.warn('Firebase Storage upload failed, using local storage:', firebaseError);

      // Fallback to local storage in public/guides
      const guidesDir = join(process.cwd(), 'public', 'guides');

      try {
        await mkdir(guidesDir, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      const filePath = join(guidesDir, `${guideId}.pdf`);
      await writeFile(filePath, buffer);

      pdfUrl = `/guides/${guideId}.pdf`;

      // Update guide with local PDF URL
      await adminDb.collection('guides').doc(guideId).update({
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
    console.error('Error uploading PDF:', error);
    return NextResponse.json(
      { error: 'Failed to upload PDF' },
      { status: 500 }
    );
  }
}
