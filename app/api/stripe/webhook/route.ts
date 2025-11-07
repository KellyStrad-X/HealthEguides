import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

// This is required to receive raw body for Stripe signature verification
export const runtime = 'nodejs';

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

  const email = session.customer_email;

  if (!email) {
    console.error(`Session ${session.id} missing customer email; skipping.`);
    return;
  }

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
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
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

  // Type-safe access to subscription properties
  const sub = subscription as any; // Use 'any' to bypass strict type checking for Stripe properties

  // Safely convert timestamps - Firestore doesn't accept null dates
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
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    updatedAt: new Date(),
  };

  // Only add optional date fields if they have valid values
  if (sub.trial_start && typeof sub.trial_start === 'number') {
    subscriptionData.trialStart = new Date(sub.trial_start * 1000);
  }
  if (sub.trial_end && typeof sub.trial_end === 'number') {
    subscriptionData.trialEnd = new Date(sub.trial_end * 1000);
  }
  if (sub.canceled_at && typeof sub.canceled_at === 'number') {
    subscriptionData.canceledAt = new Date(sub.canceled_at * 1000);
  }

  subscriptionData.cancelReason = null;

  console.log('💾 Subscription data to save:', {
    userId: subscriptionData.userId,
    email: subscriptionData.email,
    status: subscriptionData.status,
    trialEnd: subscriptionData.trialEnd,
  });

  // Check if subscription already exists
  const existingSubQuery = await adminDb
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  if (existingSubQuery.empty) {
    // Create new subscription
    const docRef = await adminDb.collection('subscriptions').add({
      ...subscriptionData,
      createdAt: new Date(),
    });
    console.log('✅ Created new subscription record with ID:', docRef.id);
  } else {
    // Update existing subscription
    const docRef = existingSubQuery.docs[0].ref;
    await docRef.update(subscriptionData);
    console.log('✅ Updated existing subscription record:', existingSubQuery.docs[0].id);
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
      canceledAt: new Date(),
      updatedAt: new Date(),
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

  const inv = invoice as any; // Type assertion for Stripe properties
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
      updatedAt: new Date(),
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

  const inv = invoice as any; // Type assertion for Stripe properties
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
      updatedAt: new Date(),
    })
  );

  await Promise.all(updatePromises);
  console.log('✅ Marked subscription as active after payment');
}
