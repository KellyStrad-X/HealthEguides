import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: Request) {
  try {
    // Initialize Firebase Admin by accessing adminDb
    const _ = adminDb;

    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get all favorites for this user
    const favoritesSnapshot = await adminDb
      .collection('favorites')
      .where('userId', '==', userId)
      .get();

    const favorites = favoritesSnapshot.docs.map(doc => ({
      id: doc.id,
      guideId: doc.data().guideId,
      createdAt: doc.data().createdAt,
    }));

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Initialize Firebase Admin by accessing adminDb
    const _ = adminDb;

    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
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
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Initialize Firebase Admin by accessing adminDb
    const _ = adminDb;

    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
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
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
