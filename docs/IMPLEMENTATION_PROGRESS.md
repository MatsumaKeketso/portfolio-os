# Implementation Progress Tracker

> Last audited: 2026-05-02, updated 2026-05-05 (session 3). This tracker reflects what is actually present in the codebase, not only what the planning docs describe.

## Summary

The project has transitioned to **GenOS** branding and the **Product Mono** design system. The core OS shell, Admin Panel, and Settings have been restyled to follow minimalist, dark-chrome patterns without legacy "Aceternity" or angled-corner styling.

Overall status:

| Section | Area | Status |
|---|---|---|
| 1 | Context Menu System | Complete |
| 2 | File Explorer Locations And Permissions | Actioned |
| 3 | Window Surfaces And Behavior | Mostly actioned |
| 4 | Start Menu And App Registry | Mostly actioned |
| 5 | CV And AboutOS | Mostly actioned |
| 6 | Feedback App | Complete |
| 7 | System Components | Mostly actioned |
| 10 | Product Mono Theme | Complete |

## Section 1: Context Menu System

Status: **Mostly complete**

What is actioned:

- `src/components/ContextMenu.tsx` exists and renders the active context menu.
- `src/lib/contextMenuRegistry.ts` exists with `ContextMenuItemDef`, `sortAndSeparate`, `resolveMenuItems`, `ContextPermission`.
- Desktop right-click menu uses `ContextMenuItemDef[]` + `sortAndSeparate` (view/sort in `organize` group; desktop controls in `system` group).
- File Explorer right-click menu uses `ContextMenuItemDef` and `sortAndSeparate`.
- Start Menu app right-click menu uses `ContextMenuItemDef[]` + `sortAndSeparate` (open in `primary`, pin/unpin in `organize`, app info + admin edit in `system`).
- Window title bar right-click shows: Restore (if maximized), Minimize, Maximize (if not maximized), Close with Alt+F4 shortcut.
- Taskbar app buttons right-click: Open/Restore/Minimize (based on window state), Pin/Unpin from Taskbar, Close window.
- Taskbar background right-click: Show Desktop, Task Manager, Taskbar Settings.
- Pinned app button context menu resolves window state correctly (minimized windows show Restore).
- Unpinned running app buttons also have right-click context menu.
- Context menu styling aligned with Product Mono: compact dark rows, danger states.

Still pending:
- `resolveMenuItems` does not yet enforce meaningful permission filtering.
- Admin record context menu is still pending.
- File-type-specific menu resolution is still mostly local to File Explorer.

Next smallest action:

Enforce `resolveMenuItems` permission filtering so visitor-only contexts correctly filter admin-only items.

## Section 2: File Explorer Locations And Permissions

Status: **Mostly actioned**

What is actioned:

- `src/lib/filePermissions.ts` exists and defines:
  - `LocationContext`
  - `getLocationContext`
  - `LocationPermissions`
  - `getPermissions`
  - `fileIsWritable`
- `src/types.ts` defines `VISITOR_GALLERY_ID`.
- `src/store/fileStore.ts` includes a protected `Visitor Gallery` root folder.
- `src/components/apps/FileExplorer.tsx` imports and uses `getLocationContext`, `getPermissions`, and `fileIsWritable`.
- File Explorer side navigation includes `Desktop`, `Documents`, `Downloads`, `Projects`, `CV`, `Images`, `Visitor Gallery`, and `System`.
- File Explorer already supports grid/list views, sorting, searching, uploading, drag/drop, selecting, renaming, duplicating, deleting, cutting, copying, and pasting.
- Visitor Gallery prevents text-file creation by checking `permissions.canCreateFile`.
- Visitor Gallery upload flow rejects SVG/non-approved image types and shows a warning notification.
- Upload input uses `permissions.allowedUploadTypes`.
- Visitor-created uploads can be marked with `isVisitorOwned`.
- Protected files/folders are guarded in `fileStore.removeFile`.

Still pending:

