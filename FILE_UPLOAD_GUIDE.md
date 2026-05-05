# GenOS File Upload & Authentication Guide (Firebase)

This guide covers the implementation and configuration of file uploads and authentication in GenOS.

## Overview

GenOS uses Firebase to provide a secure and integrated file management experience:
- **Authentication**: Firebase Auth (Email/Password).
- **Metadata**: Firestore database (`os-site_content` collection).
- **Storage**: Firebase Cloud Storage.

## Permissions Model

| Action | Authenticated (Admin) | Unauthenticated (Visitor) |
|---|---|---|
| View All Files | ✅ Yes | ✅ Yes |
| Upload to Visitor Gallery | ✅ Yes | ✅ Yes (Images only) |
| Upload to other areas | ✅ Yes | ❌ No |
| Delete/Rename Files | ✅ Yes | ❌ No |
| Manage Applications | ✅ Yes | ❌ No |

## Step 1: Firebase Project Setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** and create an admin user:
   - Email: `admin@os.com`
   - Password: [Your Secure Password]
3. Enable **Cloud Firestore** and **Cloud Storage**.

## Step 2: Environment Configuration

Ensure your `.env` file contains the correct Firebase credentials:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_PASSWORD=...
```

## Step 3: Security Rules

### Firestore Rules
Ensure `os-site_content` collection is writable by admin and readable by all:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /os-site_content/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules
See [UPLOAD_SETUP.md](./UPLOAD_SETUP.md) for the recommended Storage rules that permit visitor uploads to the `visitor-gallery` path.

## Step 4: Admin Access

1. Open GenOS.
2. Press `Ctrl + Shift + A`.
3. Sign in with your admin credentials.
4. You can now manage files, applications, and settings with full permissions.

## Step 5: Visitor Gallery Behavior

The Visitor Gallery is a special location (`VISITOR_GALLERY_ID`) that allows anyone to upload images:
- Located at `/portfolio-files/visitor-gallery/` in Storage.
- Files are marked with `isVisitorOwned: true` in the metadata.
- Rejects non-image types (SVG, videos, etc.) for visitors.
- Max size is enforced at 5MB.

## Troubleshooting

### "Upload Failed" in File Explorer
- Verify you have a stable internet connection.
- Check if the file size exceeds the limit (100MB for admins, 5MB for visitors).
- Ensure your Firebase Storage rules are correctly deployed.

### "Permission Denied" (403)
- Check that you are signed in for admin-only areas.
- If uploading to Visitor Gallery, ensure the file is an image (`image/*`).

### Login Fails
- Verify your `.env` credentials match the Firebase project.
- Check if the user exists in the Firebase Auth dashboard.

## Next Steps

1. Visit [UPLOAD_SETUP.md](./UPLOAD_SETUP.md) for technical implementation details.
2. Review `src/lib/filePermissions.ts` to see how permission logic is handled on the frontend.
3. Use the **Admin Panel** to customize your applications and backgrounds.
