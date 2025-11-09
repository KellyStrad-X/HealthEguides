import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    // Debug log removed

    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Debug log removed
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

    // Debug log removed

    if (!email) {
    // Debug log removed
      return NextResponse.json(
        { error: 'Email not found in token' },
        { status: 400 }
      );
    }

    // Find subscription by email (where userId might be empty or different)
    // Debug log removed

    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .where('email', '==', email)
      .where('status', 'in', ['active', 'trialing', 'past_due'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    // Debug log removed

    if (subscriptionsSnapshot.empty) {
    // Debug log removed

      // Debug: Check if there's any subscription with this email regardless of status
      const allSubscriptions = await adminDb
        .collection('subscriptions')
        .where('email', '==', email)
        .get();

    // Debug log removed

      if (!allSubscriptions.empty) {
        // Subscriptions found but none are active
        // Debug logging removed
      }

      return NextResponse.json(
        { error: 'No active subscription found for this email' },
        { status: 404 }
      );
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();

    // Debug log removed
      id: subscriptionDoc.id,
      currentUserId: subscriptionData.userId,
      email: subscriptionData.email,
      status: subscriptionData.status
    });

    // Check if subscription already linked to a different userId
    // Allow linking if the userId is currently set to the email (placeholder from checkout)
    if (subscriptionData.userId &&
        subscriptionData.userId !== userId &&
        subscriptionData.userId !== email) {
    // Debug log removed
      return NextResponse.json(
        { error: 'This subscription is already linked to another account' },
        { status: 409 }
      );
    }

    // Update subscription with userId if not already set
    if (!subscriptionData.userId || subscriptionData.userId === email) {
    // Debug log removed
      await subscriptionDoc.ref.update({
        userId,
        updatedAt: Timestamp.now(),
      });
    // Debug log removed
    } else {
    // Debug log removed
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully linked to account',
      subscriptionId: subscriptionDoc.id
    });

  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to link subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
