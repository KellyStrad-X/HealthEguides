import { NextRequest, NextResponse } from 'next/server';
import { createSession, setSessionCookies, clearSessionCookies, getSession } from '@/lib/session';
import * as crypto from 'crypto';

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const { password, action } = await request.json();

    // Handle logout
    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      return clearSessionCookies(response);
    }

    // Get IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Check rate limiting (5 attempts per minute)
    const now = Date.now();
    const attempts = loginAttempts.get(ip) || { count: 0, resetTime: now + 60000 };

    if (attempts.resetTime < now) {
      attempts.count = 0;
      attempts.resetTime = now + 60000;
    }

    if (attempts.count >= 5) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    // Validate password
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      );
    }

    // Use timing-safe comparison
    const passwordBuffer = Buffer.from(password || '');
    const adminPasswordBuffer = Buffer.from(adminPassword);

    let isValid = false;
    if (passwordBuffer.length === adminPasswordBuffer.length) {
      isValid = crypto.timingSafeEqual(passwordBuffer, adminPasswordBuffer);
    }

    if (!isValid) {
      attempts.count++;
      loginAttempts.set(ip, attempts);
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Clear attempts on successful login
    loginAttempts.delete(ip);

    // Create session
    const { token, csrfToken } = await createSession();

    // Create response with session cookies
    const response = NextResponse.json({
      success: true,
      csrfToken, // Send CSRF token to client
    });

    return setSessionCookies(response, token, csrfToken);

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// GET - Check if user is authenticated
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (session && session.isAdmin) {
      return NextResponse.json({
        authenticated: true,
        csrfToken: session.csrfToken,
      });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
