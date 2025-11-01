import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { ensurePurchasesForSession } from '@/lib/purchase-service';
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
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
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
 * Handle successful checkout - create purchase records and send email
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout:', session.id);

  const email = session.customer_email;

  if (!email) {
    console.error(`Session ${session.id} missing customer email; skipping purchase creation.`);
    return;
  }

  if (session.payment_status !== 'paid') {
    console.log(`Session ${session.id} payment status: ${session.payment_status}. Skipping purchase creation.`);
    return;
  }

  const { purchases, created } = await ensurePurchasesForSession(session);

  if (!purchases.length) {
    console.error(`No purchases generated for session ${session.id}`);
    return;
  }

  if (!created) {
    console.log(`Purchases already existed for session ${session.id}, skipping email resend.`);
    return;
  }

  // Send email with access links
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-purchase-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        purchases,
        sessionId: session.id,
      }),
    });
    console.log('Purchase email sent to:', email);
  } catch (emailError) {
    console.error('Failed to send purchase email:', emailError);
    // Don't throw - purchase is already recorded, email can be resent manually
  }
}

/**
 * Handle refunds - revoke access
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('Processing refund for charge:', charge.id);

  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    console.error('No payment intent ID in charge');
    return;
  }

  // Find all purchases associated with this payment intent
  const purchasesSnapshot = await adminDb
    .collection('purchases')
    .where('stripePaymentIntentId', '==', paymentIntentId)
    .get();

  if (purchasesSnapshot.empty) {
    console.log('No purchases found for payment intent:', paymentIntentId);
    return;
  }

  // Update all associated purchases to refunded status
  const updatePromises = purchasesSnapshot.docs.map(doc =>
    doc.ref.update({
      status: 'refunded',
      refundedAt: new Date(),
    })
  );

  await Promise.all(updatePromises);

  console.log(`Revoked access for ${purchasesSnapshot.size} purchases`);
}
