import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: Request) {
  try {
    console.log('🔗 Subscription link API called');

    // Initialize Firebase Admin by accessing adminDb (triggers lazy initialization)
    // This must happen before calling getAuth()
    const _ = adminDb;

    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header');
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

    console.log('✅ Token verified:', { userId, email });

    if (!email) {
      console.log('❌ No email in token');
      return NextResponse.json(
        { error: 'Email not found in token' },
        { status: 400 }
      );
    }

    // Find subscription by email (where userId might be empty or different)
    console.log('🔍 Searching for subscription with email:', email);

    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .where('email', '==', email)
      .where('status', 'in', ['active', 'trialing', 'past_due'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    console.log('📊 Found subscriptions:', subscriptionsSnapshot.size);

    if (subscriptionsSnapshot.empty) {
      console.log('❌ No active subscription found for email:', email);

      // Debug: Check if there's any subscription with this email regardless of status
      const allSubscriptions = await adminDb
        .collection('subscriptions')
        .where('email', '==', email)
        .get();

      console.log('📊 Total subscriptions for this email (any status):', allSubscriptions.size);

      if (!allSubscriptions.empty) {
        allSubscriptions.docs.forEach(doc => {
          const data = doc.data();
          console.log('Found subscription:', {
            id: doc.id,
            status: data.status,
            email: data.email,
            userId: data.userId,
            createdAt: data.createdAt
          });
        });
      }

      return NextResponse.json(
        { error: 'No active subscription found for this email' },
        { status: 404 }
      );
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();

    console.log('✅ Found subscription:', {
      id: subscriptionDoc.id,
      currentUserId: subscriptionData.userId,
      email: subscriptionData.email,
      status: subscriptionData.status
    });

    // Check if subscription already linked to a different userId
    if (subscriptionData.userId && subscriptionData.userId !== userId) {
      console.log('❌ Subscription already linked to different user:', subscriptionData.userId);
      return NextResponse.json(
        { error: 'This subscription is already linked to another account' },
        { status: 409 }
      );
    }

    // Update subscription with userId if not already set
    if (!subscriptionData.userId || subscriptionData.userId === email) {
      console.log('🔄 Updating subscription with userId:', userId);
      await subscriptionDoc.ref.update({
        userId,
        updatedAt: new Date(),
      });
      console.log('✅ Subscription updated successfully');
    } else {
      console.log('ℹ️ Subscription already has correct userId');
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully linked to account',
      subscriptionId: subscriptionDoc.id
    });

  } catch (error) {
    console.error('❌ Error linking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to link subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
