import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

    // Get subscription from Firestore
    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing'])
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
    const stripeSubscriptionId = subscriptionData.stripeSubscriptionId;

    // Cancel subscription in Stripe (at period end)
    const canceledSubscription: Stripe.Subscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // Update Firestore
    await subscriptionDoc.ref.update({
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    });

    console.log('✅ Subscription canceled:', stripeSubscriptionId);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      periodEnd: new Date((canceledSubscription as any).current_period_end * 1000).toISOString(),
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
