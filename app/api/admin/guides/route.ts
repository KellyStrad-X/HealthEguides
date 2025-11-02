import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { Guide } from '@/lib/guides';

// GET all guides from Firestore
export async function GET(request: NextRequest) {
  try {
    const guidesSnapshot = await adminDb.collection('guides').get();
    const guides: Guide[] = [];

    guidesSnapshot.forEach((doc) => {
      guides.push({ ...doc.data(), id: doc.id } as Guide);
    });

    return NextResponse.json(guides);
  } catch (error) {
    console.error('Error fetching guides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guides' },
      { status: 500 }
    );
  }
}

// POST - Create new guide
export async function POST(request: NextRequest) {
  try {
    const guideData: Guide = await request.json();

    // Validate required fields
    if (!guideData.id || !guideData.title || !guideData.slug) {
      return NextResponse.json(
        { error: 'Missing required fields: id, title, slug' },
        { status: 400 }
      );
    }

    // Check if guide with this ID already exists
    const existingGuide = await adminDb.collection('guides').doc(guideData.id).get();
    if (existingGuide.exists) {
      return NextResponse.json(
        { error: 'Guide with this ID already exists' },
        { status: 409 }
      );
    }

    // Add timestamps
    const guideWithTimestamps = {
      ...guideData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore
    await adminDb.collection('guides').doc(guideData.id).set(guideWithTimestamps);

    return NextResponse.json(guideWithTimestamps, { status: 201 });
  } catch (error) {
    console.error('Error creating guide:', error);
    return NextResponse.json(
      { error: 'Failed to create guide' },
      { status: 500 }
    );
  }
}

// PUT - Update existing guide
export async function PUT(request: NextRequest) {
  try {
    const guideData: Guide = await request.json();

    if (!guideData.id) {
      return NextResponse.json(
        { error: 'Missing guide ID' },
        { status: 400 }
      );
    }

    // Check if guide exists
    const guideRef = adminDb.collection('guides').doc(guideData.id);
    const guideDoc = await guideRef.get();

    if (!guideDoc.exists) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }

    // Update guide with new data
    const updatedGuide = {
      ...guideData,
      updatedAt: new Date().toISOString(),
    };

    await guideRef.update(updatedGuide);

    return NextResponse.json(updatedGuide);
  } catch (error) {
    console.error('Error updating guide:', error);
    return NextResponse.json(
      { error: 'Failed to update guide' },
      { status: 500 }
    );
  }
}

// DELETE - Delete guide
export async function DELETE(request: NextRequest) {
  try {
    const { guideId } = await request.json();

    if (!guideId) {
      return NextResponse.json(
        { error: 'Missing guide ID' },
        { status: 400 }
      );
    }

    // Delete from Firestore
    await adminDb.collection('guides').doc(guideId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide:', error);
    return NextResponse.json(
      { error: 'Failed to delete guide' },
      { status: 500 }
    );
  }
}
