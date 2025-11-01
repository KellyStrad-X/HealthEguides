# Stripe + Firebase Implementation Guide

## 🎉 What's Been Implemented

Your HealthEGuides site now has a **complete Stripe-powered delivery system** that replaces Gumroad with:
- ✅ **Stripe Checkout** for payment processing (2.9% + $0.30 per transaction)
- ✅ **Firebase Firestore** for storing purchase records and access tokens
- ✅ **Token-based access** to hosted HTML guides
- ✅ **Email delivery** via Resend with access links
- ✅ **Bundle support** (3 guides for $10)
- ✅ **Refund handling** with automatic access revocation
- ✅ **Lost access recovery** page for customers

---

## 📊 Cost Comparison: Gumroad vs Stripe

### Per $4.99 Sale:
| Platform | Fees | You Keep | Difference |
|----------|------|----------|------------|
| **Gumroad** | ~10% = $0.50 | $4.49 | - |
| **Stripe** | 2.9% + $0.30 = $0.44 | $4.55 | **+$0.06** |

### Per $10 Bundle (3 guides):
| Platform | Fees | You Keep | Difference |
|----------|------|----------|------------|
| **Gumroad** | ~10% = $1.00 | $9.00 | - |
| **Stripe** | 2.9% + $0.30 = $0.59 | $9.41 | **+$0.41** |

**Annual Savings (at 1,000 sales/month):**
- Single guides: **+$720/year**
- Bundles: **+$4,920/year**

---

## 🏗️ Architecture Overview

### User Flow
```
1. Customer lands on guide page → /perimenopause
2. Enters email, clicks "Get Your Guide Now"
3. Redirects to Stripe Checkout (hosted by Stripe)
4. Completes payment with card
5. Stripe webhook fires → creates purchase record in Firebase
6. Email sent with access link
7. Customer clicks link → /guides/perimenopause?access=abc123xyz
8. Access validated → guide content displays
9. Link stored in localStorage for future visits
```

### Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind
- **Payment:** Stripe Checkout + Webhooks
- **Database:** Firebase Firestore
- **Email:** SendGrid (100 emails/day free, or your existing plan)
- **Hosting:** Vercel (or your preferred platform)

---

## 📁 Files Created/Modified

### New Files (API Routes)
```
app/api/stripe/
├── create-checkout/route.ts  # Creates Stripe checkout session
└── webhook/route.ts           # Handles payment & refund events

app/api/
├── validate-access/route.ts          # Validates access tokens
├── get-access-from-session/route.ts  # Gets token from session ID
├── send-purchase-email/route.ts      # Sends confirmation email
└── resend-access-email/route.ts      # Resends lost access links

app/guides/[slug]/page.tsx            # Protected guide viewer page
app/purchase/success/page.tsx         # Post-checkout success page
app/lost-access/page.tsx              # Lost access recovery page
```

### New Files (Configuration)
```
lib/
├── firebase-admin.ts    # Firebase Admin SDK setup
└── utils.ts             # Helper functions (token generation, etc.)

.env.example             # Environment variables template
FIREBASE_SETUP.md        # Firebase configuration guide
STRIPE_IMPLEMENTATION_GUIDE.md  # This file
```

### Modified Files
```
components/GuideEmailCapture.tsx  # Now redirects to Stripe instead of Gumroad
components/BundleOffer.tsx        # Updated with email capture + Stripe checkout
package.json                      # Added stripe, firebase-admin, resend
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies (✅ Already Done)
```bash
npm install stripe @stripe/stripe-js firebase-admin resend
```

### 2. Set Up Stripe

#### A. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create account or sign in
3. Toggle to **Test Mode** (top right)

#### B. Get API Keys
1. Go to **Developers → API Keys**
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`)

#### C. Set Up Webhook
1. Go to **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - For local testing: `http://localhost:3000/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `charge.refunded`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

#### D. Local Webhook Testing (Development)
```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe  # macOS
# OR download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook signing secret it provides
```

### 3. Set Up Firebase

**Follow the detailed guide:** [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md)

**Quick Steps:**
1. Create Firebase project
2. Enable Firestore Database
3. Create `purchases` collection
4. Set security rules
5. Download service account key
6. Add credentials to `.env.local`

### 4. Set Up SendGrid (Email Service)

**Good news:** Since you already use SendGrid for another project, you can reuse your existing API key!

#### A. Get Your API Key
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Either use an existing key or create a new one:
   - Click **"Create API Key"**
   - Name: "HealthEGuides"
   - Permissions: **Full Access** (or at minimum "Mail Send")
   - Copy the key (starts with `SG.`)

#### B. Verify Sender (If Not Already Done)
1. Go to **Settings** → **Sender Authentication**
2. Either:
   - **Option A:** Verify domain (healtheguides.com) - Recommended
   - **Option B:** Verify single sender email (guides@healtheguides.com)
3. If domain already verified for your other project, you're all set!

#### C. Check Sending Limits
- **Free Plan:** 100 emails/day
- **Essentials Plan:** 50,000 emails/month
- **Pro Plan:** 1.5M emails/month

Make sure your plan supports the expected email volume.

### 5. Configure Environment Variables

Create `.env.local` in project root:

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Required Variables:**
```bash
# Base
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

