import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: Request) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = decodedToken.uid;

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100); // Max 100 items

    // Get total count for pagination metadata
    const totalSnapshot = await adminDb
      .collection('favorites')
      .where('userId', '==', userId)
      .count()
      .get();
    const totalItems = totalSnapshot.data().count;
    const totalPages = Math.ceil(totalItems / limit);

    // Get favorites with pagination
    const favoritesSnapshot = await adminDb
      .collection('favorites')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const favorites = favoritesSnapshot.docs.map(doc => ({
      id: doc.id,
      guideId: doc.data().guideId,
      createdAt: doc.data().createdAt,
    }));

    return NextResponse.json({
      favorites,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    // Error handling: TODO - Add proper error logging
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { guideId } = await request.json();

    if (!guideId) {
      return NextResponse.json({ error: 'Guide ID is required' }, { status: 400 });
    }

    // Check if already favorited
    const existingFavorite = await adminDb
      .collection('favorites')
      .where('userId', '==', userId)
      .where('guideId', '==', guideId)
      .limit(1)
      .get();

    if (!existingFavorite.empty) {
      return NextResponse.json({ message: 'Already favorited' }, { status: 200 });
    }

    // Add favorite
    await adminDb.collection('favorites').add({
      userId,
      guideId,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { guideId } = await request.json();

    if (!guideId) {
      return NextResponse.json({ error: 'Guide ID is required' }, { status: 400 });
    }

    // Find and delete favorite
    const favoriteSnapshot = await adminDb
      .collection('favorites')
      .where('userId', '==', userId)
      .where('guideId', '==', guideId)
      .limit(1)
      .get();

    if (favoriteSnapshot.empty) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }

    await favoriteSnapshot.docs[0].ref.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
