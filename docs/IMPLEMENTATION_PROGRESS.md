# Implementation Progress Tracker

> Last audited: 2026-05-02, updated 2026-05-10. This tracker reflects what is actually present in the codebase, not only what the planning docs describe.

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

- There is no Trash location yet.
- File-type-specific open/preview behavior still needs a later pass for unsupported formats such as PDFs.

Next smallest action:

Add a Trash location and define its restore/delete behavior.

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

Status: **Complete**

What is actioned:

- `src/components/apps/Feedback.tsx` exists and is registered as an app.
- Feedback writes to the `os-feedback` Firestore collection.
- Public visitors can submit feedback.
- Superuser moderation is wired through the Admin Panel feedback tab.
- Approved feedback is readable publicly; pending/hidden feedback is superuser-controlled by Firebase rules.

Still pending:

- Lightweight abuse prevention/rate limiting is still a future hardening item.
- Approved feedback contributing visually to the OS is still a future experience idea.

Next smallest action:

Add lightweight rate limiting or duplicate-submit throttling.

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

- Upload persistence is no longer the active production blocker. Owner verified background uploads, documents, videos, Visitor Gallery uploads, and feedback after rules deployment. Keep this as a smoke-test item before each deployment.
- Docs have been updated for Firebase; `LOOK_AND_FEEL_UPDATE_SPEC.md` still references `supabase-setup.sql` as a candidate file (historical).
- Several old gradient/glow styles remain in modals/dialogs and File Explorer.
- The project is mid-transition: shared primitives exist, but not every surface uses them yet.
- Client-side restrictions are useful but should not be treated as the only security layer for visitor uploads.

## Recommended Next Work Order

1. Keep upload persistence in the smoke-test checklist for each deployment.
2. Continue UI consistency cleanup in Settings/Admin/Browser surfaces.
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

- **Upload persistence verification** — Owner verified backgrounds, documents, videos, Visitor Gallery uploads, and feedback after Firebase rules deployment. Keep this in the smoke-test checklist, but it is no longer a production blocker.
- **Auth workflow verification** — Owner verified superuser login and feedback moderation. Keep guest-safe Visitor Gallery upload and admin access denial in recurring smoke tests.
- **About app editing** — Constrained inline editing for Generative Studio details, email, and Kagetsu links. Open question: correct email and Generative Studio website URL.
- **Taskbar/start icon configuration path** — Assets are now in `src/assets/` and hardcoded in Taskbar/StartMenu. A Settings or Admin Panel path to swap the logo variant is not yet exposed.
- **CV publish** — Seed data and `seedCVProfile()` are in place. Owner has used the populate flow and CV data is visible; verify after deployments that profile data still comes from Firebase.
- **surfaceMode: 'content' for content apps** — CV, AboutOS, FileExplorer, Settings are set to `glass` in desktopStore but ARCHITECTURE.md specifies `content`. Converting requires full internal redesign of each app's colors from dark-glass to light-canvas.

### Open Questions (unresolved from handoff)

- What is the correct admin email address? (`admin@os.com` assumed — set `VITE_ADMIN_EMAIL` if different)
- What is the Generative Studio website URL?
- Is `Kagetsu` the correct public label and how does it relate to Keketso in About?
- What GitHub URL should be shown for Kagetsu?
- Should About app editable content live in Firestore or existing `userStore`?
- Logo assets confirmed at `src/assets/png-{black,color,white}-symbol.png`. Which variant for which surface (dark mode, light mode, active state)?

---

## Release Cleanup Update (2026-05-10)

Status: **Actioned**

What is actioned:

