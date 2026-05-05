# Claude Handoff: System Updates

## Overview

This handoff instructs the next development agent to continue building the web-based operating system portfolio through scoped system-wide updates.

The updates affect apps, editable owner/system information, CV content, background behavior, Admin Panel persistence, milestone editing, taskbar icon configuration, and user permissions.

## Purpose

The goal is to improve the operating system experience without starting another broad redesign.

Work should be done in relation to the existing codebase and verified against affected flows because these changes can break apps, settings, uploads, authentication, window behavior, and Firestore persistence.

## User Experience

The system should continue to feel like an operating system, not a regular portfolio site.

Users should experience:

- Clear apps with useful content.
- Smooth window dragging.
- Engaging but performant backgrounds.
- A less confusing settings and admin boundary.
- Persistent background uploads.
- Editable system/about information for the owner.
- A more complete CV app populated from the provided CV.
- Mobile-friendly milestone management.
- Correct admin permissions after sign-in.

## Functional Behavior

### 0. Upload Persistence Production Blocker

Status: critical unresolved issue.

Uploaded content is not persisting.

Observed behavior:

- The owner uploads images/media inside the system.
- The uploaded items appear temporarily.
- After refreshing the site, uploaded items disappear.
- The project should already contain a lot of uploaded media based on prior usage, but the media is not available after reload.

This is a production-readiness blocker.

The system should not be considered production ready until uploads persist reliably.

Required behavior:

- Uploaded images/media must be saved to persistent storage.
- Persistent file metadata must be saved to the database.
- Uploaded items must reload after refresh.
- Uploaded items must remain available across sessions.
- Owner/admin uploads intended for public viewing must appear for visitors.
- Owner/admin uploads intended as downloadable assets must remain downloadable.
- Failed uploads must show an error rather than appearing successful and then disappearing.

The owner has files that should become part of what visitors see when they visit the website. The system must support this owner-curated public media and download surface.

Investigate all upload flows, not only background uploads:

- File Explorer uploads.
- Visitor Gallery uploads.
- Background uploads.
- Milestone image uploads.
- Any Admin Panel media uploads.
- Any CV/downloadable asset uploads.
- Any public media/download surfaces.

Do not treat this as a UI-only bug. Verify the full persistence path:

1. File is uploaded to Firebase Storage or the approved persistent storage location.
2. Download URL or storage path is recorded.
3. Firestore or the relevant persistent database stores metadata.
4. Store initialization reloads that metadata.
5. UI renders the persisted records after refresh.
6. Public/visitor permissions allow reading approved public assets.
7. Admin/private permissions do not block owner access.

If the current implementation only stores uploaded files in local component state or a non-persisted Zustand store, replace or extend that flow with persistent storage.

Actioned mitigation on 2026-05-05:

- File system, background, selected background, and profile/milestone metadata now write local backups immediately.
- These stores merge local backups with Firestore data on load.
- After login, the app refetches profile, file system, apps, and backgrounds so recovered owner data can sync back to Firebase.
- Uploads now use explicit Storage folders for `file-explorer`, `desktop-uploads`, `backgrounds`, `milestones`, and `visitor-gallery`.

Still required:

- Browser-test the full persistence path.
- Confirm Firestore records are created.
- Confirm Storage files exist in the expected folders.
- Confirm refresh restores uploaded items.
- Confirm public/visitor pages can read approved public assets.
- Close this blocker only after the production path is verified, not only after typecheck.

### 1. About App

Status: mostly complete, content editing needed.

Keep the existing About app structure.

Add a small edit surface for owner-controlled fields. Inline editing is acceptable if it is simple and does not overcomplicate the app.

Editable information should include:

- Generative Studio details.
- Kagetsu details.
- Email address.
- Relevant links.

Existing links already include a GitHub link for Kagetsu. Generative Studio also needs an editable website link if not already editable.

Do not turn the About app into a large CMS. This should be a constrained editing surface.

### 2. CV App

Status: structure exists, content needs upgrade.

The CV app currently feels bland.

When the owner provides the CV, populate the CV app with relevant information directly so the owner does not need to re-enter everything manually through Admin Panel.

Keep the current CV tabs unless implementation requires small adjustments:

- Profile.
- Experience.
- Skills.
- Projects.
- Contact.
- Files.

Use the provided CV as the source of truth once available.

Current CV source:

- `C:/Users/keket/Desktop/GenerativeStudio/KEKETSO MATSUMA'S Full Stack Developer & UIUX Designer.pdf`