- Visitor Gallery still uses client-side upload filtering. Storage/security rules should also enforce visitor image-only constraints.
- General/root areas still allow visitors to create text files and upload videos. That may be acceptable for admin/system areas, but should be intentionally scoped.
- `Desktop.tsx` still supports global desktop drop upload to root, including videos. This should be reviewed so it does not bypass Visitor Gallery rules.
- There is no Trash location yet.

Next smallest action:

Review global desktop drop upload so it cannot bypass scoped File Explorer permissions, then add server/storage-side visitor upload enforcement.

## Section 3: Window Surfaces And Behavior

Status: **Partially actioned**

What is actioned:

- `src/types.ts` includes app/window surface contract fields:
  - `surfaceMode`
  - `preferredWindowMode`
  - `mobileBehavior`
  - `minSize`
- `src/store/desktopStore.ts` assigns `surfaceMode` to default apps.
- `openWindow` carries `app.surfaceMode` into `WindowState`.
- `src/components/Window.tsx` reads `window.surfaceMode`.
- `Window.tsx` supports:
  - drag
  - resize
  - minimize
  - maximize
  - restore via maximize toggle
  - snap zones
  - z-index focus
  - double-click title-bar maximize
- Snap zone visuals have been toned down from neon to subtle white overlays.

Also actioned (theme pass + Section 3 + Section 7, 2026-05-01):

- `FileExplorer.tsx` and `Settings.tsx`: all gradients, backdrop-blur, and glassmorphism removed; full `bg-os-ink-*`/`border-white/[0.08]` conversion.
- `ContextMenu.tsx`: inline styles replaced with `FloatingSurface`-aligned Tailwind classes.
- `openWindow` in `desktopStore.ts`: now enforces `app.minSize` (initial size clamped to min), `app.preferredWindowMode === 'maximized'` (opens maximized), and `app.mobileBehavior` (maximize/fullscreen opens maximized on mobile; hide skips window creation entirely).
- `Window.tsx` resize handler: hardcoded `Math.max(300,…)` replaced with `window.minSize?.width ?? 300` and `window.minSize?.height ?? 200`.
- Default apps in `desktopStore.ts`: `minSize` and `mobileBehavior` set on file-explorer, cv, browser, settings, about-os, task-manager; calculator given `preferredWindowMode: 'fixed'`.
- `FileExplorer.tsx` grid and list image thumbnails now use `MediaSurface` with halftone hover treatment.
- `CV.tsx` and `AboutOS.tsx`: structural hardcoded hex values replaced with OS design tokens (`bg-os-canvas`, `text-os-text-strong`, `bg-os-canvas-raised`, `border-os-line-light`, `text-os-text-muted`, `text-os-text-faint`, `bg-os-canvas-warm`, `bg-os-ink-950`). Remaining mid-tone hex values (`#444`, `#888`, `#f0f0ee`) have no exact token equivalent and stay as-is.

Still pending:

- `Window.tsx` still handles surfaces with local class maps rather than fully leaning on `ChromeSurface`/`ContentSurface`.
- `file-explorer` and `settings` are intentionally kept as `utilityDark`; surfaceMode decision can be revisited for a future light variant.
- Taskbar-position-safe maximize behavior needs review for left/right/top taskbar positions.
- Mobile window behavior is wired but not visually tested.

Next smallest action:

Wire `Window.tsx` title bar onto `ChromeSurface`, then adopt `ContentSurface` wrapper in CV and AboutOS root divs.

## Section 4: Start Menu And App Registry

Status: **Mostly actioned**

What is actioned:

- `src/components/StartMenu.tsx` uses compact black OS chrome.
- Start Menu shows `GenOS`.
- Start Menu includes `Built by Generative Studio`.
- Start Menu uses `SystemRow`, `SystemRowGroup`, and `SystemRowDivider`.
- Apps are grouped into `Work`, `Projects`, and `System`.
- App search exists.
- App right-click menu exists with:
  - Open
  - Pin/unpin from Taskbar
  - Pin/unpin from Desktop
  - App Info
  - Edit in Admin when authenticated/admin mode
