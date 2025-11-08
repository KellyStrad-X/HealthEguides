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
    console.error('Error converting timestamp:', unixTimestamp, error);
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
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    console.log('🎯 Webhook event type:', event.type);
    console.log('📊 Event ID:', event.id);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Handling checkout.session.completed');
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        console.log('📝 Handling subscription event:', event.type);
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
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout - create subscription and send email
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe) {
  console.log('Processing checkout:', session.id);
  console.log('Mode:', session.mode);

  // Try multiple sources for email
  let email = session.customer_email || session.customer_details?.email;

  // If still no email, try to get it from the customer object
  if (!email && session.customer) {
    try {
      const customer = await stripe.customers.retrieve(session.customer as string);
      email = (customer as Stripe.Customer).email || undefined;
    } catch (err) {
      console.error('Failed to retrieve customer email:', err);
    }
  }

  if (!email) {
    console.error(`Session ${session.id} missing customer email after all attempts; skipping.`);
    return;
  }

  console.log('Email retrieved:', email);

  // Handle subscription checkout
  if (session.mode === 'subscription') {
    console.log('📝 Subscription checkout detected');

    if (!session.subscription) {
      console.error(`Session ${session.id} missing subscription ID`);
      return;
    }

    // Fetch the full subscription object
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Create or update subscription record
    await handleSubscriptionUpdate(subscription);

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

        if (emailResponse.ok) {
          console.log('✅ Subscription welcome email sent to:', email);
        } else {
          console.log('⚠️ Email API returned error:', emailResponse.status);
        }
      } else {
        console.log('⚠️ NEXT_PUBLIC_BASE_URL not set, skipping welcome email');
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send subscription email (non-fatal):', emailError);
    }

    return;
  }

  console.log(`Unhandled checkout mode: ${session.mode}`);
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('🔄 Processing subscription update:', subscription.id);
  console.log('📦 Full subscription object:', JSON.stringify(subscription, null, 2));

  const customerId = subscription.customer as string;
  const email = subscription.metadata?.email || '';
  const userId = subscription.metadata?.userId || '';

  console.log('📧 Subscription metadata:', { email, userId, customerId });

  if (!email && !userId) {
    console.error('❌ Subscription missing both email and userId in metadata');
    return;
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
    console.log('⏰ Trialing subscription - using trial dates as current period');
    currentPeriodStart = safeTimestampFromUnix(sub.trial_start || sub.start_date);
    currentPeriodEnd = safeTimestampFromUnix(sub.trial_end || sub.billing_cycle_anchor);
  } else {
    console.log('💳 Active/other subscription - using current period dates');
    currentPeriodStart = safeTimestampFromUnix(sub.current_period_start);
    currentPeriodEnd = safeTimestampFromUnix(sub.current_period_end);
  }

  if (!currentPeriodStart || !currentPeriodEnd) {
    console.error('❌ Invalid period timestamps:', {
      status: subscription.status,
      trial_start: sub.trial_start,
      trial_end: sub.trial_end,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end
    });
    throw new Error('Invalid subscription period timestamps');
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

  console.log('💾 Subscription data to save:', {
    userId: subscriptionData.userId,
    email: subscriptionData.email,
    status: subscriptionData.status,
    trialEnd: subscriptionData.trialEnd,
  });

  // Check if subscription already exists
  console.log('🔍 Checking for existing subscription in Firestore...');
  const existingSubQuery = await adminDb
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  console.log('📊 Existing subscription query result:', {
    empty: existingSubQuery.empty,
    size: existingSubQuery.size
  });

  if (existingSubQuery.empty) {
    // Create new subscription
    console.log('➕ Creating new subscription document in Firestore...');
    try {
      const docRef = await adminDb.collection('subscriptions').add({
        ...subscriptionData,
        createdAt: Timestamp.now(),
      });
      console.log('✅ Created new subscription record with ID:', docRef.id);
      console.log('📝 Subscription data saved:', {
        docId: docRef.id,
        userId: subscriptionData.userId,
        email: subscriptionData.email,
        status: subscriptionData.status
      });
    } catch (createError) {
      console.error('❌ FAILED to create subscription document:', createError);
      throw createError;
    }
  } else {
    // Update existing subscription
    const docRef = existingSubQuery.docs[0].ref;
    console.log('🔄 Updating existing subscription:', existingSubQuery.docs[0].id);
    try {
      await docRef.update(subscriptionData);
      console.log('✅ Updated existing subscription record:', existingSubQuery.docs[0].id);
    } catch (updateError) {
      console.error('❌ FAILED to update subscription document:', updateError);
      throw updateError;
    }
  }
}

/**
 * Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deletion:', subscription.id);

  const subscriptionsSnapshot = await adminDb
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscription.id)
    .get();

  if (subscriptionsSnapshot.empty) {
    console.log('No subscription found for:', subscription.id);
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
  console.log('✅ Marked subscription as canceled');
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing payment failure for invoice:', invoice.id);

  const inv = invoice as any;
  const subscriptionId = inv.subscription as string;

  if (!subscriptionId) {
    console.log('Invoice not associated with subscription');
    return;
  }

  // Update subscription status to past_due
  const subscriptionsSnapshot = await adminDb
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscriptionId)
    .get();

  if (subscriptionsSnapshot.empty) {
    console.log('No subscription found for:', subscriptionId);
    return;
  }

  const updatePromises = subscriptionsSnapshot.docs.map(doc =>
    doc.ref.update({
      status: 'past_due',
      updatedAt: Timestamp.now(),
    })
  );

  await Promise.all(updatePromises);
  console.log('✅ Marked subscription as past_due');

  // TODO: Send payment failed email to customer
  const customerEmail = inv.customer_email;
  if (customerEmail) {
    console.log('TODO: Send payment failed email to:', customerEmail);
  }
}

/**
 * Handle successful payment (renewal)
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing successful payment for invoice:', invoice.id);

  const inv = invoice as any;
  const subscriptionId = inv.subscription as string;

  if (!subscriptionId) {
    console.log('Invoice not associated with subscription');
    return;
  }

  // Update subscription status to active (in case it was past_due)
  const subscriptionsSnapshot = await adminDb
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscriptionId)
    .get();

  if (subscriptionsSnapshot.empty) {
    console.log('No subscription found for:', subscriptionId);
    return;
  }

  const updatePromises = subscriptionsSnapshot.docs.map(doc =>
    doc.ref.update({
      status: 'active',
      updatedAt: Timestamp.now(),
    })
  );

  await Promise.all(updatePromises);
  console.log('✅ Marked subscription as active after payment');
}