- Firebase rules are deployed and scoped by app namespace. Firestore preserves CRP rules, protects GenOS `os-*` collections, and leaves unrelated collections open so other apps in the same Firebase project are not locked out.
- Storage rules protect GenOS-managed folders and leave non-GenOS folders open.
- GenOS sign-ins write `os-users/{uid}` with `source: generativeos`, `app: generativeos`, and the current role.
- App add/edit/remove/reorder flows publish to Firestore first and only update visible local state after Firestore accepts the write.
- Browser Reads are loaded from `os-site_content/reads`; Admin Panel supports CSV import; duplicate slugs are skipped; article pages include tag pages, previous/next navigation, and Discuss.
- Owner verified background uploads, documents, videos, Visitor Gallery uploads, and feedback moderation working after deployment.
- Shared app icons normalize uploaded, Lucide, and Material UI icons into the same scalable box.
- Icon sizing is now centralized in `src/lib/iconScale.ts`, with named size tokens and source-specific visual scales for Lucide, Material UI, and uploaded image icons.
- Window borders now live on the rounded window shell to avoid clipped top corners.
- Browser read cards no longer use layout resize animation, reducing maximize/minimize bounce.
- Timeline and milestone cards were retuned from the older clipped/neon treatment to the current dark-chrome design language, with token borders, activity-density bars, calmer motion, and cleaner media expansion.
- Admin Panel app tables now use shared dark table primitives from `AppShell.tsx` instead of light-mode divider tokens.
- Shared card, input, button, and surface primitives now source dark borders from `os-line-dark` / `os-line-dark-hover`; Tailwind `os.line.dark` also resolves from CSS variables so the border system can be tuned centrally.
- Milestone header now uses the available header space for entries, featured count, year controls, and expand/collapse. The old secondary metadata row and month density divider were removed.
- Milestone horizontal mouse-wheel scrolling is restored without requiring Shift.
- Admin Panel and File Explorer side navigation now share the same selected-row behavior: red active rail, dark selected fill, and high-contrast label/icon state.
- High-visibility shell surfaces were cleaned to use OS tokens instead of raw white/cyan styling: File Explorer chrome/sidebar/dialogs, Taskbar and system tray, Login modal, Context Menu, Window controls, and Window snap/cutout overlays.
- Secondary shell surfaces were also cleaned to use OS tokens: Start Menu, desktop hover preview, Calendar popup, Notification panel, Volume popup, Upload progress, Welcome screen, Keyboard Shortcuts help, PWA prompt, Error boundary, and notification toasts.
- Red active controls were adjusted so red is used as accent/border while text stays high-contrast white.
- Shared interaction feedback primitives were added in `src/index.css`: `os-interactive`, `os-focus-ring`, `os-row-hover`, `os-surface-soft`, and `os-surface-raised`. These establish a reusable baseline for hover lift, press feedback, focus visibility, and row interaction.
- `Button` and `AppShell` primitives now use the shared interaction/focus utilities, and shared app table rows inherit `os-row-hover`.
- The CSS fallback theme now defaults to Generative Studio red/orange values instead of the old Star Citizen cyan/blue values, preventing blue flashes before the persisted theme loads.
- Weather and Task Manager received the first app-level interaction pass: old raw white/cyan/black alpha surfaces were replaced with OS ink/line tokens, active states use brand red with readable white text, and cards/rows now respond with shared hover feedback.
- Settings, Feedback, and AboutOS had remaining high-traffic blue/white-alpha controls replaced with token-backed borders, brand accents, and shared interaction states.
- Fullscreen window taskbar cutout border now follows the cutout geometry with an SVG path overlay, so the border runs down, curves around the notch, and reconnects instead of being visibly cut by the clip path.
- Taskbar now includes an ambient top-edge activity strip. It reacts to cursor proximity, clicks, window open/close events, focus changes, and then settles into a quieter idle drift. The strip uses interwoven SVG wave strokes centered on the taskbar edge, with crisp color-separated strands, localized glow accumulation near the active point, and edge blending into the taskbar border. Reduced-motion users receive a static brand line instead of the animated ambient behavior.
- Window title bars now use a dim variant of the same luminous strip language. Active windows show stronger color, larger outward-from-center trough motion, and faster wave movement; inactive windows lose glow, become gray, and move more quietly. The header strip is clipped inside the draggable title bar and does not affect taskbar geometry.
- Window bodies now include a subtle ambient glow layer. Focused windows get a warmer looping brand glow; unfocused windows keep a much dimmer static glow so attention stays on the active surface.
- File Explorer is now surfaced to users as `Archive` while preserving internal `file-explorer` ids and storage paths to avoid migration risk.
- Added `docs/APP_MEDIA_SYSTEM_PLAN.md` as the next Claude handoff for app/media work: dedicated Music, PDF Reader, Video Player/Image Viewer routing, Archive launch behavior, and a floating mini player outside the taskbar.

