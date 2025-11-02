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

    // Fetch the payment intent from Stripe with charges expanded
    const paymentIntent: any = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['charges.data.refunds']
    });

    // Check if there are any refunds
    const hasRefunds = paymentIntent?.charges?.data?.[0]?.refunds?.data?.length > 0;
    const isFullyRefunded = paymentIntent?.charges?.data?.[0]?.refunded || false;
    const refundAmount = paymentIntent?.charges?.data?.[0]?.amount_refunded || 0;

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
      status: paymentIntent.status,
    });
  } catch (error: any) {
    console.error('Check refund status error:', error);

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
