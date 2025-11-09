import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import validator from 'validator';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// HTML escape function to prevent XSS in emails
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Rate limiting map (simple in-memory - resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(email);

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit (3 messages per hour)
    rateLimitMap.set(email, {
      count: 1,
      resetTime: now + 60 * 60 * 1000, // 1 hour
    });
    return true;
  }

  if (limit.count >= 3) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract and validate inputs
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name is too long (max 100 characters)' },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { error: 'Subject is too long (max 200 characters)' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Validate email format using validator library
    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Additional email validation - prevent email header injection
    if (email.includes('\n') || email.includes('\r') || name.includes('\n') || name.includes('\r')) {
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again in an hour.' },
        { status: 429 }
      );
    }

    const finalSubject = subject || 'Contact Form Submission';
    const recipientEmail = process.env.CONTACT_EMAIL || 'support@healtheguides.com';

    // Escape all user inputs for HTML email
    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const escapedSubject = escapeHtml(finalSubject);
    const escapedMessage = escapeHtml(message);

    // Email to you (the admin)
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #2c3e50; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4ECDC4 0%, #556FB5 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .field-label { font-weight: 600; color: #4ECDC4; margin-bottom: 5px; }
          .field-value { background: white; padding: 10px; border-radius: 4px; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #4ECDC4; border-radius: 4px; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">📧 New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">From:</div>
              <div class="field-value">${escapedName}</div>
            </div>
            <div class="field">
              <div class="field-label">Email:</div>
              <div class="field-value"><a href="mailto:${email}" style="color: #4ECDC4;">${escapedEmail}</a></div>
            </div>
            <div class="field">
              <div class="field-label">Subject:</div>
              <div class="field-value">${escapedSubject}</div>
            </div>
            <div class="field">
              <div class="field-label">Message:</div>
              <div class="message-box">${escapedMessage}</div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 4px; text-align: center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(finalSubject)}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4ECDC4 0%, #556FB5 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Reply to ${escapedName}
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    await sgMail.send({
      from: {
        email: 'guides@healtheguides.com',
        name: 'HealthEGuides Contact Form'
      },
      replyTo: email,
      to: recipientEmail,
      subject: `[Contact Form] ${finalSubject}`,
      html: adminEmailHtml,
    });

    // Send confirmation email to user
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #2c3e50; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #4ECDC4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #4ECDC4; margin: 0;">✅ Message Received</h1>
          </div>
          <div class="content">
            <p>Hi ${escapedName},</p>
            <p>Thanks for contacting us! We've received your message and will get back to you as soon as possible.</p>
            <p><strong>Your message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; white-space: pre-wrap;">${escapedMessage}</div>
            <p>We typically respond within 24 hours during business days.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>The HealthEGuides Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sgMail.send({
      from: {
        email: 'guides@healtheguides.com',
        name: 'HealthEGuides'
      },
      to: email,
      subject: 'We received your message - HealthEGuides',
      html: userEmailHtml,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email us directly at support@healtheguides.com' },
      { status: 500 }
    );
  }
}