Still pending:

- About app editing remains undefined until final email, Generative Studio URL, and public labels are confirmed.
- Taskbar/start icon configuration is not exposed in Settings or Admin Panel yet.
- Milestones still need the future V2 daily-update/content strategy, but the current UI cleanup pass is actioned.
- App animations and transitions need a focused pass after the current surface cleanup. The new shared interaction utilities are the baseline for that pass.
- App media handling is now actioned for the first pass. Archive routes audio, PDF, video, and image files into dedicated app surfaces, while generic `FileViewer` remains as fallback. Continue with visual polish, curated music metadata, and deeper PDF/video controls in later app-focused passes.
- Older legacy app screens still contain raw white-alpha border classes and should be converted incrementally as each app receives its next design pass.
- Active shell token cleanup is currently actioned for the surfaces listed above; future cleanup should focus on remaining app-specific screens such as Browser, legacy Portfolio/Skills/Resume, detailed File Explorer file-type viewers, and older CV/About edit forms.

---

## Design System Full-Sweep (2026-05-30 — actioned)

Status: **Complete.** Raw-color debt reduced from **261 → 8** intentional brand/print exceptions across `src/components/`. Every app and every shell component now uses the documented semantic tokens.

### Foundation

- **`docs/DESIGN_SYSTEM.md`** written as canonical source of truth (layered architecture, token inventory, app contract, surface taxonomy, visual rules, current-app audit).
- **`THEME_SYSTEM.md`** rewritten to point at DESIGN_SYSTEM.md and clarify that the theme layer only owns brand/preset overrides — OS ink/canvas/line/text tokens are static.
- **`docs/ARCHITECTURE.md`** design-system section updated to reflect what's in `ui/` today (Generative Studio default, only `MediaSurface` live in `surface.tsx`, dead exports in `card.tsx`/`input.tsx` quarantined).
- **`docs/README.md`** index + **`CLAUDE.md`** anchor on DESIGN_SYSTEM.md.
- **`src/index.css`** semantic foreground tokens (`--color-fg-success/warning/error/info`) tuned for dark OS chrome (brighter values like `#4ade80` instead of `#16a34a`); subtle feedback bg variants moved to `rgba(…, 0.10)` chrome-friendly tints. Original "true light surface" values preserved under `.dark` for future opt-in.
- **`tailwind.config.js`** short flat aliases added: `bg-brand-solid`, `text-fg-success`, `border-stroke-error`, `bg-success-subtle`, `bg-warning-subtle`, `bg-info-subtle`, `bg-control`, etc. — so the utility names documented in DESIGN_SYSTEM.md actually resolve.

### Primitives reconciled

- **`ui/surface.tsx`** slimmed to just `MediaSurface` (only live export). All unused legacy variants (`Surface`, `ChromeSurface`, `ContentSurface`, `FloatingSurface`, `InsetSurface`, `SurfaceGlow`) removed. Aceternity background imports (`AuroraBackground`, `BackgroundBeams`) severed.
- **`ui/card.tsx`** rewritten with tokenized variants; removed Cyberpunk angled clip-path, `BorderGlow` Aceternity dep, gradient `CardIcon` glow. Added semantic `<CardBadge>` with brand/success/info/warning/error/neutral variants.
- **`ui/input.tsx`** retokenized; stripped Aceternity/Cyberpunk wording.
- **`ui/button.tsx`** legacy aliases (`primary`/`secondary`/`tertiary`/`danger`/`success`/`menuItem`/`ghostDanger`) marked `@deprecated` with migration paths. Documented variant catalog rewritten.
- **`ui/AppShell.tsx`** gained `appPanelClass`, `appRowClass` exports (extracted from Settings local helpers) so any settings-like app can share the pattern.

