import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import sgMail from '@sendgrid/mail';

export async function POST(request: NextRequest) {
  try {
    const { feedbackId, replyMessage } = await request.json();

    if (!feedbackId || !replyMessage) {
      return NextResponse.json(
        { error: 'Feedback ID and reply message are required' },
        { status: 400 }
      );
    }

    // Get the original feedback from Firestore
    const feedbackDoc = await adminDb.collection('feedback').doc(feedbackId).get();

    if (!feedbackDoc.exists) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    const feedback = feedbackDoc.data();

    if (!feedback) {
      return NextResponse.json(
        { error: 'Invalid feedback data' },
        { status: 500 }
      );
    }

    // Verify SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const fromEmail = process.env.ADMIN_EMAIL || 'support@healtheguides.com';
    const fromName = 'HealthEGuides Support';

    // Send reply email via SendGrid
    const msg = {
      to: feedback.email,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject: `Re: ${feedback.subject}`,
      text: `${replyMessage}

---
Original Message:
From: ${feedback.name} (${feedback.email})
Subject: ${feedback.subject}
Date: ${new Date(feedback.submittedAt).toLocaleString()}

${feedback.message}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #2c3e50; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4ECDC4 0%, #556FB5 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">HealthEGuides Support</h1>
          </div>

          <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin-top: 0;">Hi ${feedback.name},</p>

            <div style="white-space: pre-wrap; margin: 20px 0;">${replyMessage.replace(/\n/g, '<br>')}</div>

            <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #f0f0f0;">
              <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 10px;"><strong>Your original message:</strong></p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4ECDC4;">
                <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">
                  <strong>From:</strong> ${feedback.name}<br>
                  <strong>Subject:</strong> ${feedback.subject}<br>
                  <strong>Date:</strong> ${new Date(feedback.submittedAt).toLocaleString()}
                </p>
                <p style="margin: 15px 0 0 0; color: #2c3e50; white-space: pre-wrap;">${feedback.message}</p>
              </div>
            </div>

            <div style="margin-top: 40px; text-align: center; padding-top: 30px; border-top: 1px solid #e0e0e0;">
              <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
                <strong>HealthEGuides</strong><br>
                Evidence-based health guides you can trust
              </p>
              <p style="color: #7f8c8d; font-size: 13px; margin: 10px 0 0 0;">
                Questions? Reply to this email or contact us at <a href="mailto:${fromEmail}" style="color: #4ECDC4; text-decoration: none;">${fromEmail}</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log('Reply email sent successfully to:', feedback.email);

    // Update feedback status to 'responded'
    await adminDb.collection('feedback').doc(feedbackId).update({
      status: 'responded',
      repliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully'
    });

  } catch (error: any) {
    console.error('Error sending reply:', error);

    // Provide more detailed error for SendGrid issues
    if (error.response) {
      console.error('SendGrid error:', error.response.body);
    }

    return NextResponse.json(
      { error: 'Failed to send reply', details: error.message },
      { status: 500 }
    );
  }
}
