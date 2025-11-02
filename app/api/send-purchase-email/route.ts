import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { getAllGuides } from '@/lib/guide-service';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface Purchase {
  guideId: string;
  accessToken: string;
}

export async function POST(request: Request) {
  try {
    const { email, purchases, sessionId } = await request.json();

    if (!email || !purchases || !Array.isArray(purchases) || purchases.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Get all guides (includes both hardcoded and Firebase guides)
    const allGuides = await getAllGuides();

    // Get guide details for purchased guides
    const guideDetails = purchases.map((p: Purchase) => {
      const guide = allGuides.find(g => g.id === p.guideId);
      return {
        ...p,
        title: guide?.title || 'Health Guide',
        slug: guide?.slug || p.guideId,
        emoji: guide?.emoji || '📚',
      };
    });

    const isBundle = purchases.length > 1;

    // Generate access links
    const accessLinks = guideDetails.map(g => ({
      title: g.title,
      emoji: g.emoji,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/guides/${g.slug}?access=${g.accessToken}`,
    }));

    // Generate HTML for access links
    const linksHtml = accessLinks.map(link => `
      <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #4ECDC4;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50;">
          ${link.emoji} ${link.title}
        </h3>
        <a href="${link.url}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4ECDC4 0%, #556FB5 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px;">
          Access Your Guide →
        </a>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #7f8c8d; word-break: break-all;">
          Direct link: <a href="${link.url}" style="color: #4ECDC4;">${link.url}</a>
        </p>
      </div>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #2c3e50; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { color: #4ECDC4; font-size: 28px; margin: 0; }
          .header p { color: #7f8c8d; font-size: 16px; margin: 10px 0 0 0; }
          .intro { font-size: 16px; margin-bottom: 30px; }
          .tips { background: rgba(78, 205, 196, 0.1); padding: 20px; border-left: 4px solid #4ECDC4; border-radius: 8px; margin: 30px 0; }
          .tips h3 { margin-top: 0; color: #2c3e50; }
          .footer { text-align: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid #e0e0e0; color: #7f8c8d; font-size: 14px; }
          .support { background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Your ${isBundle ? 'Guides Are' : 'Guide Is'} Ready!</h1>
            <p>Thanks for your purchase from HealthEGuides</p>
          </div>

          <div class="intro">
            <p>Hi there!</p>
            <p>Your ${isBundle ? `${purchases.length} health guides are` : 'health guide is'} ready to read right now. Click the ${isBundle ? 'links' : 'link'} below to get instant access:</p>
          </div>

          ${linksHtml}

          <div class="tips">
            <h3>📱 Reading on Mobile?</h3>
            <p><strong>iPhone/iPad:</strong> Tap the share button <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg> → "Add to Home Screen" for app-like access</p>
            <p><strong>Android:</strong> Tap the menu button → "Install app" for app-like access</p>
            <p style="margin-bottom: 0;">Works offline after the first load!</p>
          </div>

          <div class="tips">
            <strong>💡 Pro Tip:</strong> Bookmark this email or save ${isBundle ? 'these links' : 'this link'}. ${isBundle ? 'They work' : 'It works'} forever and you can access ${isBundle ? 'them' : 'it'} on any device.
          </div>

          <div class="support">
            <p style="margin: 0 0 10px 0;"><strong>Need help or not satisfied?</strong></p>
            <p style="margin: 0 0 15px 0;">If you have any questions, issues, or would like to request a refund, we're here to help.</p>
            <p style="margin: 0;">Contact us at <a href="mailto:support@healtheguides.com" style="color: #4ECDC4; text-decoration: none; font-weight: 600;">support@healtheguides.com</a></p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #7f8c8d;">We stand behind the quality of our guides and want you to be completely satisfied with your purchase.</p>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>HealthEGuides</strong></p>
            <p style="margin: 0;">Evidence-based health guides you can trust</p>
            <p style="margin: 20px 0 0 0; font-size: 12px;">Order ID: ${sessionId}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via SendGrid
    await sgMail.send({
      from: {
        email: 'guides@healtheguides.com',
        name: 'HealthEGuides'
      },
      to: email,
      subject: `Your HealthEGuides ${isBundle ? `Bundle (${purchases.length} Guides)` : 'Guide'} - Instant Access! 📚`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
