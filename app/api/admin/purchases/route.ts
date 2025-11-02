import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Admin API route to fetch all purchases from Firestore
 * Returns purchases grouped by Stripe session for easier management
 */
export async function GET(request: Request) {
  // Verify admin authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all purchases, ordered by purchase date (newest first)
    const purchasesSnapshot = await adminDb
      .collection('purchases')
      .orderBy('purchasedAt', 'desc')
      .get();

    const purchases = purchasesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        guideId: data.guideId,
        guideName: data.guideName,
        accessToken: data.accessToken,
        stripeSessionId: data.stripeSessionId,
        stripePaymentIntentId: data.stripePaymentIntentId,
        amount: data.amount,
        currency: data.currency,
        isBundle: data.isBundle || false,
        purchasedAt: data.purchasedAt?.toDate?.()?.toISOString() || data.purchasedAt,
        lastAccessedAt: data.lastAccessedAt?.toDate?.()?.toISOString() || data.lastAccessedAt,
        accessCount: data.accessCount || 0,
        status: data.status || 'active',
        refundedAt: data.refundedAt?.toDate?.()?.toISOString() || data.refundedAt,
      };
    });

    // Group purchases by session ID for easier display
    const purchasesBySession = new Map<string, any>();

    purchases.forEach(purchase => {
      const sessionId = purchase.stripeSessionId;
      if (!purchasesBySession.has(sessionId)) {
        purchasesBySession.set(sessionId, {
          sessionId,
          email: purchase.email,
          purchasedAt: purchase.purchasedAt,
          status: purchase.status,
          amount: purchase.amount,
          currency: purchase.currency,
          isBundle: purchase.isBundle,
          stripePaymentIntentId: purchase.stripePaymentIntentId,
          refundedAt: purchase.refundedAt,
          guides: [],
        });
      }

      purchasesBySession.get(sessionId).guides.push({
        id: purchase.id,
        guideId: purchase.guideId,
        guideName: purchase.guideName,
        accessToken: purchase.accessToken,
        accessCount: purchase.accessCount,
        lastAccessedAt: purchase.lastAccessedAt,
      });
    });

    const groupedPurchases = Array.from(purchasesBySession.values());

    return NextResponse.json({
      purchases: groupedPurchases,
      total: groupedPurchases.length,
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}
