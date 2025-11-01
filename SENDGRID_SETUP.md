# SendGrid Setup for HealthEGuides

## Overview

Since you already use SendGrid for another project, setting up email for HealthEGuides is straightforward. You can reuse your existing API key or create a new one dedicated to this project.

---

## Quick Setup (5 minutes)

### Step 1: Get Your API Key

**Option A: Reuse Existing Key (Easiest)**
1. Use the same SendGrid API key from your other project
2. Add it to `.env.local`: `SENDGRID_API_KEY=SG.xxxxxxxxxxxxx`
3. Done! ✅

**Option B: Create New Key (Recommended for separation)**
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Name: `HealthEGuides`
5. Permissions: **Full Access** (or minimum: "Mail Send")
6. Click **"Create & View"**
7. Copy the key (starts with `SG.`) - you won't see it again!
8. Save to `.env.local`

---

## Step 2: Verify Sender

You need a verified sender email address to send from `guides@healtheguides.com`.

### Option A: Domain Authentication (Best for Production)

If your domain is already verified in SendGrid for your other project, you're all set! SendGrid allows sending from any email address on a verified domain.

**Check if domain is verified:**
1. Go to **Settings** → **Sender Authentication**
2. Look for `healtheguides.com` in **Domain Authentication**
3. If you see ✅ "Verified", you're done!

**If not verified:**
1. Click **"Authenticate Your Domain"**
2. Select your DNS provider
3. Add the DNS records (CNAME, MX, TXT) provided by SendGrid:
   - SPF record
   - DKIM records (3 CNAME records)
   - DMARC record (optional but recommended)
4. Wait 5-10 minutes for propagation
5. Click **"Verify"**

### Option B: Single Sender Verification (Quick for Testing)

For quick testing or if you can't verify the domain:

1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Click **"Create New Sender"**
3. Fill in:
   - **From Name:** HealthEGuides
   - **From Email:** guides@healtheguides.com (or your verified email)
   - **Reply To:** same or support@healtheguides.com
   - **Company Address:** Your business address
4. Click **"Create"**
5. Check your email and click the verification link

**Note:** Single sender verification is fine for testing but domain authentication is better for production.

---

## Step 3: Test Email Sending

### Local Test

1. Add to `.env.local`:
   ```bash
   SENDGRID_API_KEY=SG.your_actual_key_here
   ```

2. Start your dev server:
   ```bash
   npm run dev
   ```

