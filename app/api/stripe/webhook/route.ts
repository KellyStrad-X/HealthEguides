import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { generateAccessToken } from '@/lib/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// This is required to receive raw body for Stripe signature verification
export const runtime = 'nodejs';

export async function POST(request: Request) {
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

  const guideIds = JSON.parse(session.metadata?.guideIds || '[]') as string[];
  const email = session.customer_email;

  if (!email || guideIds.length === 0) {
    console.error('Missing email or guide IDs in session metadata');
    return;
  }

  // Create a purchase record for each guide
  const purchasePromises = guideIds.map(async (guideId) => {
    const accessToken = generateAccessToken();

    const purchaseData = {
      email,
      guideId,
      guideName: session.metadata?.guideTitles || 'Health Guide',
      accessToken,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      isBundle: session.metadata?.isBundle === 'true',
      purchasedAt: new Date(),
      lastAccessedAt: null,
      accessCount: 0,
      status: 'active',
    };

    // Store in Firebase
    const docRef = await adminDb.collection('purchases').add(purchaseData);

    console.log(`Purchase recorded: ${docRef.id} for guide ${guideId}`);

    return { guideId, accessToken };
  });

  const purchases = await Promise.all(purchasePromises);

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
