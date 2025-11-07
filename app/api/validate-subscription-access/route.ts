import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: Request) {
  try {
    const { userId, email, guideId } = await request.json();

    console.log('🔍 Validating subscription access:', { userId, email, guideId });

    // Need at least userId or email
    if (!userId && !email) {
      return NextResponse.json(
        { hasAccess: false, reason: 'No user identification provided' },
        { status: 400 }
      );
    }

    // If userId provided, verify it's valid
    let userEmail = email;
    if (userId && !userEmail) {
      try {
        const userRecord = await getAuth().getUser(userId);
        userEmail = userRecord.email || '';
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    // Check for active subscription by userId
    let subscriptionQuery = adminDb.collection('subscriptions');

    if (userId) {
      subscriptionQuery = subscriptionQuery.where('userId', '==', userId) as any;
    } else if (userEmail) {
      subscriptionQuery = subscriptionQuery.where('email', '==', userEmail) as any;
    }

    const subscriptionsSnapshot = await (subscriptionQuery as any)
      .where('status', 'in', ['active', 'trialing'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (!subscriptionsSnapshot.empty) {
      const subscription = subscriptionsSnapshot.docs[0].data();

      // Check if subscription is still valid (not expired)
      const currentPeriodEnd = subscription.currentPeriodEnd?.toDate?.() || new Date(subscription.currentPeriodEnd);
      const now = new Date();

      if (currentPeriodEnd > now) {
        console.log('✅ Access granted via active subscription');
        return NextResponse.json({
          hasAccess: true,
          accessType: 'subscription',
          subscriptionStatus: subscription.status,
          validUntil: currentPeriodEnd.toISOString(),
        });
      }
    }

    // Fallback: Check for legacy token-based purchase (for existing customers)
    if (guideId && userEmail) {
      const purchasesSnapshot = await adminDb
        .collection('purchases')
        .where('email', '==', userEmail)
        .where('guideId', '==', guideId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      if (!purchasesSnapshot.empty) {
        console.log('✅ Access granted via legacy purchase');
        return NextResponse.json({
          hasAccess: true,
          accessType: 'legacy_purchase',
        });
      }
    }

    console.log('❌ No valid subscription or purchase found');
    return NextResponse.json({
      hasAccess: false,
      reason: 'No active subscription found',
    });

  } catch (error) {
    console.error('Access validation error:', error);
    return NextResponse.json(
      { hasAccess: false, reason: 'Validation failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
