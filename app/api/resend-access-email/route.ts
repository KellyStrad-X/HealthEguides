import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { adminDb } from '@/lib/firebase-admin';
import { getAllGuides } from '@/lib/guide-service';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Rate limiting map: email -> last request timestamp
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Rate limiting check
    const now = Date.now();
    const lastRequest = rateLimitMap.get(email);

    if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW) {
      const minutesLeft = Math.ceil((RATE_LIMIT_WINDOW - (now - lastRequest)) / 60000);
      return NextResponse.json(
        { error: `Please wait ${minutesLeft} minutes before requesting again` },
        { status: 429 }
      );
    }

    // Find all purchases for this email
    const purchasesSnapshot = await adminDb
      .collection('purchases')
      .where('email', '==', email)
      .where('status', '==', 'active')
      .get();

    if (purchasesSnapshot.empty) {
      return NextResponse.json(
        { error: 'No active purchases found for this email' },
        { status: 404 }
      );
    }

    // Get all guides (includes both hardcoded and Firebase guides)
    const allGuides = await getAllGuides();

    // Get guide details for all purchases
    const purchases = purchasesSnapshot.docs.map(doc => {
      const data = doc.data();
      const guide = allGuides.find(g => g.id === data.guideId);

      return {
        guideId: data.guideId,
        title: guide?.title || data.guideName,
        slug: guide?.slug || data.guideId,
        emoji: guide?.emoji || '📚',
        accessToken: data.accessToken,
      };
    });

    // Generate access links HTML
    const linksHtml = purchases.map(p => `
      <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #4ECDC4;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50;">
          ${p.emoji} ${p.title}
        </h3>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/guides/${p.slug}?access=${p.accessToken}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4ECDC4 0%, #556FB5 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px;">
          Access Your Guide →
        </a>
      </div>
    `).join('');

    // Send email via SendGrid
    await sgMail.send({
      from: {
        email: 'guides@healtheguides.com',
        name: 'HealthEGuides'
      },
      to: email,
      subject: `Your HealthEGuides Access Links 📚`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #2c3e50; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { color: #4ECDC4; font-size: 28px; margin: 0; }
            .footer { text-align: center; margin-top: 50px; color: #7f8c8d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Guide Access Links</h1>
            </div>
            <p>Hi there!</p>
            <p>Here are the access links for your ${purchases.length > 1 ? `${purchases.length} purchased guides` : 'purchased guide'}:</p>
            ${linksHtml}
            <p style="margin-top: 30px;">Save this email for future reference!</p>
            <div class="footer">
              <p>Need help? Contact <a href="mailto:support@healtheguides.com" style="color: #4ECDC4;">support@healtheguides.com</a></p>
              <p style="margin-top: 20px;"><strong>HealthEGuides</strong><br>Evidence-based health guides you can trust</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Update rate limit map
    rateLimitMap.set(email, now);

    return NextResponse.json({
      success: true,
      message: `Access links sent to ${email}`,
      guideCount: purchases.length,
    });

  } catch (error) {
    console.error('Resend email error:', error);
    return NextResponse.json(
      { error: 'Failed to resend access email' },
      { status: 500 }
    );
  }
}
