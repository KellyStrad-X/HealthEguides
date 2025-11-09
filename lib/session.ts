import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as crypto from 'crypto';

// Session configuration
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'fallback-secret-change-this';
const SESSION_COOKIE_NAME = 'admin_session';
const CSRF_COOKIE_NAME = 'csrf_token';
const SESSION_DURATION = 60 * 60 * 24; // 24 hours in seconds

// Convert secret to key
const secret = new TextEncoder().encode(SESSION_SECRET);

export interface SessionData {
  isAdmin: boolean;
  createdAt: number;
  csrfToken: string;
}

/**
 * Creates a new admin session with JWT token and CSRF protection
 */
export async function createSession(): Promise<{ token: string; csrfToken: string }> {
  const csrfToken = crypto.randomBytes(32).toString('hex');

  const sessionData: SessionData = {
    isAdmin: true,
    createdAt: Date.now(),
    csrfToken,
  };

  const token = await new SignJWT(sessionData as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret);

  return { token, csrfToken };
}

/**
 * Verifies a session token
 */
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    return payload as unknown as SessionData;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the current session from cookies
 */
export async function getSession(request: NextRequest): Promise<SessionData | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Sets session cookies in the response
 */
export function setSessionCookies(response: NextResponse, token: string, csrfToken: string): NextResponse {
  // Set secure HTTP-only session cookie
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Changed from 'strict' to work with Vercel preview deployments
    maxAge: SESSION_DURATION,
    path: '/',
  });

  // Set CSRF token cookie (accessible to JavaScript for inclusion in requests)
  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Needs to be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Changed from 'strict' to work with Vercel preview deployments
    maxAge: SESSION_DURATION,
    path: '/',
  });

  return response;
}

/**
 * Clears session cookies
 */
export function clearSessionCookies(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(CSRF_COOKIE_NAME);
  return response;
}

/**
 * Validates CSRF token from request
 */
export function validateCSRFToken(request: NextRequest, session: SessionData): boolean {
  // Get CSRF token from header or body
  const headerToken = request.headers.get('X-CSRF-Token');

  if (!headerToken) {
    return false;
  }

  // Compare with session's CSRF token
  return crypto.timingSafeEqual(
    Buffer.from(session.csrfToken),
    Buffer.from(headerToken)
  );
}

/**
 * Middleware to check admin session and CSRF for mutations
 */
export async function requireAdminSession(
  request: NextRequest,
  requireCSRF: boolean = false
): Promise<true | NextResponse> {
  const session = await getSession(request);

  if (!session || !session.isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in as admin.' },
      { status: 401 }
    );
  }

  // For mutations (POST, PUT, DELETE), validate CSRF token
  if (requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    if (!validateCSRFToken(request, session)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  return true;
}