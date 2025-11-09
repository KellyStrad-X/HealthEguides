import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import * as crypto from 'crypto';

// Rate limiting for email checks
const emailCheckAttempts = new Map<string, { count: number; resetTime: number }>();

// Helper to add random delay to prevent timing attacks
async function randomDelay(min: number = 100, max: number = 300): Promise<void> {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export async function POST(request: Request) {
  try {
    // Add rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Check rate limiting (10 attempts per minute)
    const now = Date.now();
    const attempts = emailCheckAttempts.get(ip) || { count: 0, resetTime: now + 60000 };

    if (attempts.resetTime < now) {
      attempts.count = 0;
      attempts.resetTime = now + 60000;
    }

    if (attempts.count >= 10) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    attempts.count++;
    emailCheckAttempts.set(ip, attempts);

    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Add random delay to prevent timing attacks
    await randomDelay();

    // SECURITY: Always return the same generic response
    // This prevents email enumeration attacks
    // The actual email existence check should only happen during the actual signup/login process

    // You can still check internally for logging purposes, but don't reveal the result
    try {
      await adminAuth.getUserByEmail(email);
      // Log for internal monitoring (don't expose to client)
    // Debug log removed
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Log for internal monitoring (don't expose to client)
    // Debug log removed
      }
    }

    // Check if user exists with this email
    // NOTE: This does expose email enumeration, but is required for current UX
    // Consider implementing a CAPTCHA or email verification flow in the future
    try {
      await adminAuth.getUserByEmail(email);

      // User exists
      return NextResponse.json({
        exists: true,
        message: 'An account with this email already exists. Please sign in instead.'
      });
    } catch (error: any) {
      // User not found - this is the expected case for new signups
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json({
          exists: false,
          message: 'Email is available'
        });
      }

      // Other errors - return safe response
      return NextResponse.json({
        exists: false,
        message: 'Email is available'
      });
    }

  } catch (error) {
    // Don't log full error details that might reveal information
    // Error log removed - TODO: Add proper error handling

    // Return generic error
    return NextResponse.json(
      { error: 'Unable to process request' },
      { status: 500 }
    );
  }
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  emailCheckAttempts.forEach((attempts, ip) => {
    if (attempts.resetTime < now - 300000) { // Remove entries older than 5 minutes
      emailCheckAttempts.delete(ip);
    }
  });
}, 60000);