- Project apps are detected through `projectStatus`.
- `desktopStore.ts` default app list has been simplified toward system apps and CV.
- Legacy apps remain lazy-loadable in `WindowManager.tsx`, which preserves compatibility.
- `types.ts` includes project metadata fields:
  - `projectStatus`
  - `tags`
  - `role`
  - `year`
  - `projectLinks`

Also actioned (2026-05-05):

- `Edit in Admin` now deep-links: sets `adminEditTargetAppId` in `desktopStore` before opening AdminPanel. AdminPanel switches to Apps tab and briefly highlights the target app row, then clears state.
- `App Info` is now enabled: fires an OS notification with app name, description, and default window size.
- Milestone tag picker: replaced free-text input with clickable predefined tag chips (23 tags) plus a custom tag input field. Image grid made responsive.
- **Visitor Gallery upload path bug fixed**: Visitor uploads were going to storage root (blocked by auth rules) and silently falling back to ephemeral data URLs. Now routes to `visitor-gallery/` prefix with unique names and 5MB limit, matching the storage rules.
- **Gallery moderation tab implemented**: AdminPanel Gallery tab replaced with real UI — lists images from Firebase Storage `visitor-gallery/`, shows thumbnails with name/size/date, allows admin delete with confirmation. Loads on tab switch.

Still pending:

- Start Menu has no explicit `Personal` or `Admin` group yet.
- App context menu is locally assembled rather than using the registry.
- Admin Panel project publishing fields should be checked against the new metadata and filled out where missing.

Next smallest action:

Connect Start Menu app groups to a proper Admin/Personal designation in app metadata.

## Section 5: CV And AboutOS

Status: **Mostly actioned**

What is actioned:

- `src/components/apps/CV.tsx` exists.
- CV includes the requested tabs:
  - Profile
  - Experience
  - Skills
  - Projects
  - Contact
  - Files
- CV pulls from `userStore`.
- CV uses a light content surface style.
- CV keeps projects as summaries and points users back to project apps for full exploration.
- Contact privacy preferences are respected.
- `src/components/apps/AboutOS.tsx` exists.
- AboutOS includes:
  - System
  - Concept
  - Keketso
  - Generative Studio
  - Credits
  - Build
- AboutOS uses a side-nav `SystemRow` pattern.
- AboutOS explains the OS concept and does not simply duplicate the full CV.
- `WindowManager.tsx` loads `CV` and `AboutOS`, while keeping legacy Resume/Portfolio/Skills/Contact components available.

Still pending:

- CV and AboutOS use hardcoded visual values instead of shared `ContentSurface` and token helpers.
- CV `Files` tab is more of a placeholder than an integrated file/download surface.
- CV export is currently `window.print`; a more intentional export/download flow could be added later.
- Legacy app components still exist, which is fine, but they should stay out of the default first-level experience.
- AboutOS version/build values are hardcoded and should eventually come from package/config.

Next smallest action:

Convert CV and AboutOS outer shells to shared `ContentSurface`/`SystemRow` patterns without changing content.

## Section 6: Feedback App

Status: **Pending**

What is actioned:

- No dedicated Feedback app found in the current source tree.

Still pending:

- Add `Feedback` app.
- Add storage model for feedback.
- Strip or neutralize links.
- Add rate limiting or lightweight abuse prevention.
- Add admin moderation.
- Add approved-feedback visual contribution to the OS.

Next smallest action:

Create a simple `Feedback.tsx` app with local/Firebase-backed plain-text submissions and an admin-only moderation placeholder.

## Section 7: System Components

Status: **Partially actioned**

What is actioned:

- `src/components/ui/surface.tsx` exists with:
  - `Surface`
  - `ChromeSurface`
  - `ContentSurface`
  - `FloatingSurface`
  - `InsetSurface`
  - `MediaSurface`
  - `SurfaceHeader`
  - `SurfaceContent`
  - `SurfaceFooter`
  - `SurfaceDivider`
