import { NextResponse } from 'next/server';
import { getAllGuides } from '@/lib/guide-service';
import { guides as hardcodedGuides } from '@/lib/guides';

// Disable caching to ensure fresh data from Firebase
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const guidesData = await getAllGuides();

    return NextResponse.json(guidesData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching guides:', error);
    // Return hardcoded guides as fallback
    return NextResponse.json(hardcodedGuides, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }
}
