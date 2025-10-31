# Vercel Deployment Guide

Complete guide for deploying Next.js landing pages to Vercel with custom subdomain configuration.

---

## Overview

**Setup**: One parent domain → Unlimited subdomain landing pages

```
yourdomain.com (parent)
├── perimenopause.yourdomain.com → Vercel Project 1
├── pcos.yourdomain.com → Vercel Project 2
└── fertility.yourdomain.com → Vercel Project 3
```

Each landing page = separate Git repo = separate Vercel project.

---

## Prerequisites

### 1. Accounts Needed
- ✅ GitHub account (for code hosting)
- ✅ Vercel account (for deployment) - sign up with GitHub
- ✅ Domain registrar account (Cloudflare, Namecheap, etc.)
- ✅ Google Workspace (for email on parent domain)

### 2. Tools Needed
- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)
- SSH keys set up for GitHub

---

## Part 1: One-Time Parent Domain Setup

### Step 1: Buy Your Parent Domain

**Recommended Registrars**:
- **Cloudflare** ($10/year) - Best DNS, at-cost pricing
- **Namecheap** ($13/year) - User-friendly
- **Porkbun** ($11/year) - Good prices

**Domain Ideas**:
- `healthguides.com`
- `wellnesslibraryco.com`
- `yourhealth.guide`
- Keep it broad (you'll use subdomains for specific topics)

### Step 2: Configure Google Workspace

If you already have Google Workspace:
1. Go to Google Admin → Domains
2. Add your new domain
3. Verify ownership (DNS TXT record)
4. Set up MX records for email

**Result**: `hello@yourdomain.com` works for email

### Step 3: Point Domain DNS to Cloudflare (Optional but Recommended)

Why: Free, fast, easy subdomain management

1. In domain registrar, update nameservers to:
   ```
   nameserver1.cloudflare.com
   nameserver2.cloudflare.com
   ```
2. Add domain to Cloudflare (free plan)
3. Copy existing DNS records (especially Google Workspace MX records)
4. Wait for propagation (up to 24 hours)

**Result**: You now manage DNS through Cloudflare

---

## Part 2: First Landing Page Deployment

### Step 1: Create Next.js Landing Page

In your landing page project directory:

```bash
# If starting from template
npx create-next-app@latest my-landing-page --typescript --tailwind --app
cd my-landing-page

# Install dependencies if needed
npm install
```

### Step 2: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` - verify it works

### Step 3: Create GitHub Repository

**Option A: GitHub CLI**:
```bash
gh repo create perimenopause-guide --public --source=. --push
```

**Option B: Manual**:
1. Create new repo on GitHub: `perimenopause-guide`
2. In your project:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:USERNAME/perimenopause-guide.git
git push -u origin main
```

### Step 4: Deploy to Vercel

**Option A: Vercel Dashboard** (Easiest first time):

1. Go to https://vercel.com/new
2. Import Git Repository → Select your GitHub repo
3. Configure Project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
4. **Environment Variables** (if needed):
   - `NEXT_PUBLIC_GA_ID` - Google Analytics
   - `CONVERTKIT_API_KEY` - Email service
   - `GUMROAD_PRODUCT_URL` - Product link
5. Click "Deploy"

**Result**: Your site is live at `project-name.vercel.app`

**Option B: Vercel CLI**:
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Step 5: Add Custom Subdomain

In Vercel dashboard:
1. Go to your project → Settings → Domains
2. Add domain: `perimenopause.yourdomain.com`
3. Vercel will show you DNS records needed

**Vercel shows**:
```
Type: CNAME
Name: perimenopause
Value: cname.vercel-dns.com
```

### Step 6: Add DNS Record

**In Cloudflare** (or your DNS provider):
1. Go to DNS settings
2. Add CNAME record:
   - Type: `CNAME`
   - Name: `perimenopause`
   - Target: `cname.vercel-dns.com`
   - Proxy status: DNS only (gray cloud)
   - TTL: Auto
3. Save

**Wait**: 5-30 minutes for DNS propagation

### Step 7: Verify SSL

1. In Vercel, SSL should auto-provision
2. Visit `https://perimenopause.yourdomain.com`
3. Should load with green padlock (SSL secured)

**If SSL fails**:
- Wait up to 24 hours
- Check DNS is correct (no typos)
- Ensure Cloudflare proxy is OFF for this record

---

## Part 3: Deploy Additional Landing Pages

For each new landing page:

### Quick Process

1. **Create new Next.js project**
   ```bash
   npx create-next-app@latest pcos-guide
   ```

2. **Build landing page** (use your template)

3. **Create GitHub repo**
   ```bash
   gh repo create pcos-guide --public --source=. --push
   ```

4. **Deploy to Vercel**
   - Vercel dashboard → New Project
   - Import `pcos-guide` repo
   - Deploy

5. **Add subdomain**
   - Vercel project → Settings → Domains
   - Add: `pcos.yourdomain.com`

6. **Update DNS**
   - Cloudflare → Add CNAME record
   - Name: `pcos`
   - Target: `cname.vercel-dns.com`

7. **Done!** Visit `https://pcos.yourdomain.com`

### Repeat for Every New Guide

Each guide gets:
- Own Git repo
- Own Vercel project
- Own subdomain
- Isolated deployments (changes don't affect others)

---

## Part 4: Automated Deployments (Git → Vercel)

### How it Works

After initial setup, Vercel auto-deploys on Git push:

```
1. Make changes locally
2. Commit and push to GitHub
3. Vercel auto-detects push
4. Runs build
5. Deploys to production
6. Live in ~2 minutes
```

### Branch Deployments

**Production** (main branch):
- `main` branch → `subdomain.yourdomain.com`

**Preview** (other branches):
- `feature-branch` → `project-name-git-feature-branch.vercel.app`
- Perfect for testing before merging

### Manual Deploy

If needed:
```bash
# From project directory
vercel --prod
```

---

## Part 5: Environment Variables

### Common Variables

**Google Analytics**:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**ConvertKit** (Email):
```
CONVERTKIT_API_KEY=your_api_key
CONVERTKIT_FORM_ID=your_form_id
```

**Gumroad**:
```
NEXT_PUBLIC_GUMROAD_PRODUCT_ID=product_xyz
```

### Adding to Vercel

**Via Dashboard**:
1. Project → Settings → Environment Variables
2. Add key/value pairs
3. Select environment (Production, Preview, Development)
4. Save

**Via CLI**:
```bash
vercel env add NEXT_PUBLIC_GA_ID
# Enter value when prompted
```

**Via `.env.local` (local development)**:
```bash
# .env.local (never commit this file!)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
CONVERTKIT_API_KEY=sk_abc123
```

Add to `.gitignore`:
```
.env.local
```

### Accessing in Code

```typescript
// Public variables (exposed to browser)
const gaId = process.env.NEXT_PUBLIC_GA_ID;

// Server-only variables (API routes, server components)
const apiKey = process.env.CONVERTKIT_API_KEY;
```

---

## Part 6: Custom Domain for Multiple Projects (Advanced)

### Scenario: One Domain, Path-Based Routing

Instead of subdomains:
```
yourdomain.com/perimenopause
yourdomain.com/pcos
yourdomain.com/fertility
```

**Not recommended** because:
- Requires monorepo or reverse proxy
- All pages deploy together
- More complex routing
- Harder to manage

**Better approach**: Stick with subdomains (separate deployments).

---

## Part 7: Monitoring & Analytics

### Vercel Analytics (Built-in)

**Enable**:
1. Project → Analytics tab
2. Enable Vercel Analytics
3. Installs automatically

**See**:
- Page views
- Top pages
- Countries
- Devices

**Cost**: Free tier includes 100k events/month

### Google Analytics 4

**Setup**:
1. Create GA4 property
2. Get Measurement ID (`G-XXXXXXXXXX`)
3. Add to environment variables
4. Add to Next.js config

**In `app/layout.tsx`**:
```typescript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Conversion Tracking

Track key events:
```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, params?: object) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Usage:
trackEvent('email_submit', { method: 'landing_page' });
trackEvent('cta_click', { location: 'hero_section' });
```

---

## Part 8: Troubleshooting

### Issue: DNS Not Propagating

**Check**:
```bash
dig perimenopause.yourdomain.com
# Should show CNAME to cname.vercel-dns.com
```

**Solutions**:
- Wait (can take up to 24 hours)
- Flush DNS cache: `sudo dscacheutil -flushcache` (Mac)
- Check for typos in DNS record
- Verify Cloudflare proxy is OFF

### Issue: SSL Certificate Not Provisioning

**Solutions**:
- Wait up to 24 hours
- Check DNS record is correct
- Verify domain is added in Vercel
- Remove and re-add domain in Vercel
- Check CAA records (shouldn't block Let's Encrypt)

### Issue: 404 on Deployment

**Check**:
- Build succeeded in Vercel dashboard
- Check build logs for errors
- Verify `package.json` has correct build script
- Test locally first (`npm run build`)

### Issue: Environment Variables Not Working

**Solutions**:
- Check variable names (typos?)
- Prefix with `NEXT_PUBLIC_` if needed in browser
- Redeploy after adding variables
- Check correct environment (Production vs Preview)

### Issue: Slow Page Load

**Check**:
- Lighthouse score (Chrome DevTools)
- Image sizes (use next/image)
- JavaScript bundle size
- Unused dependencies

**Optimize**:
```bash
npm run build
# Check bundle size output
# Remove unused packages
npm prune
```

---

## Part 9: Cost Breakdown

### Vercel Pricing

**Hobby (Free)**:
- Unlimited projects
- 100 GB bandwidth/month
- 100 GB-hours execution/month
- Enough for starting out

**Pro ($20/month per user)**:
- 1 TB bandwidth
- 1000 GB-hours execution
- Analytics included
- Team collaboration
- Upgrade when you hit limits

### Domain Costs

- Domain: $10-15/year
- Unlimited subdomains: Free
- SSL certificates: Free (Let's Encrypt via Vercel)

### Total Monthly Cost (Starting Out)

- Vercel: $0 (free tier)
- Domain: $1.25/month ($15/year ÷ 12)
- Google Workspace: $6/user/month (if using)

**Total**: ~$7/month to start

Scale up to Pro only when traffic justifies it.

---

## Part 10: Deployment Checklist

Before deploying any landing page:

### Pre-Deployment
- [ ] Test locally (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All links work
- [ ] Forms submit correctly
- [ ] Environment variables set
- [ ] Analytics integrated
- [ ] SEO meta tags added

### Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Build succeeds on Vercel
- [ ] Environment variables added
- [ ] Custom domain added
- [ ] DNS record created
- [ ] SSL certificate active

### Post-Deployment
- [ ] Visit live URL (works?)
- [ ] Test on mobile device
- [ ] Test form submissions
- [ ] Verify analytics tracking
- [ ] Test checkout flow (Gumroad)
- [ ] Check page speed (Lighthouse)
- [ ] Monitor error logs

---

## Quick Reference Commands

```bash
# Create new Next.js app
npx create-next-app@latest project-name

# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Add environment variable
vercel env add VARIABLE_NAME

# View deployment logs
vercel logs

# List all projects
vercel list

# Pull environment variables
vercel env pull
```

---

## Next Steps

1. ✅ Deploy first landing page to test workflow
2. ✅ Verify subdomain setup works
3. ✅ Test complete checkout flow
4. ✅ Set up analytics tracking
5. ✅ Monitor initial traffic/conversions
6. 📈 Deploy additional landing pages as you create guides
7. 🔄 Iterate based on conversion data

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Cloudflare Docs**: https://developers.cloudflare.com/dns
- **Vercel Discord**: https://vercel.com/discord

---

**You're ready to deploy!** Start with one landing page, verify everything works, then scale to multiple subdomains as you create more guides.