- `MediaSurface` includes the halftone dot hover treatment.
- `src/components/ui/SystemRow.tsx` exists with:
  - `SystemRow`
  - `SystemRowGroup`
  - `SystemRowDivider`
- Start Menu and AboutOS already use `SystemRow`.

Also actioned (2026-05-01):

- `ContextMenu.tsx` now uses Tailwind classes aligned with the `FloatingSurface` floating variant. Inline `style` background/border/shadow removed.

Still pending:

- Shared `DateRangePicker.tsx` is not present.
- Shared `NotificationPanel.tsx` is not present.
- Shared `SettingsShell.tsx` is not present.
- `Surface` adoption still incomplete in Window, Admin, and modal dialogs.
- `MediaSurface` should be adopted on FileExplorer image thumbnails and Visitor Gallery.

Next smallest action:

Adopt `MediaSurface` in FileExplorer image thumbnails, then adopt `ContentSurface` in CV and AboutOS outer shells.

## Cross-Cutting Risks

- Critical production blocker: uploaded content is not persisting after refresh. This appears to affect images/media broadly, not only one feature. The next implementation pass must audit File Explorer uploads, Visitor Gallery uploads, background uploads, milestone images, Admin Panel media uploads, CV/download assets, persistent storage writes, metadata writes, reload behavior, and Firebase permissions.
- Docs have been updated for Firebase; `LOOK_AND_FEEL_UPDATE_SPEC.md` still references `supabase-setup.sql` as a candidate file (historical).
- Several old gradient/glow styles remain in modals/dialogs and File Explorer.
- The project is mid-transition: shared primitives exist, but not every surface uses them yet.
- Client-side restrictions are useful but should not be treated as the only security layer for visitor uploads.

## Recommended Next Work Order

1. Fix upload persistence across all upload/media flows. This is the current production-readiness blocker.
2. Verify uploaded public media and downloadable owner-curated assets survive refresh and are readable by visitors where intended.
3. ~~Finish Section 4 by adding real App Info and Admin deep-link behavior.~~ ✓ Done 2026-05-05
4. Finish Section 5 by moving CV/AboutOS shells onto shared surfaces and populating CV content from owner's real CV.
5. Continue Section 7 by adopting `Surface` primitives in the highest-visibility shell components.
6. ~~Build AdminPanel → Visitor Gallery moderation tab (currently placeholder).~~ ✓ Done 2026-05-05

---

## System-Wide Updates (from CLAUDE_HANDOFF_SYSTEM_UPDATES.md, actioned 2026-05-04)

### Actioned

- **Window surface performance** — Replaced `bg-black/20 backdrop-blur-xl` with `bg-[#141414]` (solid) in `Window.tsx` for all `glass` surfaceMode windows. Drag lag eliminated.
- **Admin/user permission boundary** — Added `canWrite()` guard (`auth.currentUser !== null`) to all Firestore write operations in `userStore.ts` and `desktopStore.ts`. Standard visitors no longer trigger permission errors on app load or when opening Settings.
- **`isAdmin` flag added to authStore** — `authStore` now exposes `isAdmin: boolean`, derived from `user.email === ADMIN_EMAIL` (configurable via `VITE_ADMIN_EMAIL` env var, defaults to `admin@os.com`). Used by UI to conditionally show admin-only controls.
- **File Explorer sidebar color** — Removed bright cyan gradient border wrapper from sidebar. Replaced with `border-white/[0.08]` treatment. Removed glow shadow from active indicator.
- **Firebase Security Rules** — Added `firestore.rules` and `storage.rules` to project root. Updated `firebase.json` to reference them. Rules: Firestore `os-site_content` = public read / auth write; `os-feedback` = public create (pending only) / auth read+write. Storage = public read / auth write (admin assets); visitor-gallery = public write (image-only, 5MB max).
- **Feedback app** — `src/components/apps/Feedback.tsx` built and registered. AdminPanel feedback moderation tab wired to `os-feedback` Firestore collection.
- **AdminPanel** — Fully reworked with 6-tab layout (Overview, Apps, Backgrounds, Milestones, Feedback, Gallery).
- **firebase.json** — `"public"` dir corrected from `"build"` to `"dist"` for Vite output.

