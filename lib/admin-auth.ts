import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { getSession } from './session';

// Rate limiting for admin auth attempts
const authAttempts = new Map<string, { count: number; resetTime: number }>();

/**
 * Validates admin authentication from request headers
 * @param request - The incoming request
 * @returns true if authenticated, NextResponse with error if not
 */
export function validateAdminAuth(request: NextRequest | Request): true | NextResponse {
  try {
    // Get IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Check rate limiting (5 attempts per minute)
    const now = Date.now();
    const attempts = authAttempts.get(ip) || { count: 0, resetTime: now + 60000 };

    if (attempts.resetTime < now) {
      attempts.count = 0;
      attempts.resetTime = now + 60000;
    }

    if (attempts.count >= 5) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Check for admin password in header
    const password = request.headers.get('X-Admin-Password');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!password) {
      attempts.count++;
      authAttempts.set(ip, attempts);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use timing-safe comparison to prevent timing attacks
    const passwordBuffer = Buffer.from(password);
    const adminPasswordBuffer = Buffer.from(adminPassword);

    if (passwordBuffer.length !== adminPasswordBuffer.length) {
      attempts.count++;
      authAttempts.set(ip, attempts);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = crypto.timingSafeEqual(passwordBuffer, adminPasswordBuffer);

    if (!isValid) {
      attempts.count++;
      authAttempts.set(ip, attempts);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Clear attempts on successful auth
    authAttempts.delete(ip);
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Validates admin session authentication (for logged-in admin users)
 * Checks for valid session cookie and CSRF token
 * @param request - The incoming request
 * @returns true if authenticated, NextResponse with error if not
 */
export async function validateAdminSession(request: NextRequest): Promise<true | NextResponse> {
  try {
    // Get session from cookie
    const session = await getSession(request);

    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate CSRF token
    const csrfToken = request.headers.get('X-CSRF-Token');

    if (!csrfToken || csrfToken !== session.csrfToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Cleanup old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  authAttempts.forEach((attempts, ip) => {
    if (attempts.resetTime < now - 300000) { // Remove entries older than 5 minutes
      authAttempts.delete(ip);
    }
  });
}, 60000); // Run every minute