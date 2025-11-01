import crypto from 'crypto';

/**
 * Generate a cryptographically secure access token
 * Returns a 64-character hexadecimal string
 */
export function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Format price in cents to dollars
 */
export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Calculate Stripe fee (2.9% + $0.30)
 */
export function calculateStripeFee(amountInCents: number): number {
  return Math.round(amountInCents * 0.029 + 30);
}

/**
 * Get bundle price for multiple guides
 * 1 guide = $4.99
 * 3 guides = $10.00
 */
export function getBundlePrice(guideCount: number): number {
  if (guideCount === 3) {
    return 1000; // $10.00 in cents
  }
  return guideCount * 499; // $4.99 per guide in cents
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
