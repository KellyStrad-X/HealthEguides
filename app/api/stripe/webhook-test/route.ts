import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Debug log removed

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // Debug log removed
    // Debug log removed
    // Debug log removed

    return NextResponse.json({
      message: 'Webhook test endpoint reached',
      signaturePresent: !!signature,
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      bodyLength: body.length
    });
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook test endpoint is live',
    webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    timestamp: new Date().toISOString()
  });
}
