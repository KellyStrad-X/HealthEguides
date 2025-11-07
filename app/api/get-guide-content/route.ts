import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const { accessToken, guideId } = await request.json();

    if (!accessToken || !guideId) {
      return NextResponse.json(
        { error: 'Missing access token or guide ID' },
        { status: 400 }
      );
    }

    // Validate access token
    const purchasesSnapshot = await adminDb
      .collection('purchases')
      .where('accessToken', '==', accessToken)
      .where('guideId', '==', guideId)
      .limit(1)
      .get();

    if (purchasesSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 403 }
      );
    }

    const purchase = purchasesSnapshot.docs[0].data();

    // Check if purchase is active
    if (purchase.status !== 'active') {
      return NextResponse.json(
        { error: 'Access has been revoked' },
        { status: 403 }
      );
    }

    // Try to read the guide HTML from private directory
    const htmlPath = join(process.cwd(), 'private', 'guides', `${guideId}.html`);

    if (!existsSync(htmlPath)) {
      // No HTML file exists, return placeholder
      return NextResponse.json({
        html: null,
        placeholder: true
      });
    }

    const html = readFileSync(htmlPath, 'utf-8');

    return NextResponse.json({
      html,
      placeholder: false
    });

  } catch (error) {
    console.error('Error fetching guide content:', error);
    return NextResponse.json(
      { error: 'Failed to load guide content' },
      { status: 500 }
    );
  }
}
