# HealthEGuides Subscription Model - Deployment Guide

## 🎉 What's Been Built

Your app has been successfully converted from a per-guide purchase model ($4.99 each) to a **subscription model** ($5/month or $50/year) with a **7-day free trial**. The old token-based system remains functional for existing customers.

---

## ✅ Completed Features

### 1. **Subscription Infrastructure**
- Monthly ($5) and Annual ($50) subscription plans
- 7-day free trial included automatically
- Stripe subscription checkout flow
- Subscription management in Firebase Firestore

### 2. **Authentication System**
- Firebase Authentication (email/password)
- Login/Signup modal
- User profile dropdown in header
- Account management pages

### 3. **User Interface**
- "Get Access to All Our Guides" button on homepage
- Subscription modal with guide showcase and pricing
- Account page (`/account`)
- Subscription management page (`/account/subscription`)
- Subscription success page (`/subscription/success`)
- User profile button in header (shows when logged in)

### 4. **Access Control**
- Subscription-based access validation
- Backwards compatible with legacy token-based purchases
- Subscribers get access to ALL guides automatically
- Guide pages check subscription status first, then fall back to tokens

### 5. **Webhooks & Automation**
- Handles subscription created/updated/deleted
- Handles payment failures and renewals
- Automatic status updates in Firestore
- Subscription welcome emails

### 6. **Email Templates**
- Welcome email with trial information
- Professional HTML design
- SendGrid integration

### 7. **Guide Previews**
- Component to display first 3 pages of guides
- Image carousel with thumbnails
- Ready for you to add preview screenshots

---

## 🚀 Deployment Checklist

### Step 1: Environment Variables

Add these to your `.env.local`:

```bash
# Firebase Client SDK (for authentication on frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Subscription Price IDs
STRIPE_MONTHLY_PRICE_ID=price_xxxxx  # Create this in Stripe
STRIPE_ANNUAL_PRICE_ID=price_xxxxx   # Create this in Stripe
```

**Where to get Firebase Client values:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon → Project Settings
4. Under "Your apps" → Web app → SDK setup and configuration
5. Copy the config values

### Step 2: Firebase Authentication Setup

1. Go to Firebase Console → Authentication
2. Click "Get Started" (if not already enabled)
3. Enable "Email/Password" sign-in method
4. **Important:** Enable "Email link (passwordless sign-in)" as well (optional but recommended)

### Step 3: Create Stripe Subscription Products

Follow the guide in `STRIPE_SUBSCRIPTION_SETUP.md`:

**Quick version:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Create new product: "HealthEGuides Subscription"
3. Add Monthly price: $5.00/month
4. Add Annual price: $50.00/year
5. Copy the Price IDs (start with `price_`) to your `.env.local`

### Step 4: Update Stripe Webhook

Add these event types to your Stripe webhook:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

(Keep existing events: `checkout.session.completed`, `charge.refunded`)

### Step 5: Add Guide Preview Screenshots (Optional)

1. Take screenshots of the first 3 pages of each guide
2. Save them as:
   ```
   /public/guide-previews/{guideId}/page-1.png
   /public/guide-previews/{guideId}/page-2.png
   /public/guide-previews/{guideId}/page-3.png
   ```
3. The preview component will automatically display them on guide landing pages

**Example:**
```
/public/guide-previews/perimenopause-guide/page-1.png
/public/guide-previews/perimenopause-guide/page-2.png
/public/guide-previews/perimenopause-guide/page-3.png
```

### Step 6: Test the Full Flow

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test subscription signup:**
   - Go to homepage
   - Click "Get Access to All Our Guides"
   - Fill in email, select plan
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete checkout

3. **Verify in Stripe Dashboard:**
   - Check that subscription was created
   - Verify 7-day trial is active

4. **Verify in Firebase:**
   - Check Firestore → `subscriptions` collection
   - Should see new subscription with `status: 'trialing'`

5. **Test access:**
   - After signup, go to `/catalog`
   - Click any guide
   - Should have immediate access (no purchase needed)

6. **Test account management:**
   - Click your profile icon → "Manage Subscription"
   - Verify you can see subscription details
   - Test cancel button (it will cancel at period end, not immediately)

---

## 📋 Important Notes

### Backwards Compatibility

