# Implementation Progress Tracker

> Last audited: 2026-05-01. This tracker reflects what is actually present in the codebase, not only what the planning docs describe.

## Summary

The project has already actioned a meaningful amount of the first five refinement sections. The current state is not a blank slate and should not be treated like one.

Overall status:

| Section | Area | Status |
|---|---|---|
| 1 | Context Menu System | Partially actioned |
| 2 | File Explorer Locations And Permissions | Mostly actioned |
| 3 | Window Surfaces And Behavior | Partially actioned |
| 4 | Start Menu And App Registry | Mostly actioned |
| 5 | CV And AboutOS | Mostly actioned |
| 6 | Feedback App | Pending |
| 7 | System Components | Partially actioned |

## Section 1: Context Menu System

Status: **Partially actioned**

What is actioned:

- `src/components/ContextMenu.tsx` exists and renders the active context menu.
- `src/lib/contextMenuRegistry.ts` exists with:
  - `ContextId`
  - `ContextMenuItemDef`
  - `ContextMenuRequest`
  - `ContextPermission`
  - `resolveMenuItems`
  - `sortAndSeparate`
- Desktop right-click menu exists in `src/components/Desktop.tsx`.
- File Explorer right-click menu exists in `src/components/apps/FileExplorer.tsx`.
- Start Menu app right-click menu exists in `src/components/StartMenu.tsx`.
- Context menu styling has moved closer to Product Mono with compact dark menu rows and danger states.

Still pending:

- `contextMenuRegistry.ts` is not yet broadly wired into surfaces. Menus are still mostly assembled locally in components.
- `resolveMenuItems` is currently light; it does not yet enforce meaningful permission filtering.
- `sortAndSeparate` exists but is not visibly adopted by the main menu producers.
- Window title bar context menu is still pending.
- Taskbar app-button context menu is still pending.
- Admin record context menu is still pending.
- File-type-specific menu resolution is still mostly local to File Explorer.

Next smallest action:

Move File Explorer menu creation into `contextMenuRegistry.ts` first, because it already has the richest action set and permission context.

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
- File Explorer side navigation includes `Projects`, `Images`, and `Visitor Gallery`.
- File Explorer already supports grid/list views, sorting, searching, uploading, drag/drop, selecting, renaming, duplicating, deleting, cutting, copying, and pasting.
- Visitor Gallery prevents text-file creation by checking `permissions.canCreateFile`.
- Visitor Gallery upload flow skips non-image files.
- Upload input uses `permissions.allowedUploadTypes`.
- Visitor-created uploads can be marked with `isVisitorOwned`.
- Protected files/folders are guarded in `fileStore.removeFile`.

Still pending:

- Side navigation does not yet appear to include the full OS set: Desktop, Documents, Downloads, Projects, CV, Images, Visitor Gallery, System.
- Visitor Gallery still uses client-side upload filtering. Storage/security rules should also enforce visitor image-only constraints.
- Visitor Gallery currently skips invalid files silently; it should notify the user.
- General/root areas still allow visitors to create text files and upload videos. That may be acceptable for admin/system areas, but should be intentionally scoped.
- `Desktop.tsx` still supports global desktop drop upload to root, including videos. This should be reviewed so it does not bypass Visitor Gallery rules.
- There is no Trash location yet.

Next smallest action:

Add the full File Explorer side-nav locations and make invalid Visitor Gallery uploads show a clear notification.

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

Still pending:

- `preferredWindowMode`, `mobileBehavior`, and `minSize` are not fully enforced.
- `Window.tsx` still handles surfaces with local class maps rather than fully leaning on `ChromeSurface`/`ContentSurface`.
- File Explorer and Settings are currently marked `utilityDark` in `desktopStore.ts`, even though the design direction says their body surfaces should likely be content/light or use clearer mixed chrome/content anatomy.
- Mobile window behavior is not yet intentionally handled.
- Title-bar context menu is pending.
- Taskbar-position-safe maximize behavior needs review for left/right/top taskbar positions.

Next smallest action:

Enforce `minSize` and `mobileBehavior` in `openWindow`/`Window`, then move title-bar surface styling onto the shared surface primitives.

## Section 4: Start Menu And App Registry

Status: **Mostly actioned**

What is actioned:

- `src/components/StartMenu.tsx` uses compact black OS chrome.
- Start Menu shows `Keketso OS`.
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

Still pending:

- Start Menu has no explicit `Personal` or `Admin` group yet.
- `Edit in Admin` currently only closes the Start Menu; it does not deep-link/select the app in Admin Panel.
- App Info is disabled rather than opening a real details panel.
- App context menu is locally assembled rather than using the registry.
- Admin Panel project publishing fields should be checked against the new metadata and filled out where missing.

Next smallest action:

Add a real App Info panel or modal, then connect `Edit in Admin` to the specific app record.

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

Still pending:

- Shared `DateRangePicker.tsx` is not present.
- Shared `NotificationPanel.tsx` is not present.
- Shared `SettingsShell.tsx` is not present.
- `Surface` adoption is still incomplete across Window, ContextMenu, FileExplorer, Settings, Admin, and dialogs.
- `MediaSurface` should be adopted on project previews and Visitor Gallery thumbnails.

Next smallest action:

Adopt `FloatingSurface` in `ContextMenu.tsx`, then adopt `MediaSurface` in File Explorer image thumbnails.

## Cross-Cutting Risks

- Some docs still mention Supabase in older places, while the code now uses Firebase for auth, Firestore, and storage.
- Several old gradient/glow styles remain in modals/dialogs and File Explorer.
- The project is mid-transition: shared primitives exist, but not every surface uses them yet.
- Client-side restrictions are useful but should not be treated as the only security layer for visitor uploads.

## Recommended Next Work Order

1. Finish Section 1 by wiring File Explorer and desktop context menus into the context menu registry.
2. Finish Section 2 by completing File Explorer side-nav locations and Visitor Gallery user feedback for rejected uploads.
3. Finish Section 3 by enforcing `minSize`, `mobileBehavior`, and taskbar-aware maximize behavior.
4. Finish Section 4 by adding real App Info and Admin deep-link behavior.
5. Finish Section 5 by moving CV/AboutOS shells onto shared surfaces.
6. Start Section 6 with a basic Feedback app.
7. Continue Section 7 by adopting `Surface` primitives in the highest-visibility shell components.

