import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// GET - Fetch all subscriptions with user data
export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const password = request.headers.get('X-Admin-Password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all subscriptions from Firestore
    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .orderBy('createdAt', 'desc')
      .get();

    const subscriptions = await Promise.all(
      subscriptionsSnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Fetch user data from Firebase Auth
        let userName = 'Unknown';
        let userEmail = data.email || 'N/A';

        try {
          if (data.userId) {
            const userRecord = await adminAuth.getUser(data.userId);
            userName = userRecord.displayName || userRecord.email?.split('@')[0] || 'Unknown';
            userEmail = userRecord.email || userEmail;
          }
        } catch (error) {
          console.error(`Error fetching user ${data.userId}:`, error);
        }

        return {
          id: doc.id,
          userId: data.userId,
          userName,
          userEmail,
          status: data.status,
          stripeSubscriptionId: data.stripeSubscriptionId,
          stripeCustomerId: data.stripeCustomerId,
          planInterval: data.planInterval || 'month', // 'month' or 'year'
          planAmount: data.planAmount || (data.planInterval === 'year' ? 5000 : 500), // in cents
          trialStart: data.trialStart?.toDate?.().toISOString() || data.trialStart || null,
          trialEnd: data.trialEnd?.toDate?.().toISOString() || data.trialEnd || null,
          currentPeriodStart: data.currentPeriodStart?.toDate?.().toISOString() || data.currentPeriodStart || null,
          currentPeriodEnd: data.currentPeriodEnd?.toDate?.().toISOString() || data.currentPeriodEnd || null,
          canceledAt: data.canceledAt?.toDate?.().toISOString() || data.canceledAt || null,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
          updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
        };
      })
    );

    return NextResponse.json({ subscriptions });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// PUT - Update subscription (cancel, reactivate, change plan)
export async function PUT(request: Request) {
  try {
    // Verify admin authentication
    const password = request.headers.get('X-Admin-Password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, action, newPlanInterval } = await request.json();

    if (!subscriptionId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get subscription from Firestore
    const subscriptionDoc = await adminDb
      .collection('subscriptions')
      .doc(subscriptionId)
      .get();

    if (!subscriptionDoc.exists) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const subscriptionData = subscriptionDoc.data();
    const stripeSubscriptionId = subscriptionData?.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Stripe subscription ID not found' },
        { status: 404 }
      );
    }

    let result;

    switch (action) {
      case 'cancel':
        // Cancel the subscription in Stripe
        result = await stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: true,
        });

        // Update Firestore
        await adminDb.collection('subscriptions').doc(subscriptionId).update({
          cancelAtPeriodEnd: true,
          updatedAt: new Date(),
        });
        break;

      case 'reactivate':
        // Reactivate a canceled subscription
        result = await stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: false,
        });

        // Update Firestore
        await adminDb.collection('subscriptions').doc(subscriptionId).update({
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        });
        break;

      case 'cancel_immediately':
        // Cancel the subscription immediately in Stripe
        result = await stripe.subscriptions.cancel(stripeSubscriptionId);

        // Update Firestore
        await adminDb.collection('subscriptions').doc(subscriptionId).update({
          status: 'canceled',
          canceledAt: new Date(),
          updatedAt: new Date(),
        });
        break;

      case 'change_plan':
        if (!newPlanInterval || !['month', 'year'].includes(newPlanInterval)) {
          return NextResponse.json(
            { error: 'Invalid plan interval' },
            { status: 400 }
          );
        }

        // Get the Stripe subscription to find the price ID
        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const currentItem = stripeSubscription.items.data[0];

        // Determine new price ID based on interval
        const newPriceId = newPlanInterval === 'year'
          ? process.env.STRIPE_YEARLY_PRICE_ID
          : process.env.STRIPE_MONTHLY_PRICE_ID;

        if (!newPriceId) {
          return NextResponse.json(
            { error: 'Price ID not configured' },
            { status: 500 }
          );
        }

        // Update the subscription in Stripe
        result = await stripe.subscriptions.update(stripeSubscriptionId, {
          items: [{
            id: currentItem.id,
            price: newPriceId,
          }],
          proration_behavior: 'create_prorations',
        });

        // Update Firestore
        await adminDb.collection('subscriptions').doc(subscriptionId).update({
          planInterval: newPlanInterval,
          planAmount: newPlanInterval === 'year' ? 5000 : 500,
          updatedAt: new Date(),
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Subscription ${action} successful`,
      subscription: result
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