### Dead code removed

- `src/components/aceternity/` folder deleted (4 components: AuroraBackground, BackgroundBeams, GridBackground, BorderGlow). Zero importers after the primitive cleanup.

### App migration matrix

All 21 apps now use AppShell:

| App | Status | Notes |
|---|---|---|
| AboutOS, About, Browser, Calculator, Contact, CV, Feedback, FileExplorer, FileViewer, Finance, ImageViewer, Music, Notepad, PDFReader, Portfolio, Resume, Settings, Skills, TaskManager, VideoPlayer, Weather | ✅ | All wrapped in `<AppShell>`, all raw alpha/hex/palette violations swept to semantic tokens |

8 intentional exceptions remain (documented in `docs/DESIGN_SYSTEM.md` § "Intentional brand/print exceptions"):
- Music play button, CV Populate button, ImageViewer active fit chip — brand CTAs (correct usage per Accent rules).
- Resume tech pills (×2) — light-blue badges intentional for printed paper output.
- Button.tsx legacy aliases (×3) — `@deprecated`, kept for backward compat.

### Shell + supporting components

All 25+ shell components now use semantic feedback tokens (`fg-error`, `bg-success-subtle`, `border-stroke-warning`, etc.) for status colors:

- **Phase B:** AdminPanel (22 palette → 0), Desktop (6 alpha + 1 hex → 0), DesktopIcons (already clean), Taskbar, TaskbarStrip, StartMenu, ContextMenu, Window family (Window/WindowEdgeGlow/WindowManager), CustomizationSettings.
- **Phase C:** MiniPlayer, NotificationContainer, NotificationPanel, UploadProgress, LoginModal, ErrorBoundary, WelcomeScreen, KeyboardShortcutsHelp, PWAInstallPrompt, CalendarPopup, VolumePopup, Timeline, MilestoneCard, DesktopWidgets, ArticleComments.

### Risks/leftovers

- The `.dark` class is never applied in this codebase; light-mode tokens were tuned for dark chrome readability. If a real light-surface mode is ever wanted (e.g., a printable CV view), the `.dark` overrides in `src/index.css` swap to the original darker fg values designed for light backgrounds.
- `ui/card.tsx` and `ui/input.tsx` are now token-clean but still have zero importers — apps use `<AppCard>` and `appInputClass`/`<ControlInput>` instead. Decide whether to keep them as standalone primitives or delete entirely.
- `<Typography>` primitive is documented (DESIGN_SYSTEM.md line 111 update) but not yet adopted across legacy components; most consumers still use `os-type-*` utility classes directly.
- A canonical `DateRangePicker` and `<Badge>` primitive remain TODO per the surface-language consistency goals.

---

## Archive: Projects case-study side panel (2026-06-08 — actioned, build-verified)

The **Projects** location in Archive is now a special case-study surface, distinct from the rest of the file system.

- **No-reflow side panel.** Inside `folder-projects`, the grid no longer inline-expands a SplitCard on select (which pushed sibling rows around). `SplitCard` is rendered with `expanded={false}` there; the content area is wrapped in a flex row and a fixed-width `ProjectCaseStudyPanel` column sits beside the grid. Single-click selects + populates the panel; double-click opens the project. Other Archive folders keep their existing behavior (scoped change).
- **Per-project case study.** `FileItem.caseStudy` (`ProjectCaseStudy`: `markdown`, `summary`, `media[]`, `links?`, `updatedAt`) added to `types.ts`; `fileStore.setCaseStudy(fileId, caseStudy)` persists with the rest of the filesystem doc (public-read, admin-write per Firestore rules).
- **Editor (admin-only).** `ProjectCaseStudyPanel.tsx`: Write/Preview tabs, a summary field, a markdown textarea with **paste-to-upload** images and an "Image" picker (both upload then insert `![alt](url)`). Visitors get the rendered read-only case study.
- **Markdown.** `src/lib/markdown.ts` — small, dependency-free, HTML-escaped renderer (headings, bold/italic, code + fences, links, images, lists, blockquotes, hr, paragraphs; allow-listed URLs). Rendered via `.case-study-prose` (token-styled) in `index.css`.
- **Image storage.** Case-study images upload to `portfolio-files/` (admin-write / public-read per `storage.rules`). Deliberately *not* a new top-level folder — the storage catch-all (`/{topLevel}/**`) makes unmanaged folders public-writable, which would be a hole.
- **Guardrail hardened.** `scripts/check-design-tokens.mjs` now also catches directional-border (`border-l-…`) and `placeholder-`/`stroke-`/`caret-`/`ring-offset-` palette colors. This surfaced two pre-existing misses now fixed: `FileExplorer` `border-l-primary-400` → `border-l-brand-400`, `Notepad` `placeholder-gray-500` → `placeholder-white/30`.
- Verified: typecheck clean · `lint:tokens` ✓ · build exit 0.

