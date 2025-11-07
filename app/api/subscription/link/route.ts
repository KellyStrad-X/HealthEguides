import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

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
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found in token' },
        { status: 400 }
      );
    }

    // Find subscription by email (where userId might be empty or different)
    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .where('email', '==', email)
      .where('status', 'in', ['active', 'trialing', 'past_due'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      return NextResponse.json(
        { error: 'No active subscription found for this email' },
        { status: 404 }
      );
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();

    // Check if subscription already linked to a different userId
    if (subscriptionData.userId && subscriptionData.userId !== userId) {
      return NextResponse.json(
        { error: 'This subscription is already linked to another account' },
        { status: 409 }
      );
    }

    // Update subscription with userId if not already set
    if (!subscriptionData.userId) {
      await subscriptionDoc.ref.update({
        userId,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully linked to account',
      subscriptionId: subscriptionDoc.id
    });

  } catch (error) {
    console.error('Error linking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to link subscription' },
      { status: 500 }
    );
  }
}
