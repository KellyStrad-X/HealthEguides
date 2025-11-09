import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { requireAdminSession } from '@/lib/session';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// GET - Fetch all subscriptions with user data
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminSession(request);
    if (authResult !== true) {
      return authResult;
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100); // Max 100 items
    const offset = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalSnapshot = await adminDb
      .collection('subscriptions')
      .count()
      .get();
    const totalItems = totalSnapshot.data().count;
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch subscriptions with pagination
    let query = adminDb
      .collection('subscriptions')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    // Apply offset if needed
    if (offset > 0) {
      const offsetSnapshot = await adminDb
        .collection('subscriptions')
        .orderBy('createdAt', 'desc')
        .limit(offset)
        .get();

      if (offsetSnapshot.docs.length > 0) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    const subscriptionsSnapshot = await query.get();

    // Collect all unique user IDs first
    const userIds = new Set<string>();
    subscriptionsSnapshot.docs.forEach(doc => {
      const userId = doc.data().userId;
      if (userId) userIds.add(userId);
    });

    // Batch fetch all users at once
    const userMap = new Map<string, any>();
    if (userIds.size > 0) {
      try {
        // Firebase Admin SDK supports batch user fetching
        const userResults = await adminAuth.getUsers(
          Array.from(userIds).map(uid => ({ uid }))
        );

        userResults.users.forEach(user => {
          userMap.set(user.uid, user);
        });
      } catch (error) {
    // Error log removed - TODO: Add proper error handling
      }
    }

    // Now map subscriptions with cached user data
    const subscriptions = subscriptionsSnapshot.docs.map(doc => {
      const data = doc.data();

      // Get cached user data
      let userName = 'Unknown';
      let userEmail = data.email || 'N/A';

      if (data.userId && userMap.has(data.userId)) {
        const userRecord = userMap.get(data.userId);
        userName = userRecord.displayName || userRecord.email?.split('@')[0] || 'Unknown';
        userEmail = userRecord.email || userEmail;
      }

      return {
        id: doc.id,
        userId: data.userId,
        userName,
        userEmail,
        status: data.status,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        stripeMode: data.stripeMode || 'unknown', // 'test', 'live', or 'unknown'
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
    });

    return NextResponse.json({
      subscriptions,
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
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// PUT - Update subscription (cancel, reactivate, change plan)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication with CSRF protection
    const authResult = await requireAdminSession(request, true);
    if (authResult !== true) {
      return authResult;
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
        { error: 'Stripe subscription ID not found', details: 'This subscription may not have been created in Stripe' },
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
            { error: 'Price ID not configured', details: `Missing ${newPlanInterval}ly price ID in environment variables` },
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
    // Error log removed - TODO: Add proper error handling

    // Provide more detailed error information
    let errorMessage = 'Failed to update subscription';
    let errorDetails = 'Unknown error';

    if (error instanceof Error) {
      errorDetails = error.message;

      // Check for common Stripe errors
      if (error.message.includes('No such subscription')) {
        errorMessage = 'Subscription not found in Stripe';
        errorDetails = 'This subscription may have been deleted or you are using the wrong Stripe mode (test/live)';
      } else if (error.message.includes('No such customer')) {
        errorMessage = 'Customer not found in Stripe';
        errorDetails = 'The Stripe customer associated with this subscription no longer exists';
      } else if (error.message.includes('Invalid API Key')) {
        errorMessage = 'Stripe API key error';
        errorDetails = 'Check that your Stripe secret key is correct and matches the mode (test/live)';
      } else if (error.message.includes('API key')) {
        errorMessage = 'Stripe authentication failed';
        errorDetails = 'There may be a mismatch between test/live mode keys and subscription data';
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}
