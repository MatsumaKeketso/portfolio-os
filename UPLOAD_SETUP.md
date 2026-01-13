# Upload Functionality Setup Guide

## Prerequisites

The upload functionality requires a Supabase account and project. If you don't have one:

1. Go to [https://supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project

## Step 1: Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon in sidebar)
3. Click on **API** in the settings menu
4. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 2: Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important:** Restart your dev server after adding environment variables:
   ```bash
   npm run dev
   ```

## Step 3: Set Up Storage Bucket

The storage bucket and policies are already defined in `storage-setup.sql`. Run this SQL in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Click on **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy and paste the contents of `storage-setup.sql`
5. Click **Run** or press `Ctrl+Enter`

This will create:
- A public storage bucket named `portfolio-files`
- Policies allowing public read access
- Policies allowing authenticated users to upload/delete

## Step 4: Test Upload Functionality

### Test Background Upload
1. Open the app
2. Click on the desktop customization icon (or open Settings)
3. Go to the "Desktop" or "Appearance" tab
4. Click "Upload Custom Background"
5. Select an image file (< 5MB)
6. **You should see:**
   - Upload progress bar
   - File name
   - Progress percentage (0-100%)
   - Success checkmark when complete

### Test File Explorer Upload
1. Open File Explorer from desktop
2. Click the upload button in the toolbar
3. Select image/video files
4. **You should see:**
   - Toast notification in bottom-right corner
   - Upload progress for each file
   - Files appear in the explorer after upload

### Test Drag & Drop
1. Open File Explorer
2. Drag an image file from your computer
3. Drop it into the File Explorer window
4. **You should see:**
   - Upload progress toast
   - File appears when upload completes

## Troubleshooting

### "Not working" - Check these:

1. **Console Errors:**
   - Open browser DevTools (F12)
   - Check the Console tab for error messages
   - Common errors:
     - `fetch failed` - Network issue or invalid credentials
     - `Invalid API key` - Check your VITE_SUPABASE_ANON_KEY
     - `Bucket not found` - Run storage-setup.sql

2. **Network Tab:**
   - Open browser DevTools → Network tab
   - Try uploading a file
   - Look for requests to `*.supabase.co`
   - Check if they return 200 OK or error codes

3. **Environment Variables:**
   ```bash
   # Verify .env file exists and has content
   cat .env

   # Variables must start with VITE_ to be accessible in Vite apps
   ```

4. **Dev Server Restart:**
   - After changing `.env`, you MUST restart the dev server
   - Stop server (Ctrl+C) and run `npm run dev` again

5. **Fallback Mode:**
   - If Supabase is not configured, uploads will fall back to base64/localStorage
   - This works but has size limitations
   - Check console for "Using placeholder credentials" message

### Still Not Working?

Check these files have proper imports:

```typescript
// CustomizationSettings.tsx
import { uploadFiles, UploadProgress as UploadProgressType } from '../lib/uploadUtils';
import { UploadProgress } from './UploadProgress';

// AdminPanel.tsx
import { uploadFile, uploadFiles, UploadProgress as UploadProgressType } from '../lib/uploadUtils';
import { UploadProgress } from './UploadProgress';

// Settings.tsx
import { uploadFile, UploadProgress as UploadProgressType } from '../../lib/uploadUtils';
import { UploadProgress } from '../UploadProgress';

// FileExplorer.tsx
import { uploadFile, UploadProgress as UploadProgressType } from '../../lib/uploadUtils';
import { UploadProgressToast } from '../UploadProgress';
```

## Testing Without Supabase

If you want to test without setting up Supabase:

1. The app will automatically fall back to base64/localStorage
2. You won't see upload progress (instant)
3. File size is limited by browser localStorage
4. Check console for: `"Using placeholder credentials"`

## Features

Once set up, you'll have:

- ✅ Real-time upload progress (0-100%)
- ✅ Multiple file uploads with individual progress
- ✅ File validation (type and size)
- ✅ Error handling with user feedback
- ✅ Upload state management (prevents duplicate uploads)
- ✅ Visual progress indicators
- ✅ Drag & drop support
- ✅ Cloud storage via Supabase
- ✅ Public URLs for all uploaded files

## Next Steps

After setup:
1. Test uploading backgrounds in Customization Settings
2. Test uploading icons in Admin Panel
3. Test uploading files in File Explorer
4. Test drag & drop in File Explorer
5. Check Supabase Storage dashboard to see uploaded files
