import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get guideId from query params
    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get('guideId');

    if (!guideId) {
      return NextResponse.json({ error: 'Guide ID is required' }, { status: 400 });
    }

    // Check if favorited
    const favoriteSnapshot = await adminDb
      .collection('favorites')
      .where('userId', '==', userId)
      .where('guideId', '==', guideId)
      .limit(1)
      .get();

    return NextResponse.json({ isFavorited: !favoriteSnapshot.empty });
  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}
