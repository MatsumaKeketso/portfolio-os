# Incremental Refinement Plan

> Goal: refine the existing codebase into GenOS section by section. Do not restart the design system every time there is new feedback. Use what exists, improve one layer at a time, and keep the OS usable throughout.

## Current Codebase Read

The codebase already contains several pieces of the new direction:

- `CV.tsx` exists.
- `AboutOS.tsx` exists.
- The default app list in `desktopStore.ts` already favors `File Explorer`, `CV`, `Browser`, `Settings`, `About This OS`, `Task Manager`, and utilities.
- Legacy apps are still lazy-loadable in `WindowManager.tsx`, which is good for compatibility.
- App metadata in `types.ts` already includes project fields and window/surface hints.
- `Visitor Gallery` exists as a protected root folder in `fileStore.ts`.
- `FileExplorer.tsx` already supports grid/list view, sort, search, upload, drag/drop, selection, rename, duplicate, delete, cut/copy/paste, and context menus.
- `surface.tsx` already defines `ChromeSurface`, `ContentSurface`, `FloatingSurface`, `InsetSurface`, and `MediaSurface`.
- `SystemRow.tsx` already defines a reusable row pattern.
- `StartMenu.tsx` already uses the black compact OS chrome and includes `GenOS` plus `Built by Generative Studio`.
- `Window.tsx` already supports drag, resize, minimize, maximize, snap zones, focus/z-index, and double-click title-bar maximize.

This means the next phase should be refinement and alignment, not a broad rewrite.

## Refinement Principle

Every new design or feature request should be sorted into one of these buckets:

1. **Token/config change**: belongs in theme or system preferences.
2. **Surface/component change**: belongs in shared UI like `Surface`, `SystemRow`, buttons, inputs, menus.
3. **Shell behavior change**: belongs in Desktop, Taskbar, Start Menu, Window, WindowManager, ContextMenu.
4. **App behavior change**: belongs in one app, such as CV, File Explorer, Settings, Admin, Feedback.
5. **Content/data change**: belongs in stores, Firebase data, or admin-managed records.

Avoid scattering one visual idea across many files. Add or refine the shared primitive first, then adopt it one section at a time.

## Section-By-Section Execution

### Section 1: Context Menu System

Why first:

- The OS already has `ContextMenu.tsx`.
- File Explorer already creates menu items locally.
- Right-click behavior is one of the strongest OS signals.

Refine:

- Move context menu resolution into a registry/helper.
- Add context IDs for desktop, taskbar, window title bar, file explorer empty area, folders, images, visitor items, and admin records.
- Keep current File Explorer menu working while extracting patterns.
- Replace gradient menu styling with Product Mono floating surface styling.

Do not:

- Rebuild File Explorer UI at the same time.
- Add every possible Windows menu item immediately.

### Section 2: File Explorer Locations And Permissions

Why second:

- File Explorer already has strong CRUD, upload, drag/drop, sort, search, and selection.
- Visitor Gallery already exists in the store.

Refine:

- Add side navigation for Desktop, Documents, Downloads, Projects, CV, Images, Visitor Gallery, System.
- Add permission helpers for system folders, visitor folders, and admin-only areas.
- Restrict Visitor Gallery file creation to folders and approved images.
- Keep richer file behavior available in admin/system areas.

Do not:

- Remove web-native experiences just because Windows would not have them.
- Treat Visitor Gallery as a fully trusted system folder.

### Section 3: Window Surfaces And Behavior

Why third:

- Window behavior is already robust but still visually tied to the older gradient/dark style.
- App metadata already has `surfaceMode`, `preferredWindowMode`, and `mobileBehavior`.

Refine:

- Wire app `surfaceMode` into `Window` or `WindowManager`.
- Use `ChromeSurface` for title bars.
- Use `ContentSurface` by default for CV, AboutOS, Settings, and File Explorer.
- Keep `utilityDark` for Calculator and Task Manager.
- Add title-bar context menu after context registry exists.

Do not:

- Rebuild app interiors while changing the frame.

### Section 4: Start Menu And App Registry

Why fourth:

- Start Menu already has the right tone.
- Default apps are already simplified.

Refine:

- Group apps into System, Work, Personal, Admin.
- Use `SystemRow`.
- Add right-click app actions: open, pin/unpin, app info, admin edit.
- Treat project apps as portfolio entries.

Do not:

- Reintroduce Portfolio, Skills, and Contact as first-level defaults.

### Section 5: CV And AboutOS

Why fifth:

- `CV.tsx` and `AboutOS.tsx` already exist.
- Product architecture is already moving away from separate portfolio-section apps.

Refine:

- Ensure CV contains profile, experience, skills, projects, contact, and files.
- Ensure AboutOS explains system, concept, Keketso, Generative Studio, credits, and build.
- Use light content surfaces and compact tabs/rows.

Do not:

- Duplicate the full CV inside AboutOS.

### Section 6: Feedback App As Web-Native Experience

Why sixth:

- This acknowledges the product is still a website.
- It gives feedback/comments a safe, intentional place.

Build:

- Add a `Feedback` app.
- Visitors can submit short feedback about the platform.
- Render feedback as plain text only.
- Strip or neutralize links.
- Rate-limit submissions.
- Add admin moderation before public display if needed.
- Let approved feedback contribute visually to the OS, such as a dot field, wall, constellation, or ambient panel.

Do not:

- Allow feedback as arbitrary files in File Explorer.
- Render visitor HTML.
- Let visitor feedback behave like trusted system content.

### Section 7: System Components

Why seventh:

- The surface and row primitives already exist.
- Calendar, notification panel, settings shell, and media hover can be added progressively.

Refine/build:

- `DateRangePicker`.
- `NotificationPanel`.
- `SettingsShell`.
- Adopt `MediaSurface` halftone treatment on project and gallery images.

Do not:

- Convert every app to the new component language at once.

## Current Gaps To Address Carefully

- `ContextMenu.tsx` is item-based but not yet registry/context based.
- `FileExplorer.tsx` still allows `New File` generally; Visitor Gallery should be stricter.
- File Explorer accepts videos in uploads today; Visitor Gallery should be image-only, while admin/system areas can keep broader support if desired.
- Window metadata includes surface hints, but `Window.tsx`/`WindowManager.tsx` do not appear to fully use them yet.
- `Surface` and `SystemRow` exist, but adoption is incomplete.
- Several older gradient/glow styles remain in Window, ContextMenu, FileExplorer dialogs, and some app bodies.
- Product Mono tokens may exist in pieces, but the old Star Citizen/default backgrounds still influence the first impression.

## Execution Rule

For each section:

1. Pick one behavior or surface area.
2. Refactor the shared primitive only if needed.
3. Update one user-facing area.
4. Verify it still works.
5. Then move to the next area.

This keeps the project from becoming a constant overhaul loop.

