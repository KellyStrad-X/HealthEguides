import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Debug log removed

  try {
    const body = await request.json();
    const { plan, email, userId } = body;

    // Debug log removed
    // Debug log removed
    // Debug log removed

    // Validate inputs
    if (!plan || !['monthly', 'annual'].includes(plan)) {
      return NextResponse.json(
        { error: 'Valid plan type is required (monthly or annual)' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Determine price ID from plan type
    const priceId = plan === 'monthly'
      ? process.env.STRIPE_MONTHLY_PRICE_ID
      : process.env.STRIPE_ANNUAL_PRICE_ID;

    if (!priceId) {
    // Error log removed - TODO: Add proper error handling
      return NextResponse.json(
        { error: 'Subscription plan not configured' },
        { status: 500 }
      );
    }

    // Debug log removed

    // Prepare metadata
    const metadata: Record<string, string> = {
      type: 'subscription',
      email,
      interval: plan === 'monthly' ? 'month' : 'year',
    };

    if (userId) {
      metadata.userId = userId;
    }

    // Debug log removed

    // Get base URL with fallback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const successUrl = `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/catalog`;

    // Debug log removed
    // Debug log removed
    // Debug log removed

    // Create Stripe Checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata,

      // 7-day free trial
      subscription_data: {
        trial_period_days: 7,
        metadata,
      },

      // Success and cancel URLs
      success_url: successUrl,
      cancel_url: cancelUrl,

      // Allow promotion codes
      allow_promotion_codes: true,

      // Collect billing address for tax purposes (optional but recommended)
      billing_address_collection: 'auto',
    });

    // Debug log removed
    // Debug log removed
    // Debug log removed

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create subscription checkout session'
      },
      { status: 500 }
    );
  }
}
