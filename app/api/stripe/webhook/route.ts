import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// This is required to receive raw body for Stripe signature verification
export const runtime = 'nodejs';

/**
 * Safely convert a Unix timestamp (seconds) to a Firestore Timestamp
 * Returns null if the timestamp is invalid
 */
function safeTimestampFromUnix(unixTimestamp: number | null | undefined): Timestamp | null {
  if (!unixTimestamp || typeof unixTimestamp !== 'number' || isNaN(unixTimestamp)) {
    return null;
  }

  try {
    // Firestore Timestamp expects seconds and nanoseconds
    return Timestamp.fromMillis(unixTimestamp * 1000);
  } catch (error) {
    // TODO: Add proper error logging
    return null;
  }
}

export async function POST(request: Request) {
  // Initialize Stripe at runtime (not build time)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    // TODO: Add proper error logging
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // TODO: Add proper error logging

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout - create subscription and send email
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe) {
  // Try multiple sources for email
  let email = session.customer_email || session.customer_details?.email;

  // If still no email, try to get it from the customer object
  if (!email && session.customer) {
    try {
      const customer = await stripe.customers.retrieve(session.customer as string);
      email = (customer as Stripe.Customer).email || undefined;
    } catch (err) {
      // TODO: Add proper error logging
    }
  }

  if (!email) {
    // TODO: Add proper error logging
    return;
  }

  // Handle subscription checkout
  if (session.mode === 'subscription') {
    if (!session.subscription) {
      // TODO: Add proper error logging
      return;
    }

    // Fetch the full subscription object with expanded fields
    let subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
        {
          expand: ['items.data.price']
        }
      );
    } catch (retrieveError) {
      // TODO: Add proper error logging
      throw retrieveError;
    }

    // Create or update subscription record
    try {
      await handleSubscriptionUpdate(subscription);
    } catch (updateError) {
      // TODO: Add proper error logging
      throw updateError;
    }

    // Send welcome email (optional - don't fail if it errors)
    try {
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-subscription-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            subscriptionId: subscription.id,
            trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null,
          }),
        });
      }
    } catch (emailError) {
      // Email sending is non-fatal, continue
    }

    return;
  }
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Skip canceled subscriptions - they should be handled by handleSubscriptionDeleted
  if (subscription.status === 'canceled') {
    return;
  }

  const customerId = subscription.customer as string;
  const email = subscription.metadata?.email || '';
  const userId = subscription.metadata?.userId || '';

  if (!email && !userId) {
    const errorMsg = `Subscription ${subscription.id} missing both email and userId in metadata. Metadata: ${JSON.stringify(subscription.metadata)}`;
    // TODO: Add proper error logging
    throw new Error(errorMsg);
  }

  // Get price details
  const priceId = subscription.items.data[0]?.price.id;
  const amount = subscription.items.data[0]?.price.unit_amount || 0;
  const interval = subscription.items.data[0]?.price.recurring?.interval || 'month';

  // Access subscription properties - Stripe API returns snake_case at runtime
  const sub = subscription as any;

  // For trial subscriptions, use trial_start/trial_end as the current period
  // For active subscriptions, use current_period_start/current_period_end
  let currentPeriodStart: Timestamp | null;
  let currentPeriodEnd: Timestamp | null;

  if (subscription.status === 'trialing') {
    currentPeriodStart = safeTimestampFromUnix(sub.trial_start || sub.start_date);
    currentPeriodEnd = safeTimestampFromUnix(sub.trial_end || sub.billing_cycle_anchor);
  } else {
    currentPeriodStart = safeTimestampFromUnix(sub.current_period_start);
    currentPeriodEnd = safeTimestampFromUnix(sub.current_period_end);
  }

  if (!currentPeriodStart || !currentPeriodEnd) {
    // TODO: Add proper error logging
    throw new Error(`Invalid subscription period timestamps: start=${currentPeriodStart}, end=${currentPeriodEnd}, status=${subscription.status}`);
  }

  // Determine if this is a test or live subscription based on subscription ID
  const isTestMode = subscription.id.startsWith('sub_') && subscription.livemode === false;

  // Build subscription data with validated timestamps
  const subscriptionData: any = {
    userId: userId || email, // Use email as fallback userId if not provided
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    status: subscription.status,
    interval,
    amount,
    currency: subscription.currency,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    stripeMode: isTestMode ? 'test' : 'live', // Track whether this is test or live
    updatedAt: Timestamp.now(),
  };

  // Only add optional date fields if they have valid values
  const trialStart = safeTimestampFromUnix(sub.trial_start);
  if (trialStart) {
    subscriptionData.trialStart = trialStart;
  }

  const trialEnd = safeTimestampFromUnix(sub.trial_end);
  if (trialEnd) {
    subscriptionData.trialEnd = trialEnd;
  }

  const canceledAt = safeTimestampFromUnix(sub.canceled_at);
  if (canceledAt) {
    subscriptionData.canceledAt = canceledAt;
  }

  subscriptionData.cancelReason = null;

  // Check if subscription already exists
  const existingSubQuery = await adminDb
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  if (existingSubQuery.empty) {
    // Create new subscription
    try {
      const docRef = await adminDb.collection('subscriptions').add({
        ...subscriptionData,
        createdAt: Timestamp.now(),
      });
    } catch (createError) {
      // TODO: Add proper error logging
      throw createError;
    }
  } else {
    // Update existing subscription
    const docRef = existingSubQuery.docs[0].ref;
    try {
      await docRef.update(subscriptionData);
    } catch (updateError) {
      // TODO: Add proper error logging
      throw updateError;
    }
  }
}

/**
 * Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Processing subscription deletion

  const subscriptionsSnapshot = await adminDb
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscription.id)
    .get();

  if (subscriptionsSnapshot.empty) {
  // Debug log removed
    return;
  }

  const updatePromises = subscriptionsSnapshot.docs.map(doc =>
    doc.ref.update({
      status: 'canceled',
      canceledAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  );

  await Promise.all(updatePromises);
  // Debug log removed
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Debug log removed

  const inv = invoice as any;
  const subscriptionId = inv.subscription as string;

  if (!subscriptionId) {
  // Debug log removed
    return;
  }

  // Update subscription status to past_due
  const subscriptionsSnapshot = await adminDb
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscriptionId)
    .get();

  if (subscriptionsSnapshot.empty) {
  // Debug log removed
    return;
  }

  const updatePromises = subscriptionsSnapshot.docs.map(doc =>
    doc.ref.update({
      status: 'past_due',
      updatedAt: Timestamp.now(),
    })
  );

  await Promise.all(updatePromises);
  // Debug log removed

  // TODO: Send payment failed email to customer
  const customerEmail = inv.customer_email;
  if (customerEmail) {
  // Debug log removed
  }
}

/**
 * Handle successful payment (renewal)
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Debug log removed

  const inv = invoice as any;
  const subscriptionId = inv.subscription as string;

  if (!subscriptionId) {
  // Debug log removed
    return;
  }

  // Update subscription status to active (in case it was past_due)
  const subscriptionsSnapshot = await adminDb
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscriptionId)
    .get();

  if (subscriptionsSnapshot.empty) {
  // Debug log removed
    return;
  }

  const updatePromises = subscriptionsSnapshot.docs.map(doc =>
    doc.ref.update({
      status: 'active',
      updatedAt: Timestamp.now(),
    })
  );

  await Promise.all(updatePromises);
  // Debug log removed
}
