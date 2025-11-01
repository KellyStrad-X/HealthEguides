import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Find all purchases associated with this Stripe session
    const purchasesSnapshot = await adminDb
      .collection('purchases')
      .where('stripeSessionId', '==', sessionId)
      .get();

    if (purchasesSnapshot.empty) {
      return NextResponse.json(
        { error: 'No purchases found for this session' },
        { status: 404 }
      );
    }

    // Return all guide access tokens
    const purchases = purchasesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        guideId: data.guideId,
        guideName: data.guideName,
        accessToken: data.accessToken,
      };
    });

    return NextResponse.json({ purchases });

  } catch (error) {
    console.error('Session lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve purchase information' },
      { status: 500 }
    );
  }
}
