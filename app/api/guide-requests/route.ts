import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export interface GuideRequest {
  id?: string;
  topic: string;
  description?: string;
  email?: string;
  submittedAt: string;
  status: 'new' | 'reviewed' | 'planned' | 'completed';
}

// POST - Create new guide request
export async function POST(request: NextRequest) {
  try {
    const requestData: Omit<GuideRequest, 'id' | 'status'> = await request.json();

    // Validate required fields
    if (!requestData.topic || requestData.topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Create guide request with default status
    const guideRequest: Omit<GuideRequest, 'id'> = {
      topic: requestData.topic.trim(),
      description: requestData.description?.trim() || '',
      email: requestData.email?.trim() || '',
      submittedAt: requestData.submittedAt || new Date().toISOString(),
      status: 'new',
    };

    // Save to Firestore
    const docRef = await adminDb.collection('guide-requests').add(guideRequest);

    return NextResponse.json(
      {
        success: true,
        id: docRef.id,
        ...guideRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating guide request:', error);
    return NextResponse.json(
      { error: 'Failed to submit guide request' },
      { status: 500 }
    );
  }
}

// GET - Fetch all guide requests (for admin panel)
export async function GET(request: NextRequest) {
  try {
    const requestsSnapshot = await adminDb
      .collection('guide-requests')
      .orderBy('submittedAt', 'desc')
      .get();

    const requests: GuideRequest[] = [];

    requestsSnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as GuideRequest);
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching guide requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide requests' },
      { status: 500 }
    );
  }
}

// PUT - Update guide request status (for admin panel)
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing request ID or status' },
        { status: 400 }
      );
    }

    const validStatuses = ['new', 'reviewed', 'planned', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update in Firestore
    await adminDb.collection('guide-requests').doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating guide request:', error);
    return NextResponse.json(
      { error: 'Failed to update guide request' },
      { status: 500 }
    );
  }
}

// DELETE - Delete guide request (for admin panel)
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing request ID' },
        { status: 400 }
      );
    }

    await adminDb.collection('guide-requests').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide request:', error);
    return NextResponse.json(
      { error: 'Failed to delete guide request' },
      { status: 500 }
    );
  }
}
