import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/session';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminSession(request);
    if (authResult !== true) {
      return authResult;
    }

    const { guideId } = await request.json();

    if (!guideId) {
      return NextResponse.json(
        { error: 'Guide ID is required' },
        { status: 400 }
      );
    }

    // Try to load guide HTML from private directory
    const guideHtmlPath = path.join(process.cwd(), 'private', 'guides', `${guideId}.html`);

    try {
      const html = await fs.readFile(guideHtmlPath, 'utf-8');

      return NextResponse.json({
        html,
        success: true,
      });
    } catch (fileError) {
      // File not found
      return NextResponse.json({
        html: null,
        success: false,
        error: 'HTML file not found',
      }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load guide content' },
      { status: 500 }
    );
  }
}
