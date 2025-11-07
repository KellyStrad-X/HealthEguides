import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const { email, subscriptionId, trialEnd } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const hasTrial = !!trialEnd;
    const trialEndDate = trialEnd ? new Date(trialEnd).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';

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
          .header h1 { color: #4ECDC4; font-size: 32px; margin: 0; }
          .header p { color: #7f8c8d; font-size: 18px; margin: 10px 0 0 0; }
          .intro { font-size: 16px; margin-bottom: 30px; }
          .trial-badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center; }
          .trial-badge h2 { margin: 0 0 10px 0; font-size: 24px; }
          .trial-badge p { margin: 0; font-size: 16px; opacity: 0.95; }
          .benefits { background: #f8f9fa; padding: 30px; border-radius: 12px; margin: 30px 0; }
          .benefits h3 { margin-top: 0; color: #2c3e50; font-size: 20px; }
          .benefit-item { display: flex; align-items: start; margin: 15px 0; }
          .benefit-icon { flex-shrink: 0; width: 24px; height: 24px; margin-right: 12px; color: #4ECDC4; }
          .cta-button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #4ECDC4 0%, #556FB5 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; font-size: 16px; }
          .tips { background: rgba(78, 205, 196, 0.1); padding: 20px; border-left: 4px solid #4ECDC4; border-radius: 8px; margin: 30px 0; }
          .footer { text-align: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid #e0e0e0; color: #7f8c8d; font-size: 14px; }
          .support { background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to HealthEGuides!</h1>
            <p>Your subscription is active</p>
          </div>

          ${hasTrial ? `
            <div class="trial-badge">
              <h2>✨ Your 7-Day Free Trial Has Started</h2>
              <p>You won't be charged until ${trialEndDate}</p>
              <p style="font-size: 14px; margin-top: 10px;">Cancel anytime before then at no cost</p>
            </div>
          ` : ''}

          <div class="intro">
            <p>Hi there!</p>
            <p>Welcome to your HealthEGuides subscription! You now have unlimited access to all of our evidence-based health guides.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/catalog" class="cta-button">
              Browse All Guides →
            </a>
          </div>

          <div class="benefits">
            <h3>What's Included in Your Subscription:</h3>

            <div class="benefit-item">
              <svg class="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <div>
                <strong>Unlimited Access to All Guides</strong>
                <p style="margin: 5px 0 0 0; color: #7f8c8d;">Read any guide, as many times as you want</p>
              </div>
            </div>

            <div class="benefit-item">
              <svg class="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <div>
                <strong>New Guides Added Regularly</strong>
                <p style="margin: 5px 0 0 0; color: #7f8c8d;">Get access to new content as it's released</p>
              </div>
            </div>

            <div class="benefit-item">
              <svg class="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <div>
                <strong>Evidence-Based Content</strong>
                <p style="margin: 5px 0 0 0; color: #7f8c8d;">All guides backed by research and created by healthcare professionals</p>
              </div>
            </div>

            <div class="benefit-item">
              <svg class="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <div>
                <strong>Access on Any Device</strong>
                <p style="margin: 5px 0 0 0; color: #7f8c8d;">Read on your phone, tablet, or computer</p>
              </div>
            </div>

            <div class="benefit-item">
              <svg class="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <div>
                <strong>Cancel Anytime</strong>
                <p style="margin: 5px 0 0 0; color: #7f8c8d;">No contracts or commitments</p>
              </div>
            </div>
          </div>

          <div class="tips">
            <h3 style="margin-top: 0;">💡 Getting Started</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li style="margin: 10px 0;">Browse the <a href="${process.env.NEXT_PUBLIC_BASE_URL}/catalog" style="color: #4ECDC4;">complete catalog</a> of guides</li>
              <li style="margin: 10px 0;">Click on any guide to start reading instantly</li>
              <li style="margin: 10px 0;">Bookmark your favorites for quick access</li>
              <li style="margin: 10px 0;">Manage your subscription anytime from your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/subscription" style="color: #4ECDC4;">account page</a></li>
            </ol>
          </div>

          <div class="support">
            <p style="margin: 0 0 10px 0;"><strong>Questions or Need Help?</strong></p>
            <p style="margin: 0 0 15px 0;">We're here to help! If you have any questions about your subscription, guides, or anything else, just reach out.</p>
            <p style="margin: 0;">Email us at <a href="mailto:support@healtheguides.com" style="color: #4ECDC4; text-decoration: none; font-weight: 600;">support@healtheguides.com</a></p>
          </div>

          ${hasTrial ? `
            <div class="tips">
              <p style="margin: 0;"><strong>Remember:</strong> Your free trial ends on ${trialEndDate}. Cancel before then to avoid any charges. You can manage your subscription anytime from your account settings.</p>
            </div>
          ` : ''}

          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>HealthEGuides</strong></p>
            <p style="margin: 0;">Evidence-based health guides you can trust</p>
            ${subscriptionId ? `<p style="margin: 20px 0 0 0; font-size: 12px;">Subscription ID: ${subscriptionId}</p>` : ''}
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
      subject: hasTrial ? '🎉 Your 7-Day Free Trial Has Started!' : '🎉 Welcome to HealthEGuides!',
      html: emailHtml,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Subscription email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