**The old system still works!** Users who previously purchased guides with the $4.99 per-guide model can still access them using their old access tokens. The system checks:
1. **First:** Active subscription (new system)
2. **Then:** Legacy access token (old system)

This means **no existing customers lose access**.

### Removing Old UI (Optional)

I've **kept** the old purchase UI components in place:
- `GuideEmailCapture` ($4.99 button)
- `BundleSelectionModal` (3 for $10)
- `SaleHeader` (bundle offer banner)

**Why?** You might want to:
- Run both systems simultaneously (A/B test)
- Keep one-time purchases as an option
- Gradually migrate users

**To remove them:**
1. Delete/comment out in `/components/GuidePageClient.tsx`:
   - `<SaleHeader />`
   - `<GuideEmailCapture />`
   - `<BundleSelectionModal />`

2. Update catalog page to only show subscription button

### Database Collections

**New collection created:**
- `subscriptions` - Stores all subscription data

**Existing collection still used:**
- `purchases` - Legacy one-time purchases (still supported)

---

## 🧪 Testing Checklist

- [ ] Homepage loads with "Get Access to Our Guides" button
- [ ] Subscription modal opens with pricing and guide showcase
- [ ] Can create account / log in
- [ ] Checkout redirects to Stripe with correct pricing
- [ ] Can complete test subscription with `4242 4242 4242 4242`
- [ ] Redirected to success page after payment
- [ ] Subscription appears in Firestore
- [ ] Welcome email received
- [ ] Can access any guide while subscription active
- [ ] Profile dropdown shows in header
- [ ] Can view subscription in account page
- [ ] Can cancel subscription (cancels at period end)
- [ ] Guide preview screenshots display (if added)

---

## 🚨 Common Issues & Solutions

### Issue: "Firebase is not configured"
**Solution:** Make sure all `NEXT_PUBLIC_FIREBASE_*` variables are in `.env.local`

### Issue: "Subscription plan not configured"
**Solution:** Add `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_ANNUAL_PRICE_ID` to `.env.local`

### Issue: "No active subscription found" even after paying
**Solution:**
1. Check Stripe webhook is receiving events
2. Verify subscription was created in Firestore `subscriptions` collection
3. Check webhook secret is correct in `.env.local`

### Issue: Can't access guides after subscribing
**Solution:**
1. Make sure user is logged in (check profile icon in header)
2. Verify subscription status in `/account/subscription`
3. Check browser console for errors

### Issue: Preview images not showing
**Solution:**
1. Verify images are in `/public/guide-previews/{guideId}/page-X.png`
2. Check image file names match exactly (case-sensitive)
3. Images should be PNG or JPG format

---

## 📱 Mobile Testing

Test on mobile devices:
- Subscription modal is responsive
- Login/signup works on mobile
- Profile dropdown accessible
- Guide pages load properly
- Checkout flow works on mobile

---

## 🎯 Next Steps After Deployment

1. **Monitor subscriptions:**
   - Watch Stripe Dashboard for new subscriptions
   - Check cancellation rates
   - Monitor trial-to-paid conversion

2. **Update marketing:**
   - Change ad copy to mention subscription model
   - Update landing page copy
   - Add "7-day free trial" to messaging

3. **Email existing customers (optional):**
   - Let them know about new subscription option
   - Their old purchases still work
   - They can upgrade to subscription for all guides

4. **Analytics:**
   - Track subscription signups vs. old per-guide purchases
   - Compare revenue models
   - A/B test if needed

---

## 💰 Pricing Comparison

**Old Model:**
- $4.99 per guide
- 3 for $10 (bundle)

**New Model:**
- $5/month (access to all guides)
- $50/year (access to all guides, save $10)
- 7-day free trial

**Revenue Impact:**
- 1 subscriber for 2 months = $10 (same as bundle)
- 1 subscriber for 3+ months = more revenue than per-guide
- Recurring revenue is more predictable

---

## 🆘 Support

If you run into issues:
1. Check browser console for errors
2. Check Stripe Dashboard → Developers → Logs
3. Check Firebase Console → Firestore for data
4. Verify all environment variables are set
5. Test with Stripe test cards first

---

## 🎊 You're Ready!

Everything is built and ready to deploy. Just follow the checklist above, and you'll have a fully functional subscription model live!

Remember: The old system still works, so existing customers won't be affected.

Good luck! 🚀