Follow-ups: the panel is a fixed 340px — on a very narrow Archive window the grid gets cramped (consider hiding/collapsing the panel under a width threshold). Restricting Projects to folders-only (no loose files) is optional polish.

**Rich text editor (2026-06-08).** The case-study editor was upgraded from a markdown textarea to a **Tiptap** (ProseMirror) rich text editor, styled to the design system:
- New `src/components/ui/RichTextEditor.tsx` — headless Tiptap with a tokenized toolbar (bold/italic/strike/inline-code, H1–H3, bullet/ordered lists, blockquote, code block, link with inline URL input, image upload, horizontal rule, undo/redo). The editable surface reuses `.case-study-prose` so editing is true WYSIWYG. Paste-an-image and the toolbar image button both upload (to `portfolio-files/`) then insert.
- Output is **HTML** stored on `ProjectCaseStudy.html`; rendered read-only via the existing `sanitizeReadHtml` (strips script/style + event handlers + unsafe iframes; keeps headings/lists/img/etc.). `markdown` kept as a fallback field (legacy markdown auto-converts to HTML on first edit via `renderMarkdown`).
- Deps added: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`. Mentions (`@tiptap/extension-mention`) is a clean future add (needs a suggestion source).
- ProseMirror placeholder/selected-node CSS added to `index.css`.
- **Env note:** installing required `npm install --include=dev` — the shell sets `NODE_ENV=production` + `omit=dev`, which otherwise drops `vite`/`@types/react-dom`/`@vitejs/plugin-react` and breaks typecheck/build (not a code issue). Documented in memory.
- Verified: typecheck clean · `lint:tokens` ✓ · build exit 0.

## Timeline / Observatory / Changelog Subsystem (2026-06-06 — partially actioned)

Status: **Data layer + read-only app complete; admin authoring UI pending.**

A new content subsystem was added. Full reference: `docs/TIMELINE_SYSTEM.md`. Summary of state vs. code:

What is actioned:

- **Types** — `TimelineEntry`, `TimelineEntryType`, `TimelineEntryStatus`, `TimelineEntrySource`, `TimelineMedia`, `TimelineLink`, `TimelineMetric`, `ObservatoryTopic`, `ObservatoryTopicStatus`, `ChangelogEntry`, and shared `ContentVisibility` added to `src/types.ts`.
- **Storage libraries** — `src/lib/timeline.ts`, `src/lib/observatory.ts`, `src/lib/changelog.ts` (single-document `data`-array pattern under `os-site_content/{timeline,observatory,changelog}`, mirroring Reads), plus `src/lib/timelineMedia.ts`.
- **Stores** — `src/store/timelineStore.ts` and `src/store/observatoryStore.ts` (the 8th and 9th Zustand stores). Both guard writes with the `admin@os.com` superuser check and debounce saves; both fall back to seed data when the remote document is empty.
- **Role-aware visibility** — `filterTimelineByVisibility` / `filterObservatoryByVisibility`: superuser sees everything; everyone else sees `public` + `published` only.
- **Seeds** — `src/data/timelineSeed.ts`, `src/data/observatorySeed.ts`.
- **Timeline app** — `src/components/apps/Timeline.tsx`: AppShell + `<Badge>`, horizontal "tape" with featured chapters, per-type icon/tone mapping, Observatory topics surfaced inside. Registered in `desktopStore.ts` (`id: 'timeline'`, pinned to desktop) and `WindowManager.tsx`.
- **Boot wiring** — `Desktop.tsx` runs `loadTimeline`/`loadObservatory` as boot tasks and re-runs them after auth changes.
- **Changelog import** — `timelineStore.importChangelogEntries` / `importChangelogFromFirestore`: idempotent mapping of changelog records to `system-update` timeline entries, deduped on `(source: 'changelog', sourceId)`.

Still pending:

- **Admin authoring UI** — the Admin Panel has no Timeline/Observatory/Changelog tab. Entry/topic creation, editing, and the changelog import all exist as store actions but have no UI entry point. This is the primary remaining work.
- Decide single-document vs. per-entry Firestore storage as the working set grows.
- Optional: auto-generate `source: 'read'` timeline entries from the Reads system.

Next smallest action:

Add an Admin Panel tab (or extend an existing one) that calls `timelineStore.addEntry`/`updateEntry` and `importChangelogFromFirestore`, plus `observatoryStore.addTopic`/`updateTopic`.

---

## Theming Overhaul — Single Brand Ramp, No Light Mode, Phosphor Icons (2026-06-06 — actioned, build-verified)

Status: **Complete and build-verified** (`npm run typecheck` + `npm run build` both green).

Owner direction: color theming was the most neglected area and no longer worked as intended. Decisions: one brand color (drop secondary/tertiary/accent), auto-generate a tint/shade range from a single hex, drop light mode and improve dark-mode contrast, move icons off MUI to an independent currentColor-native library.

What is actioned:

- **Brand ramp engine** — `src/lib/brandRamp.ts`: OKLCH single-hex → 11-stop ramp (`--brand-50…2100`) + `--brand` = the verbatim hex. Lighter stops are tints toward white, darker are shades toward black; hue/chroma preserved, chroma gently relaxed at the extremes.
- **themeStore** — `ThemeColors` reduced to `{ primary }`. Presets are one hex each (radius/spacing/icon-style kept, independent of color). `applyThemeToDom` emits the ramp (space-separated `r g b`) plus legacy `--color-primary` (comma) and points `--color-secondary/tertiary/accent` at the brand for backward compatibility.
- **Tokens** — `index.css` brand/accent/focus semantic tokens now derive from ramp stops (`fg-brand`→`--brand-300`, `bg-brand-solid`→`--brand-600`, `stroke-focus`→`--brand-400`, accent→brand). `tailwind.config.js` gained a `brand` color key (`bg-brand-600`, `text-brand-300`, `/<alpha>` support); `glow-*` shadows are theme-bound via `--brand`. Static `--brand-*` fallback added to `:root`.
- **Light mode dropped** — `:root` promoted to the canonical dark palette (surfaces/controls/foregrounds/strokes); dead `.dark` block deleted. Muted foregrounds brightened (`fg-secondary` `#c4c4c4`, `fg-tertiary` `#8a8a8a`) for contrast on `#111`. The dark-on-dark bug (semantic `fg-primary` was `#171717`) is fixed.
- **Customization UI** — single Brand Color picker + live ramp preview; preset swatches show one color; removed the 4-channel editor.
- **Icons → Phosphor** — `src/lib/phosphorIconCatalog.tsx` (keyed by the same display names the old MUI catalog used, so saved `mui:` refs still resolve). `AppIcon` handles `ph:` and legacy `mui:`; `iconScale` source type is now `'phosphor'`; AdminPanel picker writes `ph:`. `src/lib/muiIconCatalog.tsx` deleted; `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` uninstalled.

