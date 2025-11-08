import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('🧪 WEBHOOK TEST ENDPOINT HIT');

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    console.log('📦 Body length:', body.length);
    console.log('🔐 Signature present:', !!signature);
    console.log('🔑 Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET);

    return NextResponse.json({
      message: 'Webhook test endpoint reached',
      signaturePresent: !!signature,
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      bodyLength: body.length
    });
  } catch (error) {
    console.error('Webhook test error:', error);
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
