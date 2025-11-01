import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { guides } from '@/lib/guides';
import { getBundlePrice } from '@/lib/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  // Debug logging
  console.log('🔍 Checkout API called');
  console.log('🔑 Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);
  console.log('🌐 Base URL:', process.env.NEXT_PUBLIC_BASE_URL);

  try {
    const body = await request.json();
    const { email, guideIds } = body;

    console.log('📧 Email:', email);
    console.log('📚 Guide IDs:', guideIds);

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Validate guideIds
    if (!guideIds || !Array.isArray(guideIds) || guideIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one guide must be selected' },
        { status: 400 }
      );
    }

    // Get guide details
    const selectedGuides = guides.filter(g => guideIds.includes(g.id));

    if (selectedGuides.length === 0) {
      return NextResponse.json(
        { error: 'No valid guides found' },
        { status: 404 }
      );
    }

    // Calculate price
    const isBundle = guideIds.length === 3;
    const totalPrice = isBundle ? 1000 : guideIds.length * 499; // $10 for 3, $4.99 each otherwise

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: isBundle
              ? '3-Guide Bundle'
              : selectedGuides.length > 1
                ? `${selectedGuides.length} Health Guides`
                : selectedGuides[0].title,
            description: isBundle
              ? `Bundle: ${selectedGuides.map(g => g.title).join(', ')}`
              : selectedGuides.map(g => g.title).join(', '),
            images: [], // Add product images if available
          },
          unit_amount: totalPrice,
        },
        quantity: 1,
      },
    ];

    // Prepare metadata
    const metadata: Record<string, string> = {
      guideIds: JSON.stringify(guideIds),
      guideTitles: selectedGuides.map(g => g.title).join(' | '),
      isBundle: isBundle.toString(),
      guideCount: guideIds.length.toString(),
    };

    // Create Stripe Checkout session
    console.log('💳 Creating Stripe session...');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: email,
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/catalog`,
      allow_promotion_codes: true, // Enable discount codes
    });

    console.log('✅ Session created:', session.id);
    console.log('🔗 Checkout URL:', session.url);
    console.log('💰 Amount:', session.amount_total);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