Still pending / follow-ups:

- **Bundle size:** Phosphor bundles all 6 weights per icon and `AppIcon` is in the main chunk → main chunk grew ~430 kB raw (~79 kB gzip). Consider code-splitting the catalog (lazy-load the picker; keep `AppIcon` resolving only assigned icons) in a later pass.
- **Backgrounds: library expansion + brand-themed + categorized picker — done (2026-06-08).**
  - **Fixed 3 more black backgrounds:** `default-starcitizen-aurora`, `default-starcitizen-beams`, `default-hud-grid` were still the dead `aurora`/`beams`/`grid` types (url `''`, deleted components) → converted to `animated-gradient` with cyan palettes. (The earlier pass only fixed the first three.)
  - **New `solid` background type** (renders `config.base`): added neutral solids **Ink** (`#0a0a0c`), **Graphite** (`#16181d`), and **Brand Tint** (`rgb(var(--brand-1700))`, theme-bound).
  - **Brand Gradient** static preset (`linear-gradient(…, rgb(var(--brand-1300)), #0b0b10)`) — re-tints with the brand, alongside the existing animated **Brand Flow**.
  - **Categorized picker:** the Settings background grid is now grouped into labeled sections — **Animated / Gradient / Solid / Images** — with the solid swatch preview added. Cleaner, Windows-11-style organization; card render extracted to a local `renderCard` helper.
  - `DesktopBackground` renders the `solid` type; `DesktopBackground` type union gained `'solid'`.
  - Verified: typecheck clean · `lint:tokens` ✓ · build exit 0.