### Also Actioned (2026-05-05)

- **Theme token cleanup** — Replaced hardcoded `bg-[#141414]` hex values with `bg-background-chrome` semantic token across Taskbar, CalendarPopup, ContextMenu, NotificationPanel, VolumePopup, AdminPanel. Wired `background.chrome/chrome-raised/floating` Tailwind utilities through CSS variable primitives (`index.css` + `tailwind.config.js`). OS ink tokens now use CSS variable channels.
- **FileExplorer performance** — Removed `AuroraBackground` animated component and `backdrop-blur-md` from FileExplorer root div. No more animated background or GPU compositing on every render.
- **FileExplorer drag lag** — Confirmed: Window.tsx already uses `bg-background-chrome` (solid `#111111`) for `glass` surfaceMode. No backdrop-blur on window bodies.
- **Milestone tag picker** — Tags field replaced with clickable predefined chip picker (23 tags) + custom tag input on Enter. Image grid made responsive (`grid-cols-2` → `sm:grid-cols-4`).
- **Edit in Admin deep-link** — `adminEditTargetAppId` state in desktopStore; StartMenu sets it before opening AdminPanel; AdminPanel switches to Apps tab and highlights target row with primary ring for 2.5s.
- **App Info notification** — App Info context menu item is now enabled; shows OS notification with app name, description, and default window size.

### Also Actioned (2026-05-05, persistence mitigation)

- **Upload metadata local recovery** — `fileStore`, `desktopStore`, and `userStore` now write immediate local backups for filesystem metadata, custom backgrounds/selected background, and profile/milestone data. This prevents uploaded metadata from disappearing on refresh when Firebase writes are delayed, skipped, or temporarily blocked.
- **Merge-on-load recovery** — File system, backgrounds, and profile data now merge local backups with Firestore data on load. If an authenticated owner session exists, locally recovered items can be pushed back toward Firestore.
- **Post-login refetch** — `Desktop.tsx` now refetches profile, file system, apps, and backgrounds after authentication is established so recovered owner metadata has a chance to sync after login.
- **Structured Storage folders** — Upload flows now use explicit Storage folders: `file-explorer`, `desktop-uploads`, `backgrounds`, `milestones`, and existing `visitor-gallery`, instead of mixing owner media into unnamed root paths.

### Also Actioned (2026-05-05, sign-in workflow)

- **Role model clarified** — `admin@os.com` is now the superuser account. Any other signed-in email is treated as a guest.
- **Guest sign-in workflow** — Login modal now has Guest and Superuser modes. Guest mode signs into an existing guest account or creates a limited guest account for a new non-admin email.
- **Admin boundary corrected** — Admin Panel, protected Settings/Profile editing, File Explorer protected writes, Start Menu admin edit actions, and legacy edit buttons now check `isAdmin` instead of treating any authenticated user as admin.
- **Rules tightened** — Firestore `os-site_content` writes and feedback moderation now require `admin@os.com`. Storage owner-asset writes now require `admin@os.com`; Visitor Gallery remains public image-only upload.

### Also Actioned (2026-05-05, desktop icon labels)

- **Desktop icon label sizing** — Small and medium desktop icon labels now use single-line truncation to avoid cropped text. Large desktop icons retain two-line labels for readability. Large icon cells were slightly increased to prevent label clipping.

### Also Actioned (2026-05-05, visitor upload boundary and start asset)