Extract the relevant information from this PDF and populate the CV app with it. Do not require the owner to manually re-enter the same CV information through Admin Panel.

### 3. File System And Sitemap

Status: file system is good, sitemap/sidebar visual treatment needs refinement.

The current sitemap or side navigation has a blue background that is too prominent.

Refine it so it is:

- Darker.
- More tinted.
- Better blended with the rest of the OS background.
- Still readable.

Do not remove useful File Explorer behavior while changing the visual treatment.

### 4. Window Background Performance

Status: blur is visually interesting but performance risk is confirmed by user feedback.

Dragging windows currently lags.

Replace heavy blurred window backgrounds with solid or low-cost gradient surfaces.

The goal is to preserve some of the visual interest created by blur without using expensive backdrop blur during drag.

Acceptable approaches:

- Solid dark window body.
- Subtle static gradient.
- Token-based surface color with a low-cost overlay.
- Optional reduced effect while dragging.

Avoid broad `backdrop-blur-xl` usage on app window bodies.

Related visual regression to investigate:

- Window title/header drag areas currently read as transparent or visually absent in the running app.
- The login form/panel also reads as transparent or visually absent.
- This creates confusion when surfaces overlap because users cannot clearly tell which element is on top.
- Fix this in the same surface/window pass rather than as an isolated patch.
- The solution must use design tokens, not arbitrary hex classes.
- Do not assume changing a class in `Window.tsx` or `LoginModal.tsx` alone is enough; verify in the browser because previous token-level changes did not visibly resolve the issue.

### 5. Settings And Admin Panel Boundary

Status: confusing but partially understood.

Settings and Admin Panel are separate concepts:

- Settings app controls system preferences.
- Admin Panel controls owner/admin content and configuration.

Admin Panel currently slides from the bottom and needs a solid background treatment.

Keep the Admin Panel as its own management space. Do not merge it into Settings unless explicitly requested later.

### 6. Background Uploads And Persistence

Status: broken or incomplete. Part of the broader upload persistence production blocker.

Background uploads are not persisting to Firestore.

Fix the upload flow so uploaded backgrounds persist and remain available after refresh/sign-in.

Verify:

- Upload succeeds.
- Firestore record is created or updated.
- Storage URL is saved.
- Background list reloads from persisted data.
- Selected background persists.

The current default backgrounds are boring. Add better background options after persistence is reliable.

Background options may include:

- Solid colors.
- Gradients.
- Patterns.
- More engaging static visual treatments.

Do not add heavy animated backgrounds before resolving drag performance.

### 7. Taskbar Icon Configuration

Status: unclear configuration path.

The taskbar currently uses a square grid icon.

Add or expose a clear admin/settings path to update the taskbar/start icon.

Do not hardcode a new icon without also documenting where it is configured.

New asset direction:

- The owner added an asset folder with three logo variants: black, red, and white.
- Locate these assets before implementation.
- Use the appropriate logo for the taskbar/start icon and brand surfaces.
- If the exact asset paths are unclear, document the paths once found instead of inventing names.

The current start button border and active states are still visually blue and do not fully follow theme changes. Fix this so the start button uses the same brand/theme token path as the rest of the system.

### 7A. Brand Theme Direction

Status: new direction.

Use Generative Studio as the default theme.

The default theme should use red as the primary brand color.

For now, limit active theming to one main brand color so the system feels coherent.

Keep the structure flexible enough to support multiple color variants later, but do not expose or depend on a broad multi-theme experience until the default brand system is stable.

Required behavior:

- Default theme preset is `Generative Studio`.
- Generative Studio theme uses red brand colors.
- Blue should no longer appear as the active/default system accent unless it belongs to a deliberate secondary state.
- Start button, active states, primary buttons, focus states, and selected items must all source from the same semantic brand token path.
- Theme preset naming may include other presets later, but Generative Studio must be the default.
- Do not use direct hex values in components. Add or reuse primitive tokens, then map them through semantic brand tokens.

### 8. Milestones

Status: needs mobile-friendly editing improvements.

Milestones should be quick to add.

The form should support:

- Caption.
- Image.
- Description.
- Links, if already supported.
- Category.
- Tags.

Tags should use a selectable dropdown rather than only free-text entry.

The milestone experience must be mobile-friendly.

### 9. Admin/User Permissions

Status: partially actioned on 2026-05-05.

Opening Settings currently produces a missing or insufficient permissions error.

The sign-in flow does not clearly establish whether the signed-in user is the owner/admin or a standard user.

Fix the user role model so the app can reliably distinguish:

