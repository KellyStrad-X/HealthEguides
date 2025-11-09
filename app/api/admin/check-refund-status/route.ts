import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  // Verify admin authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paymentIntentId, sessionId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Fetch the payment intent to get the charge ID
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Get the latest charge ID
    const chargeId = typeof paymentIntent.latest_charge === 'string'
      ? paymentIntent.latest_charge
      : paymentIntent.latest_charge?.id;

    if (!chargeId) {
      return NextResponse.json(
        { error: 'No charge found for this payment intent' },
        { status: 404 }
      );
    }

    // Fetch the charge directly (this is the most reliable way to check refunds)
    const charge = await stripe.charges.retrieve(chargeId);

    // Check if there are any refunds
    const hasRefunds = (charge.amount_refunded || 0) > 0;
    const isFullyRefunded = charge.refunded || false;
    const refundAmount = charge.amount_refunded || 0;

    if (hasRefunds || isFullyRefunded) {
      // Update Firestore to match Stripe status
      const purchasesSnapshot = await adminDb
        .collection('purchases')
        .where('stripePaymentIntentId', '==', paymentIntentId)
        .get();

      if (!purchasesSnapshot.empty) {
        const updatePromises = purchasesSnapshot.docs.map(doc =>
          doc.ref.update({
            status: 'refunded',
            refundedAt: new Date(),
          })
        );

        await Promise.all(updatePromises);

        return NextResponse.json({
          wasRefunded: true,
          updated: true,
          refundAmount,
          purchaseCount: purchasesSnapshot.size,
        });
      }
    }

    return NextResponse.json({
      wasRefunded: false,
      updated: false,
      paymentIntentStatus: paymentIntent.status,
      chargeStatus: charge.status,
    });
  } catch (error: any) {
    // Error log removed - TODO: Add proper error handling

    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid payment intent ID or not found in Stripe' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check refund status. Please try again.' },
      { status: 500 }
    );
  }
}