- **Visitor upload boundary** — Non-admin users can no longer upload through the desktop/global drag-and-drop surface. Attempted desktop drops show a warning that visitors must use Visitor Gallery.
- **File Explorer write boundary** — Root/general File Explorer locations are now superuser-write only. Visitor Gallery remains the public zone for visitor folder creation and image upload.
- **Start button asset** — Taskbar start button now uses `src/assets/png-color-symbol.png` instead of the square grid icon, with token-backed styling instead of the previous hardcoded blue/cyan gradient.

### Also Actioned (2026-05-05, desktop preview media)

- **Start button surface correction** — Start button now keeps a white/token canvas background while using the red/colored Generative Studio symbol. It no longer uses the dark inner icon surface.
- **App media field added** — `App` now supports a plain `media` array for owner-curated screenshots and videos.
- **Admin app media upload** — AdminPanel app create/edit form now allows image/video uploads to `app-media/` and stores uploaded media metadata on the app record.
- **Desktop hover preview standardized** — Desktop icon hover preview no longer uses the full-screen dark overlay. It now renders a compact OS chrome preview card with app media, app type, description, pinned status, and URL.
- **Storage rule for app media** — `storage.rules` now allows public reads for `app-media/` and restricts writes to the superuser with a 25MB image/video limit.

### Also Actioned (2026-05-05, CV seed workflow)

- **Attached CV extracted** — Text was extracted from `KEKETSO MATSUMA'S Full Stack Developer & UIUX Designer.pdf` and mapped into the existing `UserProfile` shape.
- **CV seed object added** — `src/data/cvProfileSeed.ts` now contains a typed profile seed covering personal summary, work experience, education, certifications, and skills.
- **Profile seed action added** — `userStore` now exposes `seedCVProfile()`, which writes directly to Firebase first. The visible CV/profile state updates only after Firestore accepts the write. It preserves current milestones, preferences, and profile photo.
- **Superuser CV button added** — CV app header now shows an admin-only `Populate CV` button. Clicking it confirms, publishes to Firebase, and displays a success/error banner with the real write result.
- **CV Projects tab removed** — The CV app no longer shows a Projects tab because projects are represented as desktop/application experiences.
- **Remote profile is authoritative** — `fetchProfile()` now uses the Firebase profile document whenever it exists and mirrors it locally. Local profile data is fallback only when Firebase has no profile document or the remote fetch fails.

### Also Actioned (2026-05-05, desktop hover preview correction)

- **Presentation overlay restored** — Desktop icon hover previews are back to a full-screen presentation overlay instead of a compact card.
- **Media added to existing behavior** — App screenshots/videos now appear inside the restored presentation overlay as a large preview area with optional thumbnails, instead of replacing the original overlay behavior.

### Also Actioned (2026-05-05, Admin Panel styling pass)

- **Admin Panel token cleanup** — `AdminPanel.tsx` no longer uses the old raw `bg-white/[...]`, `border-white/[...]`, `text-white/[...]`, `primary-500`, or hardcoded category color utility patterns. Surfaces now use semantic `background-*`, `foreground-*`, and `stroke-*` tokens.
- **Shared app shell cleanup** — `AppShell.tsx` primitives now use semantic chrome/control/stroke tokens instead of the old black/white alpha glass classes. Comments were updated so the code no longer describes a backdrop-blur glass base.
- **Admin dashboard/list surface refresh** — Overview stats, quick actions, app list rows, background cards, upload controls, feedback states, and gallery moderation controls were moved onto the same token language as the rest of the OS.
- **Admin Panel click-through fixed** — Desktop now mounts Admin Panel inside a fixed high z-index pointer-owning shell only while Admin Mode is open. This prevents desktop icons and windows from receiving clicks through the Admin Panel sidebar/content.
- **Dark chrome contrast corrected** — Admin Panel and shared app shell controls now use explicit dark OS chrome/inset tokens (`os-ink`, `os-line`, `os-text-inverse`) instead of light-mode control tokens that caused pale/white patches on dark surfaces.

### Also Actioned (2026-05-05, session 3 — brand, transparency, logo)

