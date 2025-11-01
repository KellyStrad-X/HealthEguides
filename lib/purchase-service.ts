import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { guides } from '@/lib/guides';
import { generateAccessToken } from '@/lib/utils';

export interface PurchaseAccess {
  guideId: string;
  guideName: string;
  accessToken: string;
}

function getGuideName(guideId: string, fallbackTitle?: string): string {
  const guide = guides.find(g => g.id === guideId);
  if (guide?.title) {
    return guide.title;
  }

  if (fallbackTitle) {
    return fallbackTitle;
  }

  return 'Health Guide';
}

/**
 * Ensure purchase records exist for a Stripe checkout session.
 * Returns purchase access data and indicates whether any records were newly created.
 */
export async function ensurePurchasesForSession(
  session: Stripe.Checkout.Session
): Promise<{ purchases: PurchaseAccess[]; created: boolean }> {
  const email = session.customer_email;
  const guideIds = JSON.parse(session.metadata?.guideIds || '[]') as string[];

  if (!email || guideIds.length === 0) {
    throw new Error('Checkout session is missing email or guide metadata');
  }

  const snapshot = await adminDb
    .collection('purchases')
    .where('stripeSessionId', '==', session.id)
    .get();

  const existingByGuideId = new Map<string, PurchaseAccess>();

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    existingByGuideId.set(data.guideId, {
      guideId: data.guideId,
      guideName: data.guideName,
      accessToken: data.accessToken,
    });
  });

  let created = false;
  const purchases: PurchaseAccess[] = [];

  for (const guideId of guideIds) {
    const existing = existingByGuideId.get(guideId);

    if (existing) {
      purchases.push(existing);
      continue;
    }

    const guideName = getGuideName(guideId, session.metadata?.guideTitles);
    const accessToken = generateAccessToken();

    await adminDb.collection('purchases').add({
      email,
      guideId,
      guideName,
      accessToken,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      isBundle: session.metadata?.isBundle === 'true',
      purchasedAt: new Date(),
      lastAccessedAt: null,
      accessCount: 0,
      status: 'active',
    });

    purchases.push({ guideId, guideName, accessToken });
    created = true;
  }

  return { purchases, created };
}
