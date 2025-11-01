import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ensurePurchasesForSession } from '@/lib/purchase-service';

export async function POST(request: Request) {
  // Initialize Stripe at runtime (not build time)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    let session: Stripe.Checkout.Session;

    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      console.error('Stripe session retrieval failed:', stripeError);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        {
          pending: true,
          status: session.payment_status,
          message: 'Payment is still processing. Please try again in a moment.',
        },
        { status: 202 }
      );
    }

    const { purchases, created } = await ensurePurchasesForSession(session);

    if (purchases.length === 0) {
      return NextResponse.json(
        { error: 'No purchases found for this session' },
        { status: 404 }
      );
    }

    if (created) {
      // If purchases were created here (webhook hasn't run), send the email now.
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-purchase-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session.customer_email,
            purchases,
            sessionId,
          }),
        });
      } catch (emailError) {
        console.error('Deferred email send failed:', emailError);
      }
    }

    return NextResponse.json({ purchases });

  } catch (error) {
    console.error('Session lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve purchase information' },
      { status: 500 }
    );
  }
}