- **Backgrounds: animated gradients + thumbnail/render fixes — done (2026-06-08).**
  - **Dead backgrounds fixed:** the `aurora`/`beams`/`grid` presets had `url: ''` and depended on the deleted Aceternity components, so they rendered solid black on the desktop. Converted them (and added a new **Brand Flow**) to a new `type: 'animated-gradient'` that renders via CSS in `DesktopBackground`.
  - **Animated gradients (CSS, not WebGL):** `.animated-gradient` in `index.css` drifts soft colour blobs using **only `transform`** (compositor-friendly, no blur, `prefers-reduced-motion` aware). Colours come from `config.colors` → `--ag-c1/2/3` + `--ag-base`. Chose CSS over a WebGL lib (e.g. unicorn.studio) deliberately: keeps GPU load low next to draggable windows, ships no dependency, and — key — **Brand Flow references the brand ramp (`rgb(var(--brand-400/600/800))`) so the animated background re-tints with the theme.** Presets: Brand Flow (themed), Aurora Dreams (violet), Ember Flow (warm), Cyan Flow.
  - **Settings thumbnails fixed:** the grid keyed previews off `bg.type`, so older uploads lacking a `type` field (and animated types) showed a dark placeholder. Now data-driven: detects gradient/image from the URL, renders `<img>` for images, the live `.animated-gradient` for animated presets, and a `bg-os-ink-800` token placeholder otherwise.
  - **Browser opened on the wrong page:** the browser app has no `url`, so `WindowState.url` was `undefined` → WindowManager passed `''` → Browser's `HOME_URL` default was bypassed and it fell through to `renderExternal()`. Fixed at both ends: `WindowManager` defaults to `browser://home`, and `Browser` normalizes empty/`newtab` → `HOME_URL`.
