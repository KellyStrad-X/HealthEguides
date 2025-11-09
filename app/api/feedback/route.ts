import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import sgMail from '@sendgrid/mail';

export interface Feedback {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'reviewed' | 'responded';
}

// POST - Submit feedback
export async function POST(request: NextRequest) {
  try {
    const feedbackData: Omit<Feedback, 'id' | 'status'> = await request.json();

    // Validate required fields
    if (!feedbackData.name || !feedbackData.email || !feedbackData.subject || !feedbackData.message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create feedback record
    const feedback: Omit<Feedback, 'id'> = {
      name: feedbackData.name.trim(),
      email: feedbackData.email.trim(),
      subject: feedbackData.subject.trim(),
      message: feedbackData.message.trim(),
      submittedAt: feedbackData.submittedAt || new Date().toISOString(),
      status: 'new',
    };

    // Save to Firestore
    const docRef = await adminDb.collection('feedback').add(feedback);

    // Send email notification if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
          to: process.env.ADMIN_EMAIL || 'support@healtheguides.com',
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@healtheguides.com',
          replyTo: feedback.email,
          subject: `[Feedback] ${feedback.subject}`,
          text: `
New feedback received from Health E-Guides website

From: ${feedback.name} (${feedback.email})
Subject: ${feedback.subject}
Submitted: ${new Date(feedback.submittedAt).toLocaleString()}

Message:
${feedback.message}

---
Feedback ID: ${docRef.id}
          `.trim(),
          html: `
            <h2>New Feedback Received</h2>
            <p><strong>From:</strong> ${feedback.name} (${feedback.email})</p>
            <p><strong>Subject:</strong> ${feedback.subject}</p>
            <p><strong>Submitted:</strong> ${new Date(feedback.submittedAt).toLocaleString()}</p>
            <hr>
            <h3>Message:</h3>
            <p>${feedback.message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Feedback ID: ${docRef.id}</p>
          `,
        };

        await sgMail.send(msg);
    // Debug log removed
      } catch (emailError) {
    // Error log removed - TODO: Add proper error handling
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        id: docRef.id,
        ...feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// GET - Fetch all feedback (for admin panel)
export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100); // Max 100 items
    const offset = (page - 1) * limit;
    const isAdmin = searchParams.get('admin') === 'true';

    // Get total count for pagination metadata
    const totalSnapshot = await adminDb
      .collection('feedback')
      .count()
      .get();
    const totalItems = totalSnapshot.data().count;
    const totalPages = Math.ceil(totalItems / limit);

    // Build query with pagination
    let query = adminDb
      .collection('feedback')
      .orderBy('submittedAt', 'desc')
      .limit(limit);

    // Apply offset if needed
    if (offset > 0) {
      const offsetSnapshot = await adminDb
        .collection('feedback')
        .orderBy('submittedAt', 'desc')
        .limit(offset)
        .get();

      if (offsetSnapshot.docs.length > 0) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    const feedbackSnapshot = await query.get();

    const feedback: Feedback[] = [];

    feedbackSnapshot.forEach((doc) => {
      feedback.push({ id: doc.id, ...doc.data() } as Feedback);
    });

    // Return with pagination metadata if admin request
    if (isAdmin) {
      return NextResponse.json({
        feedback,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      });
    }

    // Legacy response for backward compatibility
    return NextResponse.json(feedback);
  } catch (error) {
    // Error handling: TODO - Add proper error logging
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// PUT - Update feedback status (for admin panel)
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing feedback ID or status' },
        { status: 400 }
      );
    }

    const validStatuses = ['new', 'reviewed', 'responded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update in Firestore
    await adminDb.collection('feedback').doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

// DELETE - Delete feedback (for admin panel)
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing feedback ID' },
        { status: 400 }
      );
    }

    await adminDb.collection('feedback').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
