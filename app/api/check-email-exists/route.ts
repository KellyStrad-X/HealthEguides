import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if user exists with this email
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

      // Other errors
      throw error;
    }
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    );
  }
}
