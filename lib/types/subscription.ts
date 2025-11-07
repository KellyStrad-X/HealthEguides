export type SubscriptionStatus =
  | 'active'       // Subscription is active
  | 'trialing'     // In free trial period
  | 'past_due'     // Payment failed, grace period
  | 'canceled'     // User canceled
  | 'incomplete'   // Payment not completed
  | 'incomplete_expired' // Payment failed to complete
  | 'unpaid';      // Payment failed

export type SubscriptionInterval = 'month' | 'year';

export interface Subscription {
  id: string;  // Firestore document ID
  userId: string;  // Firebase Auth UID
  email: string;

  // Stripe data
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;

  // Subscription details
  status: SubscriptionStatus;
  interval: SubscriptionInterval;
  amount: number;  // Amount in cents
  currency: string;  // e.g., 'usd'

  // Trial information
  trialStart: Date | null;
  trialEnd: Date | null;

  // Billing dates
  currentPeriodStart: Date;
  currentPeriodEnd: Date;

  // Cancellation
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  cancelReason: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  priceId: string;  // monthly or annual price ID
  email?: string;  // Optional if user is authenticated
  userId?: string;  // Firebase Auth UID if authenticated
}

export interface SubscriptionCheckoutResponse {
  sessionId: string;
  url: string;
}