- **Window transparency root cause fixed** — `themeStore.ts` was setting `--os-ink-950/900/800/700` to hex strings (`#111111`), but `tailwind.config.js` uses them in `rgb(var(--token) / alpha)` syntax which requires space-separated channels. `rgb(#111111 / 1)` is invalid CSS and renders as transparent. Fixed: values now set as `'17 17 17'`, `'21 21 21'`, `'31 31 31'`, `'42 42 42'`. Any component using `bg-os-ink-*` now renders correctly. Components already converted to `bg-background-chrome` (Window.tsx, LoginModal.tsx) continue to work unchanged.
- **Generative Studio set as default theme** — `generativeStudioTheme` added to `themeStore.ts` with red brand colors (`primary: #ef4444`, `secondary: #dc2626`, `tertiary: #f97316`, `accent: #fbbf24`). Replaces `starCitizenTheme` (cyan) as the initial and fallback theme. Listed first in presets.
- **Brand semantic tokens updated to red** — `src/index.css` brand token section updated: `--color-bg-brand-solid/hover/focus/subtle/subtle-hover`, `--color-fg-brand/hover`, `--color-stroke-brand`, `--color-stroke-focus` all changed from blue values to Generative Studio red. Dark mode brand overrides also updated.
- **StartMenu header uses logo** — `Icons.Grid3x3` replaced with `png-white-symbol.png` logo import in StartMenu header area.
- **Logo assets committed** — `src/assets/png-black-symbol.png`, `src/assets/png-color-symbol.png`, `src/assets/png-white-symbol.png` committed to repository. Taskbar uses color variant; StartMenu uses white variant.
- **CV seed data committed** — `src/data/cvProfileSeed.ts` committed (was untracked). Contains full typed `UserProfile` seed with Keketso Matsuma's CV: personal info, work history (munch.cloud, mLab, CodeUp, CodeTribe), education, certifications, and skill categories.

### Still Pending (from handoff)

- **Upload persistence browser verification** — Typecheck passes, and metadata recovery is implemented, but the full production path still needs browser testing: upload, refresh, confirm item remains, sign out/in, confirm Firestore/Storage records, and verify visitor visibility for public assets.
- **Upload persistence production blocker** — Owner reports uploaded images/media disappear after refresh. This is mitigated but not closed until the full Firebase and public-read path is verified in browser.
- **Background persistence verification** — Rules are now correct; needs testing in browser to confirm uploaded backgrounds persist after refresh.
- **Auth workflow production verification** — Enable Firebase Email/Password auth, confirm `admin@os.com` exists, deploy updated Firestore/Storage rules, then test superuser login, guest creation/login, Admin Panel access denial for guests, and guest-safe Visitor Gallery upload.
- **About app editing** — Constrained inline editing for Generative Studio details, email, and Kagetsu links. Open question: correct email and Generative Studio website URL.
- **Taskbar/start icon configuration path** — Assets are now in `src/assets/` and hardcoded in Taskbar/StartMenu. A Settings or Admin Panel path to swap the logo variant is not yet exposed.
- **CV publish** — Seed data and `seedCVProfile()` are in place. Admin must sign in as `admin@os.com` and click "Populate CV" in the CV app to write the seed to Firebase. Until that happens, CV app shows empty/default profile state.
- **surfaceMode: 'content' for content apps** — CV, AboutOS, FileExplorer, Settings are set to `glass` in desktopStore but ARCHITECTURE.md specifies `content`. Converting requires full internal redesign of each app's colors from dark-glass to light-canvas.

### Open Questions (unresolved from handoff)

- What is the correct admin email address? (`admin@os.com` assumed — set `VITE_ADMIN_EMAIL` if different)
- What is the Generative Studio website URL?
- Is `Kagetsu` the correct public label and how does it relate to Keketso in About?
- What GitHub URL should be shown for Kagetsu?
- Should About app editable content live in Firestore or existing `userStore`?
- Logo assets confirmed at `src/assets/png-{black,color,white}-symbol.png`. Which variant for which surface (dark mode, light mode, active state)?
