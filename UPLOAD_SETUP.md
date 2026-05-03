# GenOS Upload Setup Guide (Firebase)

This guide outlines how to set up the file upload functionality for GenOS using Firebase.

## Prerequisites

GenOS uses Firebase for authentication, database (Firestore), and file storage.

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password).
3. Enable **Cloud Firestore** in production or test mode.
4. Enable **Cloud Storage**.

## Step 1: Firebase Configuration

1. In the Firebase Console, go to **Project Settings** (gear icon).
2. Under "Your apps", click the **Web** icon (</>) to register a new app.
3. Copy the `firebaseConfig` object. It should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 2: Configure Environment Variables

1. Create a `.env` file in your project root.
2. Add the values from your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_PASSWORD=your_admin_password
```

3. Restart your development server: `npm run dev`.

## Step 3: Storage Rules (Security)

To allow visitors to upload images to the Visitor Gallery while restricting other areas to admins, set your Firebase Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to everything
    match /{allPaths=**} {
      allow read;
    }
    
    // Visitor Gallery: allow anyone to upload images
    match /portfolio-files/visitor-gallery/{fileName} {
      allow write: if request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Admin areas: allow only authenticated users to write
    match /portfolio-files/{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}
```

## Step 4: Testing Uploads

### Background Upload
1. Open **Settings** -> **Appearance**.
2. Click **Upload Image** in the Desktop Background section.
3. Select an image (< 5MB).
4. Verify the progress bar appears and the background updates.

### File Explorer
1. Open **File Explorer**.
2. Navigate to **Visitor Gallery**.
3. Use the upload button or drag & drop an image.
4. Verify the file appears and is stored in Firebase Storage under `portfolio-files/visitor-gallery/`.

## Troubleshooting

- **CORS Errors**: If you see CORS errors in the console, you may need to configure CORS for your Firebase Storage bucket via the Google Cloud CLI.
- **Permission Denied**: Ensure you are logged in (Ctrl+Shift+A) for admin uploads, or that you are uploading to the `visitor-gallery` path for public uploads.
- **Progress Stuck**: Check the network tab in DevTools to see if requests are being blocked.

## Features

- ✅ Real-time upload progress (0-100%)
- ✅ Multiple file uploads with individual progress
- ✅ File validation (type and size)
- ✅ Firebase Storage integration
- ✅ Public URLs generated automatically
- ✅ Drag & Drop support