- Standard user.
- Superuser/admin owner.

The superuser account belongs to the project owner.

Admin-only reads and writes should only run when the signed-in user is confirmed as admin.

Standard users should not trigger permission errors from admin-only listeners or writes.

Actioned workflow:

- `admin@os.com` is the superuser account.
- Any other email signs in as a guest.
- New guest emails create a limited Firebase email/password account automatically.
- Existing guest emails must use their existing password.
- Guests can explore and participate only through guest-safe flows.
- Guests cannot open Admin Panel.
- Guests cannot edit owner profile, portfolio, resume, skills, contact, settings, protected File Explorer areas, or system content.
- Superuser-only UI now checks `isAdmin`, not only `isAuthenticated`.
- Firestore rules now allow public reads but restrict `os-site_content` writes and feedback moderation to `admin@os.com`.
- Storage rules now allow public reads, visitor-gallery image uploads, and restrict owner-curated asset writes to `admin@os.com`.

Operational requirements:

- Firebase Email/Password authentication must be enabled.
- The `admin@os.com` account must exist in Firebase Auth with the correct password.
- Updated `firestore.rules` and `storage.rules` must be deployed before production verification.
- If `VITE_ADMIN_EMAIL` is changed, rules must be updated too; current rules intentionally use `admin@os.com` because that is the confirmed superuser email.

## Rules & Constraints

Do not overhaul the entire system in one pass.

Work in small slices and verify each slice.

Do not invent new names for the system, apps, roles, or subsystems.

Use existing generic terms where possible:

- About app.
- CV app.
- Settings app.
- Admin Panel.
- File Explorer.
- Backgrounds.
- Milestones.
- Standard user.
- Superuser/admin.

`Kagetsu` is user-provided terminology, but its exact relationship to `Keketso` and the portfolio identity is undefined. Do not rename it or expand on it without clarification.

Avoid heavy blur on draggable windows.

Do not allow visitor-created text files, unsafe links, SVG uploads, executable files, HTML, scripts, or unknown content types.

Use Firebase only. Do not introduce Supabase.

Run typecheck after changes.

## Dependencies

Likely affected files and systems:

- `src/components/apps/AboutOS.tsx`
- `src/components/apps/CV.tsx`
- `src/components/apps/FileExplorer.tsx`
- `src/components/apps/Settings.tsx`
- `src/components/AdminPanel.tsx`
- `src/components/Window.tsx`
- `src/components/Taskbar.tsx`
- `src/store/desktopStore.ts`
- `src/store/userStore.ts`
- `src/store/fileStore.ts`
- `src/lib/firebase.ts`
- Firebase Auth, Firestore, and Storage rules.
- Existing docs:
  - `docs/PROJECT_KNOWLEDGE_BASE.md`
  - `docs/IMPLEMENTATION_PROGRESS.md`
  - `docs/OS_BEHAVIOR_MODEL.md`

## Edge Cases

Changing window surfaces can affect every app.

Changing Firestore reads can introduce permission errors for standard users.

Changing background persistence can affect default backgrounds, uploaded backgrounds, and selected background state.

Changing Admin Panel layout can break milestone and background workflows.

Changing taskbar icon configuration can affect start menu/taskbar affordance recognition.

Inline editing About app content must not expose admin-only writes to standard users.

Mobile milestone forms must remain usable with the on-screen keyboard.

## Open Questions

- What is the correct email address for the About app?
- What is the Generative Studio website URL?
- Is `Kagetsu` the correct public label, and how should it relate to Keketso in the About app?
- What GitHub URL should be shown for Kagetsu if the existing one is wrong?
- Should About app editable content live in Firestore, local config, or existing user/system store?
- What is the preferred taskbar/start icon?
- Who exactly is the superuser account in Firebase Auth?
- Should admin role be stored as a custom claim, Firestore profile field, allowlisted UID, or environment/config value?
- What tags should be available in the milestone dropdown?
- What maximum image size should milestone uploads use?

## Recommended Work Order

1. Fix admin/user permission boundary so standard users do not trigger insufficient-permission errors.
2. Fix background upload persistence in Firestore and Storage.
3. Replace heavy window backdrop blur with performant solid/gradient surfaces.
4. Add constrained About app editing for owner/system information.
5. Expose taskbar/start icon configuration.
6. Improve Milestones form, tag selection, and mobile layout.
7. Populate CV app after the owner provides the CV.
8. Tune File Explorer sitemap/sidebar color treatment.
9. Add more engaging persisted background presets.