- **Design-token guardrail added — done (2026-06-07).** `scripts/check-design-tokens.mjs` + `npm run lint:tokens` scans `src/components` and fails on raw hex utilities, inline-style hex, or Tailwind palette-color-for-semantic-intent. White/black alpha is intentionally allowed (theme-neutral OS-chrome language, ~856 uses, not debt). Allowlist: `Resume.tsx`, `DesktopIcons.tsx`. Currently passes clean — locks in the stabilized state against regressions (CI-ready). Documented in CLAUDE.md Visual Rules + DESIGN_SYSTEM.
- **Semantic feedback-color stabilization — done (2026-06-07).** After the brand sweep, migrated the remaining status palette-colors to feedback tokens so error/warning stay fixed-meaning (and never shift with the brand): `button.tsx` `danger`/`ghostDanger` → `fg-error`/`bg-error-subtle`/`bg-error`/`border-stroke-error`; `ImageViewer` error icon → `fg-error`; `Music` no-audio warning → `fg-warning`; `CV` featured star → `fg-warning`/`fill-fg-warning`. Audit now shows **0 raw hex, 0 inline-style hex, 0 palette colors** in `src/components` except two intentional non-themeable contexts: **Resume.tsx** (printable white-paper CV — brand/chrome tokens are dark-chrome-tuned and illegible on paper) and **DesktopIcons.tsx** (dynamic contrast against the user's wallpaper, not a theme surface). Both documented in `docs/DESIGN_SYSTEM.md` § "Intentional palette exceptions". Typecheck clean, build exit 0.
- **Legacy `primary*`/`secondary*`/`tertiary*`/`accent*` utility sweep — done (2026-06-07).** All 38 components migrated to canonical `brand-*` / `fg-brand` / `fg-on-primary` utilities; **0 legacy color-utility classes remain** in `src/components` (verified by grep), typecheck clean, build exit 0. Role-based mapping (not blind rename) preserved appearance: brand text/icons → `text-fg-brand` (bright on dark chrome); solid fills → `bg-brand-600`; hovers → `bg-brand-800`; subtle fills/borders kept their alpha on `brand-600`; gradients → brand ramp stops. Context-sensitive cases handled individually: **Resume** headings render on white print paper so `text-primary-600` → `text-brand-800` (dark, not bright); **Skills** proficiency Advanced/Expert kept distinct via `brand-600`/`brand-400` instead of collapsing to one color; CSS `accent-color` sliders (Music/VolumePopup) → `accent-brand-*`. Done in tiers (chrome → app screens → popups/widgets/giants) with a build check per tier.
  - **Not removed (intentional, pending explicit sign-off):** the compatibility layer — the `primary/secondary/tertiary/accent` Tailwind scales in `tailwind.config.js` and the `--color-secondary/tertiary/accent` vars in `themeStore`/`index.css` — is now unused by components but still referenced by a few arbitrary CSS values (`rgba(var(--color-primary), …)` in the scrollbar + DesktopWidgets gradient). Left in place to avoid an un-vetted deletion; safe to retire in a dedicated follow-up.
  - **Follow-up:** a handful of app buttons still use literal `text-white` on a `bg-brand-600` fill (Browser actions, FileExplorer/Portfolio view toggles, ArticleComments submit). Fine for the default red brand; for a very light brand they should adopt `text-fg-on-primary` like the shared Button/CTAs already do.
- **Theming consolidated into the Settings app — done (2026-06-06).** There were two theming surfaces: the Start Menu → Customization modal (real controls) and the Settings → Appearance tab, whose "Accent Color" (`preferences.accentColor`, defaulting to legacy blue `#667eea`) and "Font Size" (`preferences.fontSize`) were **dead** — written to `userStore` but read by nothing. Removed those dead controls; the Settings Appearance tab is now the canonical theme home, with a real Theme panel (single brand color + presets + live ramp preview + corner-radius/spacing/icon-style) bound to `themeStore`. The Start Menu "Appearance" button now opens the Settings app; `CustomizationSettings.tsx` was deleted (its background/profile/layout functions all exist in Settings). `preferences.accentColor`/`fontSize` remain as harmless unused fields on the userStore type.
- **"Smart" foreground/icon contrast — done (2026-06-06).** `idealOnColor()` in `brandRamp.ts` (WCAG luminance → black/white) computes `--color-fg-on-primary` from `--brand-600` in `themeStore`. Brand-solid buttons (`solid-brand-*`) and the Music play CTA now use `bg-brand-600 text-fg-on-primary`; their currentColor SVG icons inherit it, so the brand hue never hurts legibility. Remaining: extend the smart on-color to any other ad-hoc brand-filled chips/badges as they're touched.
- A machine-level Windows file lock corrupted `node_modules` mid-migration (vite + @types/react-dom went missing); fixed by restoring `vite@^5.4.21` in package.json and a clean reinstall. If typecheck suddenly reports missing `vite/client`/png/`react-dom/client` types, it is a broken install, not a code regression.