---

## 🧪 Testing the Implementation

### Local Development Testing

#### 1. Start Development Server
```bash
npm run dev
```

#### 2. Start Stripe Webhook Listener (Separate Terminal)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### 3. Test Single Guide Purchase
1. Visit: `http://localhost:3000/perimenopause`
2. Enter test email
3. Click "Get Your Guide Now - $4.99"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
5. Complete checkout
6. Check:
   - ✅ Redirects to success page
   - ✅ Firebase purchase record created
   - ✅ Email received (check Resend logs)
   - ✅ Access link works

#### 4. Test Bundle Purchase
1. Visit: `http://localhost:3000`
2. Scroll to "3 Guides for $10" section
3. Select 3 guides
4. Enter email, checkout
5. Verify:
   - ✅ Charged $10
   - ✅ 3 purchase records created
   - ✅ Email has 3 access links
   - ✅ All links work

#### 5. Test Lost Access Recovery
1. Visit: `http://localhost:3000/lost-access`
2. Enter email used in previous purchase
3. Click "Resend Access Links"
4. Check email inbox
5. Verify links work

#### 6. Test Refund Flow
```bash
# Get payment intent ID from Stripe dashboard
stripe refunds create --payment-intent=pi_xxxxxxxxxxxxx
```
Then:
1. Check Firebase → purchase status changed to "refunded"
2. Try accessing guide with that token → should show "Access revoked"

