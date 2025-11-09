import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const email = decodedToken.email;

    const { guideId } = await request.json();

    if (!guideId) {
      return NextResponse.json(
        { error: 'Guide ID is required' },
        { status: 400 }
      );
    }

    // Verify user has active subscription
    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing'])
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      // Check by email as fallback
      if (email) {
        const emailSubSnapshot = await adminDb
          .collection('subscriptions')
          .where('email', '==', email)
          .where('status', 'in', ['active', 'trialing'])
          .limit(1)
          .get();

        if (emailSubSnapshot.empty) {
          return NextResponse.json(
            { error: 'No active subscription found' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'No active subscription found' },
          { status: 403 }
        );
      }
    }

    // Try to load guide HTML from private directory
    const guideHtmlPath = path.join(process.cwd(), 'private', 'guides', `${guideId}.html`);

    try {
      const html = await fs.readFile(guideHtmlPath, 'utf-8');
    // Debug log removed

      return NextResponse.json({
        html,
        placeholder: false,
      });
    } catch (fileError) {
    // Debug log removed

      // Return placeholder response
      return NextResponse.json({
        html: null,
        placeholder: true,
      });
    }
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to load guide content' },
      { status: 500 }
    );
  }
}
