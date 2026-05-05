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

### 5. Settings And Admin Panel Boundary

Status: confusing but partially understood.

Settings and Admin Panel are separate concepts:

- Settings app controls system preferences.
- Admin Panel controls owner/admin content and configuration.

Admin Panel currently slides from the bottom and needs a solid background treatment.

Keep the Admin Panel as its own management space. Do not merge it into Settings unless explicitly requested later.

### 6. Background Uploads And Persistence

Status: broken or incomplete.

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

Status: blurry boundary causing errors.

Opening Settings currently produces a missing or insufficient permissions error.

The sign-in flow does not clearly establish whether the signed-in user is the owner/admin or a standard user.

Fix the user role model so the app can reliably distinguish:

- Standard user.
- Superuser/admin owner.

The superuser account belongs to the project owner.

Admin-only reads and writes should only run when the signed-in user is confirmed as admin.

Standard users should not trigger permission errors from admin-only listeners or writes.

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