### Test Card Numbers
```
✅ Success: 4242 4242 4242 4242
❌ Decline: 4000 0000 0000 0002
🔐 3D Secure: 4000 0025 0000 3155
```
[More test cards](https://stripe.com/docs/testing)

---

## 🌐 Deploying to Production

### Pre-Launch Checklist

#### Stripe
- [ ] Switch to **live mode** in Stripe dashboard
- [ ] Replace test keys with live keys in `.env`
- [ ] Update webhook endpoint to production URL
- [ ] Test one real purchase (then refund it)

#### Firebase
- [ ] Create production Firebase project (if using separate test project)
- [ ] Update service account credentials
- [ ] Set up Firestore indexes (see FIREBASE_SETUP.md)
- [ ] Configure backup strategy

#### Email
- [ ] Verify sender/domain in SendGrid (if not already done)
- [ ] Test email deliverability with [Mail Tester](https://www.mail-tester.com/)
- [ ] If using new "from" email, warm up sender (send 10-20 emails/day for a week)

#### Environment Variables
```bash
# Production .env
NEXT_PUBLIC_BASE_URL=https://healtheguides.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # ← NEW webhook secret!
# ... rest of production values
```

#### Testing Production
1. Make one real $4.99 purchase with your card
2. Verify entire flow works
3. Request refund via Stripe dashboard
4. Verify access is revoked

---

## 📖 Adding New Guides

### Option 1: Update Code (Current Method)

**Edit `lib/guides.ts`:**
```typescript
{
  id: "thyroid-essentials",
  title: "Thyroid Health Essentials",
  description: "Master your thyroid health...",
  emoji: "🦋",
  gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  features: [
    "Complete thyroid assessment guide",
    "Treatment options explained",
    // ...
  ],
  price: 4.99,
  slug: "thyroid",
  gumroadUrl: "", // Not used anymore
  metaDescription: "Complete guide to thyroid health...",
  keywords: ["thyroid", "hypothyroidism", ...],
  category: "Hormone Health"
}
```

**Create guide HTML file:**
```bash
# Place your guide HTML at:
public/guides/thyroid-essentials.html
```

**Deploy:**
```bash
git add .
git commit -m "Add Thyroid Essentials guide"
git push
```

### Option 2: Dynamic Management (Future)

Store guides in Firebase `guides` collection and query dynamically. Requires modifying `lib/guides.ts` to fetch from Firebase.

---

## 🔧 Common Issues & Solutions

### Issue: "Webhook signature verification failed"
**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- For local testing, use secret from `stripe listen` command
- Check webhook endpoint is publicly accessible

### Issue: "Firebase permission denied"
**Solution:**
- Check Firestore security rules
- Verify service account credentials are correct
- Ensure Firebase Admin SDK is initialized

### Issue: "Email not received"
**Solution:**
- Check spam/junk folder
- Verify SendGrid sender is authenticated
- Check SendGrid Activity Feed for delivery status
- Ensure `from` email matches verified domain/sender

### Issue: "Access token not working"
**Solution:**
- Check Firebase purchase record exists
- Verify status is "active" (not "refunded")
- Clear browser localStorage and try fresh link
- Check URL has `?access=` parameter

### Issue: "Bundle shows wrong price"
**Solution:**
- Verify `getBundlePrice()` in `lib/utils.ts`
- Check Stripe checkout session amount in webhook
- Ensure 3 guides selected before checkout

---

## 📈 Monitoring & Analytics

### Stripe Dashboard
- **Payments:** Track successful payments
- **Refunds:** Monitor refund requests
- **Disputes:** Handle chargebacks
- **Webhooks:** Check webhook delivery status

### Firebase Console
- **Firestore Usage:** Monitor reads/writes/storage
- **Collection Browser:** View purchase records
- **Logs:** Debug errors

### SendGrid Dashboard
- **Activity Feed:** View sent emails and delivery status
- **Statistics:** Check open rates, bounces, spam reports
- **Suppressions:** Monitor unsubscribes and bounced emails
- **API Usage:** Track email quota usage

### Google Analytics
Track key events (already implemented):
- `begin_checkout` - Customer starts checkout
- `purchase` - Purchase completed (add in webhook handler)
- `bundle_claim` - Bundle selected

---

## 🛡️ Security Best Practices

✅ **Implemented:**
- Cryptographically secure access tokens (crypto.randomBytes)
- Stripe webhook signature verification
- Firebase security rules (no client-side access to purchases)
- Environment variables for secrets (never committed)

🔒 **Recommendations:**
- Enable Stripe Radar for fraud detection
- Set up Firebase App Check
- Implement rate limiting on email resend
- Monitor for unusual purchase patterns
- Regularly rotate API keys

---

## 💰 Pricing & Scaling

### Current Costs (assuming 1,000 sales/month)

**Stripe:**
- Transaction fees: ~$440/month
- No monthly fee
- **Cost per sale:** $0.44

**Firebase (Firestore):**
- Free tier sufficient up to ~15k purchases/month
- Blaze plan: ~$25-50/month for moderate traffic
- **Cost per sale:** $0.00 - $0.05

**SendGrid:**
- Free: 100 emails/day (~3,000/month)
- Essentials ($19.95/mo): 50,000 emails/month
- Pro ($89.95/mo): 1.5M emails/month
- **Cost per sale:** $0.00 - $0.02 (depending on your plan)

**Total platform costs:** ~2-3% vs Gumroad's ~10%

### Revenue Projections

| Monthly Sales | Gross Revenue | Net (after fees) | vs Gumroad |
|---------------|---------------|------------------|------------|
| 100 guides | $499 | $455 | **+$6** |
| 500 guides | $2,495 | $2,275 | **+$30** |
| 1,000 guides | $4,990 | $4,550 | **+$60** |
| 100 bundles | $1,000 | $941 | **+$41** |
| 500 bundles | $5,000 | $4,705 | **+$205** |

---

## 🆘 Support & Resources

### Documentation
- [Stripe Docs](https://stripe.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com/)
- [Next.js Docs](https://nextjs.org/docs)

### Testing Tools
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Mail Tester](https://www.mail-tester.com/) (email deliverability)

### Community
- [Stripe Discord](https://discord.gg/stripe)
- [Firebase Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

---

## ✅ Launch Day Checklist

**T-1 Week:**
- [ ] All test purchases successful
- [ ] Email deliverability score > 8/10
- [ ] Domain warmed up (sent 50+ test emails)
- [ ] Backup strategy configured

**Launch Day:**
- [ ] Switch to Stripe live keys
- [ ] Update webhook to production URL
- [ ] Update NEXT_PUBLIC_BASE_URL
- [ ] Deploy to production
- [ ] Make test purchase with real card
- [ ] Verify access link works
- [ ] Monitor first 10 sales closely

**T+1 Day:**
- [ ] Check for webhook delivery issues
- [ ] Verify all emails delivered
- [ ] Review Firebase usage
- [ ] Address any customer support issues

---

## 🎯 Next Steps

Your implementation is **complete and ready for testing**!

**Immediate Actions:**
1. ✅ Set up Stripe account (test mode)
2. ✅ Configure Firebase project
3. ✅ Add SendGrid API key (reuse from existing project)
4. ✅ Test local purchase flow
5. ✅ Add guide HTML files to `public/guides/`

**Before Launch:**
1. Create production HTML guides
2. Test with real card (small amount)
3. Verify email deliverability
4. Set up monitoring/alerts

**Post-Launch:**
1. Monitor first 100 sales
2. Gather customer feedback
3. Optimize conversion rate
4. Add more guides

---

**Questions?** Check `FIREBASE_SETUP.md` for Firebase-specific setup or reach out to your development team.

**Ready to launch?** 🚀 You've got everything you need!
