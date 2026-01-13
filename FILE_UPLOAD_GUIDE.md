# File Upload & Authentication Setup Guide

## Overview

This guide will help you set up file uploads with proper authentication and permissions so that:
- ✅ Signed-in users can upload files from anywhere
- ✅ Everyone (including unauthenticated visitors) can view uploaded files
- ✅ Signed-in users have full read/write permissions on all files and folders

## Prerequisites

1. **Supabase Account** - Create one at [supabase.com](https://supabase.com)
2. **Environment Variables** - `.env` file with your Supabase credentials
3. **Node.js 18+** - For running the development server

---

## Step 1: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these values:**
1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon) → **API**
3. Copy the **Project URL** and **anon/public key**

**Important:** Restart your dev server after creating/updating `.env`:
```bash
npm run dev
```

---

## Step 2: Database Setup

Run the database setup script in your Supabase SQL Editor:

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** or press `Ctrl+Enter`

This creates:
- `site_content` table for file metadata
- Row Level Security (RLS) policies
- Public read access for everyone
- Authenticated write access for signed-in users

---

## Step 3: Storage Setup

Run the storage setup script in your Supabase SQL Editor:

1. In the SQL Editor, create a **New Query**
2. Copy and paste the contents of `storage-setup.sql`
3. Click **Run** or press `Ctrl+Enter`

This creates:
- `portfolio-files` storage bucket (public bucket)
- **Public READ** - Anyone can view files
- **Authenticated INSERT** - Signed-in users can upload
- **Authenticated UPDATE** - Signed-in users can modify files
- **Authenticated DELETE** - Signed-in users can delete files

### Verify Storage Setup

Run this query to verify your policies:

```sql
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%portfolio%';
```

You should see 4 policies:
1. `Anyone can read portfolio files`
2. `Authenticated users can upload files`
3. `Authenticated users can update files`
4. `Authenticated users can delete files`

---

## Step 4: Create Admin User

You need to create an admin user account for authentication:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - **Email:** `admin@genos.dev` (or your preferred email)
   - **Password:** Create a strong password
   - **Auto Confirm User:** ✓ Check this box
4. Click **Create User**

**Save these credentials!** You'll need them to sign in.

---

## Step 5: Sign In to Upload Files

### Method 1: Admin Panel (Recommended)

1. Start your dev server: `npm run dev`
2. Open the app in your browser
3. Press `Ctrl + Shift + A` to open the Admin Panel
4. Enter your credentials:
   - **Email:** `admin@genos.dev`
   - **Password:** Your password from Step 4
5. Click **Login**

### Method 2: Create a Login Component (Optional)

If you want a permanent login UI, you can create a login component:

```tsx
import { useAuthStore } from './store/authStore';

function Login() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('admin@genos.dev');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const result = await login(password, email);
    if (result.success) {
      alert('Logged in successfully!');
    } else {
      alert('Login failed: ' + result.error);
    }
  };

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

---

## Step 6: Test File Upload

### Upload via File Explorer

1. **Sign in** using the Admin Panel (`Ctrl + Shift + A`)
2. Open **File Explorer** from the desktop
3. Click the **Upload** button (or drag & drop files)
4. Select image or video files
5. Watch the upload progress
6. Files should appear in the explorer when done

### Upload via Drag & Drop

1. Open File Explorer
2. Drag files from your computer
3. Drop them into the File Explorer window
4. Progress toasts will appear in the bottom-right corner

### What Gets Uploaded

- **Images:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp`, `.ico`
- **Videos:** `.mp4`, `.webm`, `.mov`, `.avi`, `.mkv`
- **Max Size:** 100MB per file (configurable in `FileExplorer.tsx`)

---

## Step 7: Verify Public Access

To verify that uploaded files are publicly accessible:

1. Upload a file while signed in
2. **Sign out** from the Admin Panel
3. Open File Explorer again (as an unauthenticated visitor)
4. You should still see all uploaded files
5. You can view/preview files but cannot upload, delete, or modify

---

## Troubleshooting

### Upload fails with "Permission denied" or "403 Forbidden"

**Cause:** Not authenticated or policies not set up correctly

**Fix:**
1. Verify you're signed in: Check Admin Panel shows user info
2. Run `storage-setup.sql` again in Supabase SQL Editor
3. Check browser console for specific error messages
4. Verify bucket exists: Go to Supabase → **Storage** → Should see `portfolio-files`

### Upload succeeds but files don't appear

