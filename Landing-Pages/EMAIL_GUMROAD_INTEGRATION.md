# Email Capture + Gumroad Integration Guide

Complete guide for integrating email capture and Gumroad checkout into your Next.js landing pages.

---

## Overview

**Flow**:
```
Landing Page
    ↓
Email Capture Form
    ↓
Add to Email List (ConvertKit/Mailchimp)
    ↓
Redirect to Gumroad
    ↓
Purchase Complete
    ↓
Gumroad Delivers PDF
```

---

## Part 1: Gumroad Setup

### Step 1: Create Gumroad Account

1. Go to https://gumroad.com
2. Sign up (free)
3. Verify email

### Step 2: Create Your First Product

1. Dashboard → Products → New Product
2. **Product Type**: Choose "Digital Product"
3. **Product Details**:
   - Name: "Perimenopause Complete Guide" (example)
   - URL: `gumroad.com/l/perimenopause-guide` (your choice)
   - Price: $4.99
   - Description: Copy from your landing page
4. **Upload**: Your PDF guide
5. **Delivery**: Instant (after payment)
6. **Save**

### Step 3: Customize Product Page (Optional)

**Cover Image**:
- Upload guide cover (1200x630px recommended)
- Should match landing page branding

**Product Description**:
- Keep it simple (they've already read landing page)
- Quick bullet points of what's included
- "Instant download after purchase"

**Settings**:
- ✅ Enable "Email after purchase"
- ✅ Enable "Send updates" (build your Gumroad email list too)
- ❌ Disable "Pay what you want" (fixed $4.99)

### Step 4: Get Your Product URL

After saving, you'll have:
- **Direct link**: `https://gum.co/perimenopause-guide`
- **Overlay link**: `https://yourdomain.com?buy=perimenopause-guide`

**Choose**:
- **Direct link**: Leaves your site, goes to Gumroad
- **Overlay**: Checkout appears over your site (better UX)

### Step 5: Enable Gumroad Overlay (Recommended)

**In your Next.js landing page**:

Add to `<head>` in `app/layout.tsx`:
```tsx
<Script src="https://gumroad.com/js/gumroad.js" />
```

**Update CTA buttons**:
```tsx
<a
  href="https://yourdomain.gumroad.com/l/perimenopause-guide"
  className="gumroad-button"
>
  Get Your Guide Now - $4.99
</a>
```

**Result**: Checkout overlay appears on your site, smoother experience.

---

## Part 2: Email Service Setup

### Option A: ConvertKit (Recommended for Creators)

**Why ConvertKit**:
- Simple, creator-focused
- Visual automation builder
- Tag-based (no list management headaches)
- Great for selling digital products
- Free up to 1,000 subscribers

#### Setup ConvertKit

**Step 1: Create Account**
1. Go to https://convertkit.com
2. Sign up (free plan available)
3. Verify email

**Step 2: Create a Form**
1. Forms → New Form → "Inline" or "Modal"
2. Name: "Perimenopause Guide Landing Page"
3. Customize:
   - Heading: "Get instant access"
   - Button: "Get Your Guide Now"
   - Only ask for email (no name field)
4. Settings:
   - Success message: "Redirecting to checkout..."
   - OR: Redirect to URL (your thank-you page)
5. Save

**Step 3: Add Tag**
1. In form settings → Add tag
2. Tag name: "perimenopause-guide-lead"
3. This tracks which guide they're interested in

**Step 4: Get Form ID & API Key**
1. Form → Embed → Get Form ID (looks like `1234567`)
2. Settings → Advanced → API Key → Create

**Step 5: Add to Environment Variables**
```bash
# .env.local
CONVERTKIT_API_KEY=your_api_key_here
CONVERTKIT_FORM_ID=1234567
```

#### Implement in Next.js

**Create API route** (`app/api/email/route.ts`):
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Add to ConvertKit
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
          tags: ['perimenopause-guide-lead'], // Optional: add tags
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to subscribe');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
```

**Create email form component** (`components/EmailCapture.tsx`):
```typescript
'use client';

import { useState } from 'react';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Submit email to your API
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      // Track event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'email_submit', {
          method: 'landing_page',
        });
      }

      // Redirect to Gumroad
      window.location.href = 'https://yourdomain.gumroad.com/l/your-product';
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="email-form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email for instant access"
        required
        disabled={loading}
        className="email-input"
      />
      <button type="submit" disabled={loading} className="cta-button">
        {loading ? 'Processing...' : 'Get Your Guide Now - $4.99'}
      </button>
      {error && <p className="error-message">{error}</p>}
      <p className="email-disclaimer">
        We'll send your download link instantly + occasional helpful tips.
        Unsubscribe anytime.
      </p>
    </form>
  );
}
```

---

### Option B: Mailchimp

**Why Mailchimp**:
- Well-known, established
- Lots of integrations
- Free up to 500 subscribers
- Familiar interface

#### Setup Mailchimp

**Step 1: Create Account**
1. Go to https://mailchimp.com
2. Sign up (free plan available)

**Step 2: Create Audience**
1. Audience → Create Audience
2. Name: "HealthEGuides Subscribers"

**Step 3: Create Groups/Tags**
1. Audience → Manage Audience → Groups
2. Create group: "Guide Interest"
3. Options: "Perimenopause", "PCOS", etc.

**Step 4: Get API Key**
1. Profile → Extras → API Keys
2. Create a Key
3. Save securely

**Step 5: Get Audience ID**
1. Audience → Settings → Audience name and defaults
2. Copy "Audience ID"

**Step 6: Add to Environment Variables**
```bash
MAILCHIMP_API_KEY=your_api_key
MAILCHIMP_AUDIENCE_ID=your_audience_id
MAILCHIMP_SERVER_PREFIX=us1  # Check your API key, it shows the prefix
```

#### Implement in Next.js

**Install Mailchimp SDK**:
```bash
npm install @mailchimp/mailchimp_marketing
```

**Create API route** (`app/api/email/route.ts`):
```typescript
import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Add to Mailchimp
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID!,
      {
        email_address: email,
        status: 'subscribed',
        tags: ['perimenopause-guide-lead'],
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mailchimp error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
```

(Frontend component is same as ConvertKit example above)

---

## Part 3: Complete Integration Flow

### Recommended Flow

```
1. User lands on page
2. Scrolls, reads benefits
3. Clicks CTA button → scrolls to email form
4. Enters email → submits form
5. Email added to ConvertKit/Mailchimp
6. User redirected to Gumroad checkout
7. Completes purchase
8. Gumroad sends PDF via email
9. User receives guide
```

### Alternative: No Email Capture

If you want to simplify (not recommended):
```
1. User lands on page
2. Clicks CTA → goes straight to Gumroad
3. Purchases
4. Receives guide
```

**Why not recommended**:
- You don't build an email list
- Can't follow up with non-buyers
- Can't promote future guides
- Miss retargeting opportunities

---

## Part 4: Post-Purchase Email Sequence

### Email 1: Immediate Delivery (Automated by Gumroad)

Gumroad sends this automatically:
- "Thanks for your purchase!"
- Download link
- Receipt

**You don't need to do anything for this.**

### Email 2: Check-In (Day 3)

**Send from ConvertKit/Mailchimp**:

**Subject**: "Have you had a chance to read the guide?"

**Body**:
```
Hi [NAME],

Just checking in! A few days ago you downloaded the [Guide Name].

Have you had a chance to read it?

I'd love to hear what you found most helpful (or if you have any questions).

Just hit reply - I read every email.

Best,
[Your Name]

P.S. If you found it helpful, we have other guides on [related topics]
that might interest you too.
```

### Email 3: Value Add (Day 7)

**Subject**: "Quick tip: [Related to guide topic]"

**Body**:
```
Hi [NAME],

Quick tip related to [topic]:

[1-2 paragraph helpful tip not in the guide]

Hope this helps!

By the way, we just released a new guide on [related topic]. Check it out:
[Link to new landing page]

Best,
[Your Name]
```

### Automation in ConvertKit

1. Automations → New Automation → Visual Automation
2. Trigger: "Tag added" (your product tag)
3. Wait 3 days → Send Email 2
4. Wait 4 days → Send Email 3
5. Done

---

## Part 5: Tracking & Analytics

### Events to Track

**Google Analytics**:
```typescript
// When email submitted
gtag('event', 'email_submit', {
  guide_name: 'Perimenopause Complete Guide',
  method: 'landing_page_form'
});

// When redirected to Gumroad
gtag('event', 'checkout_start', {
  guide_name: 'Perimenopause Complete Guide',
  value: 4.99,
  currency: 'USD'
});
```

**In your form submission**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Track email submission
  window.gtag?.('event', 'email_submit', {
    guide_name: 'Perimenopause Guide',
  });

  // Submit to your API
  await fetch('/api/email', { /* ... */ });

  // Track checkout start
  window.gtag?.('event', 'checkout_start', {
    value: 4.99,
    currency: 'USD',
  });

  // Redirect to Gumroad
  window.location.href = 'https://gum.co/your-product';
};
```

### Gumroad Sales Tracking

**Gumroad Ping**:
Gumroad can ping your server when a sale happens.

1. Gumroad → Settings → Advanced → Ping URL
2. Enter: `https://yourdomain.com/api/gumroad-ping`
3. Create endpoint to receive webhook

**Example webhook** (`app/api/gumroad-ping/route.ts`):
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Data includes:
    // - email
    // - product_id
    // - price
    // - sale_timestamp

    // Track in analytics
    // Add to separate "buyers" list
    // Trigger any post-purchase automations

    console.log('Sale received:', data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

---

## Part 6: Compliance & Privacy

### GDPR Compliance (If targeting EU)

**Requirements**:
1. **Cookie consent**: Before Google Analytics
2. **Clear opt-in**: Checkbox for email (not pre-checked)
3. **Privacy policy**: Link prominently
4. **Right to deletion**: Honor requests

**Email form with GDPR consent**:
```tsx
<form onSubmit={handleSubmit}>
  <input type="email" required />

  <label>
    <input type="checkbox" required />
    I agree to receive emails and accept the{' '}
    <a href="/privacy">Privacy Policy</a>
  </label>

  <button type="submit">Get Your Guide</button>
</form>
```

### CAN-SPAM (US Law)

**Requirements**:
1. Clear "from" name
2. Honest subject lines
3. Physical address in footer
4. Easy unsubscribe link
5. Honor unsubscribes within 10 days

**ConvertKit/Mailchimp handle this automatically** in their email footers.

### Privacy Policy Must Include

- What data you collect (email, analytics)
- How it's used (send guide, occasional tips)
- Third parties (ConvertKit, Gumroad, Google Analytics)
- How to unsubscribe
- How to request deletion
- Contact information

**Free privacy policy generators**:
- https://www.privacypolicygenerator.info/
- https://www.freeprivacypolicy.com/

---

## Part 7: Testing Checklist

Before launching:

### Email Capture
- [ ] Submit test email
- [ ] Verify appears in ConvertKit/Mailchimp
- [ ] Check correct tags applied
- [ ] Verify redirect to Gumroad works
- [ ] Check analytics event fires
- [ ] Test error handling (invalid email)

### Gumroad
- [ ] Complete test purchase
- [ ] Verify PDF delivered immediately
- [ ] Check receipt email received
- [ ] Verify can download from Gumroad library
- [ ] Test on mobile device

### Email Sequence
- [ ] Trigger automation manually
- [ ] Verify timing is correct
- [ ] Check emails render properly
- [ ] Test on mobile email clients
- [ ] Verify unsubscribe works

### Analytics
- [ ] Email submit event tracked
- [ ] Checkout start event tracked
- [ ] Gumroad ping received (if using)
- [ ] Conversion funnel visible in GA

---

## Part 8: Troubleshooting

### Issue: Email not being added to list

**Check**:
- API key is correct
- Environment variables loaded (restart dev server)
- Form ID/Audience ID is correct
- Check ConvertKit/Mailchimp dashboard for errors
- View browser network tab for API errors

### Issue: Redirect not working

**Check**:
- Gumroad product URL is correct
- No JavaScript errors (browser console)
- Not being blocked by adblocker
- HTTPS on both sites (mixed content issue)

### Issue: Emails going to spam

**Solutions**:
- Use ConvertKit/Mailchimp (proper SPF/DKIM setup)
- Don't use free Gmail account to send
- Add unsubscribe link
- Don't use spam trigger words ("FREE", "ACT NOW")
- Build reputation gradually (don't blast immediately)

### Issue: Low email capture rate

**Optimize**:
- Simplify form (just email, no name)
- Clearer value proposition above form
- Add trust signals ("No spam, unsubscribe anytime")
- Test form placement (above fold vs after benefits)
- Make button more prominent

---

## Quick Reference

### ConvertKit API Endpoint
```
POST https://api.convertkit.com/v3/forms/{form_id}/subscribe
```

### Gumroad Overlay Script
```html
<script src="https://gumroad.com/js/gumroad.js"></script>
```

### Environment Variables
```bash
# ConvertKit
CONVERTKIT_API_KEY=
CONVERTKIT_FORM_ID=

# Mailchimp
MAILCHIMP_API_KEY=
MAILCHIMP_AUDIENCE_ID=
MAILCHIMP_SERVER_PREFIX=

# Gumroad
NEXT_PUBLIC_GUMROAD_PRODUCT_URL=
```

---

## Next Steps

1. ✅ Choose email service (ConvertKit recommended)
2. ✅ Create Gumroad product
3. ✅ Implement email capture form
4. ✅ Test complete flow end-to-end
5. ✅ Set up post-purchase email sequence
6. ✅ Monitor conversion rates
7. 🔄 Iterate based on data

---

Your email + Gumroad integration is the conversion engine. Nail this and everything else follows.
