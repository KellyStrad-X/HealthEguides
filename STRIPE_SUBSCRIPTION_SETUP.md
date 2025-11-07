# Stripe Subscription Setup Guide

This guide walks you through setting up subscription products in Stripe for the HealthEGuides monthly/annual subscription model.

## Step 1: Create a Subscription Product

1. Log into your Stripe Dashboard: https://dashboard.stripe.com/
2. Navigate to **Products** in the left sidebar
3. Click **+ Add product**

### Product Details:
- **Name**: HealthEGuides Subscription
- **Description**: Full access to all health guides and future content
- **Statement descriptor**: HEALTHEGUIDES (what appears on customer's credit card statement)
- **Image**: Upload your logo or brand image (optional but recommended)

Click **Save product**

## Step 2: Create Monthly Price

After creating the product, you'll be on the product details page.

1. Under **Pricing**, click **Add another price**
2. Configure the monthly price:
   - **Price**: $5.00
   - **Billing period**: Monthly
   - **Currency**: USD
   - **Price description**: Monthly Subscription (optional)
3. Click **Add price**

4. **Copy the Price ID** - it will look like `price_1Abc123...`
   - Add this to your `.env.local` as `STRIPE_MONTHLY_PRICE_ID`

## Step 3: Create Annual Price

1. Click **Add another price** again
2. Configure the annual price:
   - **Price**: $50.00
   - **Billing period**: Yearly
   - **Currency**: USD
   - **Price description**: Annual Subscription (Save $10/year)
3. Click **Add price**

4. **Copy the Price ID** - it will look like `price_1Def456...`
   - Add this to your `.env.local` as `STRIPE_ANNUAL_PRICE_ID`

## Step 4: Enable Free Trial (Optional but Recommended)

You can enable trials at the checkout level (already configured in code) or at the price level:

**Option 1: At checkout (Recommended - Already implemented)**
The code will automatically include a 7-day free trial when creating checkout sessions.

**Option 2: At price level**
1. Click on the price you want to add a trial to
2. Under **Trial period**, select **Free trial**
3. Enter **7 days**
4. Click **Save**

## Step 5: Update Webhook Configuration

Your webhook needs to listen for subscription events in addition to one-time payments.

1. Go to **Developers** → **Webhooks**
2. Click on your existing webhook endpoint (or create one if you haven't)
3. Endpoint URL should be: `https://yourdomain.com/api/stripe/webhook`
4. Under **Events to send**, make sure these are selected:
   - `checkout.session.completed` ✅ (already have this)
   - `customer.subscription.created` ✅ (NEW)
   - `customer.subscription.updated` ✅ (NEW)
   - `customer.subscription.deleted` ✅ (NEW)
   - `invoice.payment_failed` ✅ (NEW)
   - `invoice.payment_succeeded` ✅ (NEW)
   - `charge.refunded` ✅ (already have this)

5. Save the webhook

## Step 6: Test with Stripe CLI (Optional - For Local Development)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will show you webhook events in real-time during local testing.

## Step 7: Test Card Numbers

Use these test cards for subscription testing:

- **Success**: `4242 4242 4242 4242`
- **Payment requires authentication**: `4000 0025 0000 3155`
- **Card declined**: `4000 0000 0000 9995`
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC

## Summary

After completing these steps, you should have:

✅ A subscription product in Stripe
✅ Two price IDs (monthly and annual) added to `.env.local`
✅ Webhook configured to listen for subscription events
✅ Ready to test subscription flow

## Environment Variables Checklist

Make sure your `.env.local` has:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxx # or sk_live_xxxxx for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx # or pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx  # ← NEW
STRIPE_ANNUAL_PRICE_ID=price_xxxxx   # ← NEW
```

## Next Steps

Once Stripe is configured, the app will:
1. Display subscription pricing modal when users click "Get Access to Our Guides"
2. Allow users to choose monthly ($5) or annual ($50) subscription
3. Include a 7-day free trial automatically
4. Process subscriptions through Stripe Checkout
5. Grant access to all guides for active subscribers
6. Handle subscription cancellations and payment failures

---

Need help? Check Stripe docs: https://stripe.com/docs/billing/subscriptions
