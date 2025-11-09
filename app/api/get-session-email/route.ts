import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Return the customer email
    return NextResponse.json({
      email: session.customer_details?.email || session.customer_email || null,
    });
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to retrieve session email' },
      { status: 500 }
    );
  }
}
