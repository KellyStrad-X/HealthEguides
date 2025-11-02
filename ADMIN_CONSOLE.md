# Admin Console Guide

## Overview

The admin console allows you to manage your ebook guides through a simple web interface at `/admin`.

## Features

- ✅ **Password Protected** - Simple password authentication
- ✅ **Create Guides** - Add new guides with metadata (title, description, price, etc.)
- ✅ **Edit Guides** - Update existing guide information
- ✅ **Delete Guides** - Remove guides from the catalog
- ✅ **Upload PDFs** - Upload PDF ebooks for each guide
- ✅ **Firestore Storage** - Guide metadata stored in Firebase Firestore
- ✅ **PDF Storage** - PDFs stored in Firebase Storage (with local fallback)

## Setup

### 1. Set Admin Password

Add your admin password to `.env.local`:

```bash
ADMIN_PASSWORD=your_secure_password_here
```

**Important:** Choose a strong password and never commit it to git!

### 2. Configure Firebase (Optional but Recommended)

For production use, you should configure Firebase to store guide data:

Add to `.env.local`:
```bash
# Option 1: Full service account JSON
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Option 2: Individual fields
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

See `FIREBASE_SETUP.md` for detailed Firebase configuration instructions.

### 3. Access the Admin Console

Navigate to: `http://localhost:3000/admin` (or your production URL)

Enter your admin password to access the dashboard.

## Usage

### Creating a Guide

1. Click **"+ Create New Guide"**
2. Fill in the required fields:
   - **ID**: Unique identifier (e.g., "pcos-guide")
   - **Slug**: URL path (e.g., "pcos")
   - **Title**: Display name (e.g., "PCOS Management Guide")
   - **Description**: Short description for marketing
   - **Emoji**: Icon for the guide (e.g., "💜")
   - **Price**: Cost in USD (e.g., 4.99)
   - **Category**: Guide category (e.g., "Women's Health")
   - **Features**: List of key features/benefits
   - **Keywords**: SEO keywords
   - **Meta Description**: SEO description
3. Click **"Create Guide"**

### Uploading a PDF

1. Find the guide in the list
2. Click **"Upload PDF"**
3. Select your PDF file
4. The PDF will be uploaded and associated with the guide

**PDF Storage:**
- If Firebase Storage is configured, PDFs are stored there
- Otherwise, PDFs are stored locally in `public/guides/`
- PDF URL is automatically saved to the guide record

### Editing a Guide

1. Click **"Edit"** on any guide
2. Modify the fields
3. Click **"Update Guide"**

### Deleting a Guide

1. Click **"Delete"** on any guide
2. Confirm the deletion

**Warning:** This permanently deletes the guide metadata. The PDF file will remain in storage.

## Data Storage

### With Firebase (Recommended for Production)

- **Guide Metadata**: Stored in Firestore collection `guides`
- **PDF Files**: Stored in Firebase Storage at `guides/{guideId}.pdf`
- **Access Anywhere**: Data accessible from any environment
- **Automatic Backups**: Firebase handles backups

### Without Firebase (Local Development)

- **Guide Metadata**: Falls back to hardcoded guides in `lib/guides.ts`
- **PDF Files**: Stored in `public/guides/` directory
- **Warning**: Changes won't persist if Firebase isn't configured

## Security

### Password Protection

- Admin password is checked server-side via `/api/admin/auth`
- Session is stored in browser `sessionStorage`
- Session clears when browser/tab is closed

### Production Security Recommendations

1. **Use a strong admin password** (minimum 16 characters)
2. **Enable Firebase security rules** to restrict write access
3. **Use HTTPS** in production (never HTTP)
4. **Consider adding IP whitelist** for extra security
5. **Rotate admin password** periodically

### Firebase Security Rules

Add these rules to Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow server-side access (admin SDK)
    match /guides/{guideId} {
      allow read: if true; // Public read
      allow write: if false; // Only admin SDK can write
    }
  }
}
```

## Troubleshooting

### "Admin password not configured" Error

**Solution:** Add `ADMIN_PASSWORD=your_password` to `.env.local` and restart the dev server.

### "Failed to fetch guides" or Empty Guide List

**Possible Causes:**
1. Firebase not configured - guides will fall back to hardcoded list
2. Firebase credentials incorrect - check your .env.local
3. No guides in Firestore yet - create your first guide

**Solution:** Either configure Firebase or guides will use the hardcoded list in `lib/guides.ts`

### PDF Upload Fails

**Possible Causes:**
1. Firebase Storage not configured
2. File too large (check Firebase Storage limits)

**Solution:**
- PDF will fallback to local storage if Firebase fails
- Check `public/guides/` directory for uploaded PDFs
- Configure Firebase Storage for production use

### Module Not Found Errors on Client

**Cause:** firebase-admin is a server-only package

**Solution:** Make sure you're not importing firebase-admin in client components. Use API routes instead.

## API Endpoints

The admin console uses these API endpoints:

- `POST /api/admin/auth` - Password authentication
- `GET /api/admin/guides` - Fetch all guides
- `POST /api/admin/guides` - Create new guide
- `PUT /api/admin/guides` - Update existing guide
- `DELETE /api/admin/guides` - Delete guide
- `POST /api/admin/upload-pdf` - Upload PDF file

All endpoints require prior authentication (except auth).

## Migrating Existing Guides to Firestore

If you have guides in `lib/guides.ts` that you want to migrate to Firestore:

1. Access the admin console
2. Create each guide manually using the form
3. Upload the corresponding PDF for each guide
4. Once all guides are in Firestore, they'll automatically be used

Or, use this script (run once):

```typescript
// scripts/migrate-guides.ts
import { guides } from '../lib/guides';
import { adminDb } from '../lib/firebase-admin';

async function migrateGuides() {
  for (const guide of guides) {
    await adminDb.collection('guides').doc(guide.id).set({
      ...guide,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`Migrated: ${guide.title}`);
  }
}

migrateGuides();
```

## Future Enhancements

Potential features to add:

- [ ] Multi-user support with different permission levels
- [ ] Bulk upload/import guides from CSV
- [ ] Preview guide before publishing
- [ ] Analytics dashboard (sales, downloads, etc.)
- [ ] Draft vs. Published status for guides
- [ ] Version history for guide updates
- [ ] Image upload for guide covers
- [ ] Rich text editor for descriptions
- [ ] Email notification when new guide is published

---

**Need Help?**

If you encounter issues, check:
1. Console logs (browser dev tools)
2. Server logs (terminal running Next.js)
3. Firebase console (if using Firebase)
