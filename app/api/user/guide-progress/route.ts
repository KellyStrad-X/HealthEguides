import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';

// GET - Fetch user's guide progress
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch all progress records for this user
    const progressSnapshot = await db
      .collection('user_guide_progress')
      .where('userId', '==', userId)
      .get();

    const progress = progressSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(progress);
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to fetch guide progress' },
      { status: 500 }
    );
  }
}

// POST - Update guide progress (mark as read/unread)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, guideId, isRead } = body;

    if (!userId || !guideId) {
      return NextResponse.json(
        { error: 'User ID and Guide ID are required' },
        { status: 400 }
      );
    }

    // Check if progress record exists
    const existingSnapshot = await db
      .collection('user_guide_progress')
      .where('userId', '==', userId)
      .where('guideId', '==', guideId)
      .limit(1)
      .get();

    const now = new Date();

    if (existingSnapshot.empty) {
      // Create new progress record
      await db.collection('user_guide_progress').add({
        userId,
        guideId,
        isRead: isRead || false,
        lastViewed: now,
        createdAt: now,
      });
    } else {
      // Update existing record
      const docId = existingSnapshot.docs[0].id;
      await db.collection('user_guide_progress').doc(docId).update({
        isRead: isRead !== undefined ? isRead : true,
        lastViewed: now,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to update guide progress' },
      { status: 500 }
    );
  }
}
