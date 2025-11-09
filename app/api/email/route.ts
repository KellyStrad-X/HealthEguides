import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, guideSlug, guideTitle } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // TODO: Integrate with ConvertKit or Mailchimp
    // For now, just store it (replace with actual API call)

    // Example ConvertKit integration (uncomment and configure):
    /*
    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.CONVERTKIT_API_KEY,
          email: email,
          tags: [`guide-${guideSlug}`, 'landing-page-lead'],
          fields: {
            guide_title: guideTitle,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to subscribe to email list');
    }
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error log removed - TODO: Add proper error handling
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    );
  }
}