3. Test the email endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/send-purchase-email \
     -H "Content-Type: application/json" \
     -d '{
       "email": "your-email@example.com",
       "purchases": [
         {
           "guideId": "perimenopause-playbook",
           "accessToken": "test-token-123"
         }
       ],
       "sessionId": "test-session"
     }'
   ```

4. Check your email inbox (and spam folder!)

---

## SendGrid Dashboard Overview

### Activity Feed
**Path:** Email Activity → Activity Feed

View all sent emails:
- Delivery status (Delivered, Opened, Clicked, Bounced, etc.)
- Recipient email
- Subject line
- Timestamp
- Error messages (if any)

**Use this to:**
- Debug email delivery issues
- Confirm purchase emails were sent
- Check bounce/spam complaints

### Statistics
**Path:** Email Activity → Statistics

Track email performance:
- **Requests:** Total emails attempted
- **Delivered:** Successfully delivered
- **Bounces:** Failed deliveries (hard bounce = bad email, soft bounce = temporary issue)
- **Spam Reports:** Recipients marked as spam
- **Opens:** How many emails were opened (requires tracking enabled)
- **Clicks:** Link clicks (requires tracking enabled)

### Suppressions
**Path:** Email Activity → Suppressions

Manage blocked emails:
- **Bounces:** Emails that couldn't be delivered
- **Spam Reports:** Recipients who marked email as spam
- **Blocks:** SendGrid prevented sending (reputation protection)
- **Invalid Emails:** Malformed email addresses

**Important:** Remove test emails from suppressions if testing repeatedly!

---

## Email Delivery Best Practices

### 1. From Email Configuration

Update your from email in the code if needed:

**File:** `app/api/send-purchase-email/route.ts`
```typescript
from: {
  email: 'guides@healtheguides.com', // ← Change if needed
  name: 'HealthEGuides'
}
```

Make sure this email matches your verified domain/sender!

### 2. Improve Deliverability

✅ **DO:**
- Use authenticated domain
- Keep bounce rate < 5%
- Monitor spam complaints
- Include unsubscribe link for marketing emails (not required for transactional)
- Send from consistent email/domain
- Warm up new sender (10-20 emails/day for a week)

❌ **DON'T:**
- Send to purchased email lists
- Use spam trigger words in subject (FREE!!!, WINNER, etc.)
- Send from generic domains (@gmail.com, @yahoo.com)
- Ignore bounce reports

### 3. Email Content Tips

Your current email templates are great! They:
- ✅ Have clear subject lines
- ✅ Include transactional content (purchase confirmation)
- ✅ Have proper HTML structure
- ✅ Are mobile-responsive
- ✅ Include helpful instructions

### 4. Monitor Key Metrics

**Healthy Transactional Email:**
- Delivery Rate: >99%
- Bounce Rate: <2%
- Spam Complaint Rate: <0.1%
- Open Rate: 40-60% (if tracking enabled)

**Red Flags:**
- Bounce rate >5% = Bad email list or configuration issue
- Spam rate >0.5% = Content or sender reputation issue
- Consistent blocks = Domain reputation problem

---

## Rate Limits & Quotas

### Free Plan
- **100 emails/day** (3,000/month)
- Suitable for: Testing, low-volume sites (<50 sales/month)

### Essentials Plan ($19.95/mo)
- **50,000 emails/month**
- Suitable for: Growing sites (1,000-1,500 sales/month)
- Removes SendGrid branding

### Pro Plan ($89.95/mo)
- **1.5M emails/month**
- Suitable for: High-volume sites (30k+ sales/month)
- Includes dedicated IP, advanced analytics

### What's Your Current Plan?

Check: **Settings** → **Account Details** → **Your Products**

**Estimated Usage for HealthEGuides:**
- 1 email per purchase (confirmation)
- If customer uses "Lost Access": +1 email
- Average: ~1.2 emails per customer

**Examples:**
- 100 sales/month = ~120 emails (Free plan: ✅)
- 500 sales/month = ~600 emails (Free plan: ✅)
- 3,000 sales/month = ~3,600 emails (Need Essentials)

---

## Troubleshooting

### Issue: "403 Forbidden" Error

**Possible causes:**
- API key doesn't have "Mail Send" permission
- API key is from different SendGrid account
- API key was regenerated/deleted

**Solution:**
1. Go to SendGrid → Settings → API Keys
2. Verify your key exists and has correct permissions
3. If needed, create a new key with "Full Access"
4. Update `.env.local` with new key

### Issue: Emails Going to Spam

**Solutions:**
1. **Authenticate your domain** (most important!)
2. Add these DNS records if not present:
   - SPF: `v=spf1 include:sendgrid.net ~all`
   - DKIM: (3 CNAME records from SendGrid)
3. Test deliverability: [Mail Tester](https://www.mail-tester.com/)
4. Avoid spam trigger words
5. Ensure HTML is well-formatted

### Issue: "From address does not match verified sender"

**Solution:**
- Change `from.email` in code to match verified sender
- OR verify the email address you want to use
- Check: Settings → Sender Authentication

### Issue: High Bounce Rate

**Common causes:**
- Typos in customer emails
- Old/inactive email addresses
- Email provider blocking (rare for transactional)

**Solution:**
1. Validate email format before accepting (already implemented ✅)
2. Check Activity Feed for bounce reasons
3. Remove bounced emails from future sends

### Issue: Rate Limit Exceeded

**Error message:** "Too many requests"

**Solution:**
- You've hit your daily/monthly limit
- Upgrade plan OR
- Wait for quota reset (daily at midnight UTC)
- Check usage: Settings → Account Details

---

## Testing Checklist

Before going live, test these scenarios:

- [ ] Send test email to Gmail (check inbox & spam)
- [ ] Send test email to Outlook/Hotmail (different spam filters)
- [ ] Send test email to corporate email (often stricter filters)
- [ ] Test "Lost Access" email resend flow
- [ ] Verify all links work in emails
- [ ] Check mobile email rendering (forward to phone)
- [ ] Test with Mail Tester (aim for 8+/10 score)
- [ ] Verify Activity Feed shows delivery

---

## Integration with Your Other Project

### Shared vs Separate API Keys

**Shared Key (Your current setup):**
- ✅ Simple - reuse existing
- ✅ Combined stats
- ⚠️ Both projects affected if key is compromised
- ⚠️ Can't separate analytics by project

**Separate Keys:**
- ✅ Better security isolation
- ✅ Separate analytics per project
- ✅ Can revoke one without affecting the other
- ⚠️ Manage two keys

**Recommendation:** If your existing project is production, create a separate key for HealthEGuides testing, then decide if you want to keep them separate for production.

### Will This Affect My Other Project?

**No!** SendGrid handles multiple projects/keys independently:
- Separate API keys = separate rate limits
- Shared domain authentication works for all projects
- Reputation is domain-level, not key-level
- Both projects can send from same domain

**Only consideration:** Total email volume across projects must stay within your plan limits.

---

## Production Checklist

Before launching:

- [ ] Domain authentication complete (SPF, DKIM verified)
- [ ] Test purchase email delivers successfully
- [ ] Test "Lost Access" email flow
- [ ] Verify from email matches verified domain
- [ ] Check current SendGrid plan supports expected volume
- [ ] Set up alerts for bounces/spam complaints
- [ ] Add support@ alias to handle replies
- [ ] Test email renders correctly on mobile devices

---

## Quick Reference

### Environment Variable
```bash
SENDGRID_API_KEY=SG.your_actual_key_here
```

### API Key Permissions Needed
- **Mail Send** (minimum)
- **Full Access** (recommended for simplicity)

### From Email
- Configured in: `app/api/send-purchase-email/route.ts` and `app/api/resend-access-email/route.ts`
- Default: `guides@healtheguides.com`
- Must match verified domain/sender

### SendGrid Dashboard Links
- **API Keys:** https://app.sendgrid.com/settings/api_keys
- **Sender Authentication:** https://app.sendgrid.com/settings/sender_auth
- **Activity Feed:** https://app.sendgrid.com/email_activity
- **Statistics:** https://app.sendgrid.com/statistics

---

## Support

### SendGrid Support
- **Docs:** https://docs.sendgrid.com/
- **Status:** https://status.sendgrid.com/
- **Support Tickets:** https://support.sendgrid.com/ (paid plans)

### Common Questions

**Q: Can I send from @gmail.com or @yahoo.com?**
A: No, SendGrid requires a domain you own or a verified single sender.

**Q: Do I need a dedicated IP?**
A: No, shared IP is fine for most use cases. Dedicated IP is for high-volume senders (100k+/month).

**Q: How long until emails are delivered?**
A: Usually within seconds. Check Activity Feed if delayed.

**Q: Can I track email opens?**
A: Yes, enable in Settings → Tracking. Adds tracking pixel to emails.

---

**You're all set!** Since you already use SendGrid, this should be a quick setup. Just grab your API key and you're ready to test! 🚀
