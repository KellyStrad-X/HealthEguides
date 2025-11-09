import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(request: Request) {
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

    // Get subscription from Firestore
    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing', 'past_due'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();

    // Convert Firestore timestamps to ISO strings
    const subscription = {
      id: subscriptionDoc.id,
      ...subscriptionData,
      trialStart: subscriptionData.trialStart?.toDate?.().toISOString() || subscriptionData.trialStart,
      trialEnd: subscriptionData.trialEnd?.toDate?.().toISOString() || subscriptionData.trialEnd,
      currentPeriodStart: subscriptionData.currentPeriodStart?.toDate?.().toISOString() || subscriptionData.currentPeriodStart,
      currentPeriodEnd: subscriptionData.currentPeriodEnd?.toDate?.().toISOString() || subscriptionData.currentPeriodEnd,
      canceledAt: subscriptionData.canceledAt?.toDate?.().toISOString() || subscriptionData.canceledAt,
      createdAt: subscriptionData.createdAt?.toDate?.().toISOString() || subscriptionData.createdAt,
      updatedAt: subscriptionData.updatedAt?.toDate?.().toISOString() || subscriptionData.updatedAt,
    };

    return NextResponse.json({ subscription });

  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
