import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { accessToken, guideId } = await request.json();

    if (!accessToken || !guideId) {
      return NextResponse.json(
        { valid: false, error: 'Missing access token or guide ID' },
        { status: 400 }
      );
    }

    // Query Firebase for matching purchase
    const purchasesSnapshot = await adminDb
      .collection('purchases')
      .where('accessToken', '==', accessToken)
      .where('guideId', '==', guideId)
      .limit(1)
      .get();

    if (purchasesSnapshot.empty) {
      return NextResponse.json({ valid: false });
    }

    const purchaseDoc = purchasesSnapshot.docs[0];
    const purchase = purchaseDoc.data();

    // Check if purchase is active (not refunded)
    if (purchase.status !== 'active') {
      return NextResponse.json({
        valid: false,
        error: 'Access has been revoked',
      });
    }

    // Update last accessed timestamp and increment access count
    await purchaseDoc.ref.update({
      lastAccessedAt: new Date(),
      accessCount: (purchase.accessCount || 0) + 1,
    });

    return NextResponse.json({
      valid: true,
      guideId: purchase.guideId,
      guideName: purchase.guideName,
    });

  } catch (error) {
    console.error('Access validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}