**Cause:** Database not saving file metadata

**Fix:**
1. Check browser console for errors
2. Verify `site_content` table exists
3. Run `supabase-setup.sql` again
4. Check Network tab for failed API calls

### "Invalid API key" error

**Cause:** Environment variables not set correctly

**Fix:**
1. Verify `.env` file exists in project root
2. Check values start with `VITE_` (required for Vite)
3. Restart dev server after changing `.env`
4. Clear browser cache and reload

### Files upload as base64 instead of to Supabase

**Cause:** Supabase not configured or offline fallback active

**Fix:**
1. Check console for "Using placeholder credentials" message
2. Verify `.env` variables are correct
3. Test Supabase connection: Try signing in via Admin Panel
4. Check Supabase project is not paused (free tier pauses after inactivity)

### Cannot see uploaded files in Supabase Storage

**Cause:** Files may be in database but not storage, or bucket permissions issue

**Fix:**
1. Go to Supabase → **Storage** → `portfolio-files`
2. You should see uploaded files listed there
3. If not visible, check if policies allow SELECT
4. Try manually uploading a test file via Supabase UI

---

## Advanced Configuration

### Change Upload Limits

Edit `src/components/apps/FileExplorer.tsx` line ~394:

```tsx
const result = await uploadFile(file, {
  maxSizeMB: 100,  // Change this value (default: 100MB)
  allowedTypes: ['image/*', 'video/*'],  // Add more types if needed
  onProgress: (progress) => {
    // ... progress handling
  },
});
```

### Add More File Types

Edit `src/lib/uploadUtils.ts`:

```tsx
const DEFAULT_ALLOWED_TYPES = [
  'image/*',
  'video/*',
  'application/pdf',  // Add PDF support
  'text/*',           // Add text files
];
```

### Make Bucket Private (Authenticated Read Only)

If you want to require authentication to view files:

1. Edit `storage-setup.sql`
2. Change the bucket creation to:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-files', 'portfolio-files', false);  -- false = private
```
3. Change the read policy to:
```sql
CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated  -- Only authenticated users
USING ( bucket_id = 'portfolio-files' );
```

### Enable Anonymous Uploads (Not Recommended for Production)

If you want to allow unauthenticated users to upload:

```sql
CREATE POLICY "Anyone can upload files"
ON storage.objects FOR INSERT
TO anon  -- Anonymous users
WITH CHECK ( bucket_id = 'portfolio-files' );
```

⚠️ **Security Warning:** This allows anyone to upload files, which could lead to abuse.

---

## Current Setup Summary

With the updated `storage-setup.sql`, your system has:

| Action | Authenticated Users | Unauthenticated Users |
|--------|-------------------|----------------------|
| **View Files** | ✅ Yes | ✅ Yes |
| **Upload Files** | ✅ Yes | ❌ No |
| **Update Files** | ✅ Yes | ❌ No |
| **Delete Files** | ✅ Yes | ❌ No |
| **Create Folders** | ✅ Yes (via File Explorer) | ❌ No |

---

## Security Best Practices

1. **Keep Your Credentials Secret**
   - Never commit `.env` to Git (it's in `.gitignore`)
   - Don't share your Supabase `service_role` key (not used in frontend)

2. **Use Strong Passwords**
   - Admin accounts should have strong, unique passwords
   - Consider enabling 2FA in Supabase dashboard

3. **Monitor Storage Usage**
   - Free tier: 1GB storage
   - Pro tier: 100GB storage
   - Set up alerts in Supabase dashboard

4. **Validate File Types**
   - Current setup only allows images/videos
   - Don't allow executable files (.exe, .sh, .bat)

5. **Rate Limiting**
   - Consider implementing rate limiting for uploads
   - Supabase has built-in rate limiting on auth endpoints

---

## Next Steps

After setup is complete:

1. ✅ Test uploading files while authenticated
2. ✅ Test viewing files while unauthenticated (sign out first)
3. ✅ Test creating folders and organizing files
4. ✅ Test file operations: rename, delete, move
5. ✅ Check Supabase Storage dashboard to see uploaded files

---

## Support

If you encounter issues:

1. Check browser console for error messages
2. Check Supabase logs: Dashboard → **Logs** → **API**
3. Verify all SQL scripts ran successfully
4. Review this guide's troubleshooting section
5. Check `.env` variables are correct

---

**Setup Complete!** You now have a fully functional file upload system with proper authentication and permissions. 🎉
