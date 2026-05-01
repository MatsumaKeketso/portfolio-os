# Keketso OS Behavior Model

> Keketso OS should feel like an operating system first and a portfolio through that operating system. This document defines the frontend behaviors that make a web-based OS feel real.

## Principle

We are not building a hardware operating system. We are building a browser-native operating system experience. That means we cannot control real devices, drivers, installed native programs, or the user's physical file system without browser permissions. But we can model the frontend behaviors people associate with an OS:

- Desktop shell
- Taskbar
- Start menu
- Windows
- File Explorer
- App launching
- Context-aware right-click menus
- Clipboard operations
- Drag and drop
- Search
- Notifications
- Settings
- File type handling
- App installation or registration
- System utilities
- User folders

The goal is not to copy Windows exactly. The goal is to align with familiar OS patterns first, then express them through Keketso OS's design language.

This should not become a strict operating-system purity test. Keketso OS is still a website, and the web can do things native operating systems do not usually do. If a website affordance creates a richer portfolio experience, it can belong inside the OS as an app, panel, widget, or spatial interaction.

Use this rule:

```text
Familiar OS behavior gives the experience structure.
Web-native affordances give the experience life.
```

For example, public feedback should not be dismissed just because a native OS would not usually have it. It should become a designed app or experience with its own rules.

## Frontend OS Capability Map

### Can Support In A Web OS

- Virtual desktop with icons and background.
- Start menu / app launcher.
- Taskbar with pinned apps, running apps, clock, system tray.
- Window management: open, close, minimize, maximize, restore, focus, resize, drag, cascade.
- File Explorer with virtual folders and files.
- Side navigation for common locations.
- File/folder CRUD operations.
- Upload/download of supported files.
- File previews for images, text-like safe content, PDFs if allowed, and media if allowed.
- Context-aware right-click menus.
- Keyboard shortcuts.
- Clipboard inside the app.
- Drag/drop inside File Explorer and from local computer into allowed upload zones.
- App registry: built-in apps, project apps, iframe apps, external link apps.
- Admin installation/registration of apps.
- Notifications and notification history.
- Calendar/date picker, clock, calculator, settings, system monitor.
- User preferences and theme configuration.
- Visitor Gallery with constrained public uploads.

### Cannot Fully Support Like A Native OS

- Native driver or hardware management.
- True system-level installed applications.
- Full access to the user's local file system without explicit browser APIs and permissions.
- Background services after the browser tab is closed unless supported by service workers and browser constraints.
- Real OS-level process management.
- Native shell commands.
- Global keyboard shortcuts outside the browser tab.
- Arbitrary executable file execution.

### Should Not Support As Unbounded System Behavior

These should not be allowed as unrestricted file-system behavior:

- Visitor-uploaded executable files.
- Visitor text files or freeform documents in File Explorer.
- Visitor-provided links inside files or file metadata.
- SVG uploads from visitors.
- HTML/script uploads.
- Anything that lets visitor content behave like trusted system content.

This does not mean the product can never support feedback, comments, reactions, guestbook-style notes, or participatory content. It means those interactions should be designed as bounded experiences with moderation, rate limits, safe rendering, and clear purpose.

## Web-Native Experiences

Keketso OS can contain experiences that are more website-like than Windows-like, as long as they are framed as apps or system spaces.

Examples:

- A Feedback app.
- A guestbook.
- A mood board that changes based on visitor input.
- A visual wall of approved comments.
- A project reaction system.
- A guided onboarding or tour.
- A spatial portfolio room.

These should not be hidden in generic file operations. They should have their own app concept, data model, moderation rules, and visual behavior.

### Feedback App Concept

Create a `Feedback` or `Signal` app where visitors can leave comments about the platform.

Possible behavior:

- Visitors submit short feedback.
- Feedback is stored as plain text.
- Links are stripped or rendered inert.
- Submissions are rate-limited.
- Admin can approve, hide, or delete submissions.
- Approved feedback can influence the space visually.

Ways feedback can shape the OS:

- Add small ambient marks to a feedback wall.
- Change a non-critical color accent for a session.
- Populate a constellation, grid, or dot field.
- Add anonymized snippets to a public panel after approval.
- Unlock a subtle animation state when enough feedback exists.

The feedback should contribute to the feeling of the space, not become a risky freeform content system.

## Shell Model

### Desktop

Desktop is the root workspace.

Capabilities:

- Show pinned app icons.
- Show project app icons.
- Show selected background.
- Support right-click desktop menu.
- Support drag selection if implemented.
- Support dropping approved files into a focused upload target, not blindly anywhere.

Desktop context should include:

- View options.
- Sort options.
- Refresh.
- Paste if clipboard has compatible content.
- New folder only in allowed areas, not globally unless a desktop file area exists.
- Open Settings.
- Open About This OS.

### Taskbar

Taskbar is the active app and system control strip.

Capabilities:

- Start menu button.
- Pinned app launchers.
- Running app indicators.
- Minimized app restore.
- System tray buttons: notifications, settings, clock/calendar.
- Right-click taskbar context menu.

Taskbar context should include:

- Taskbar settings.
- Show desktop.
- Task Manager/System Monitor.
- Notification settings.
- Pin/unpin options when right-clicking an app button.
- Close window when right-clicking a running app button.

### Start Menu

Start Menu is the primary app launcher and system index.

Capabilities:

- Search apps/projects/files.
- Group apps into System, Work, Personal, Admin.
- Show pinned/featured apps.
- Show Generative Studio builder credit.
- Expose Settings, About This OS, CV, File Explorer.

Start menu item context should include:

- Open.
- Open as new window if already running.
- Pin/unpin to taskbar.
- Pin/unpin to desktop.
- App info.
- Admin edit, for authenticated admin users.

## Window Model

### Core Behaviors

Every window should support:

- Focus.
- Bring to front.
- Drag by title bar.
- Resize when allowed.
- Minimize.
- Maximize.
- Restore.
- Close.

Window state should track:

- `id`
- `appId`
- `position`
- `size`
- `zIndex`
- `isFocused`
- `isMinimized`
- `isMaximized`
- `surfaceMode`
- `canResize`
- `canMinimize`
- `canMaximize`

### Window Contexts

Title bar right-click:

- Restore
- Move, if implemented
- Size, if implemented
- Minimize
- Maximize
- Close
- App info

Window body right-click:

- App-specific actions first.
- Common actions where relevant: copy, paste, select all.
- View options where relevant.
- Inspect/details only for admin or debug modes, if exposed.

Window control right-click is optional. If implemented, it should not conflict with normal click actions.

### App Surface Modes

Use app metadata to decide how the window body behaves:

- `content`: light OS content surface.
- `utilityDark`: dark utility app.
- `immersive`: project/demo controls the interior.
- `iframe`: browser/project embed.

This keeps window behavior consistent while allowing project apps to feel unique.

## File Explorer Model

### Common Locations

The side nav should mimic familiar OS locations while fitting this portfolio:

- Desktop
- Documents
- Downloads
- Projects
- CV
- Images
- Visitor Gallery
- System
- Trash, if implemented

Optional admin-only locations:

- Portfolio Assets
- App Registry
- Upload Moderation
- System Config

### File And Folder Operations

Folders:

- Open
- New folder
- Rename
- Move
- Copy
- Paste
- Duplicate
- Delete or move to Trash
- Properties

Images:

- Open/preview
- Copy
- Download
- Rename if permitted
- Move if permitted
- Delete if permitted
- Set as background, admin only or owner only
- Properties

Project app records, if represented in Explorer:

- Open app
- Pin to desktop
- Pin to taskbar
- Edit in Admin, admin only
- Properties

Visitor Gallery:

- Visitors may create folders inside Visitor Gallery only.
- Visitors may upload approved images only.
- Visitors may not create text files.
- Visitors may not upload links, SVG, PDF, video, archive, HTML, scripts, executable, or unknown file types.

### File Type Handling

Suggested web-safe support:

```text
folder      Open in File Explorer
image       Preview, download, properties, optional set as background
project     Launch app / open project details
link        Admin-created only, open external/project URL
document    Admin-controlled CV/project docs only, not visitor-created
config      Admin-only view/edit
unknown     Properties/download only, no preview
```

Visitor-created types should be limited to images.

## App Model

### Built-In System Apps

System apps make the OS feel real:

- File Explorer
- Settings
- About This OS
- CV
- Task Manager/System Monitor
- Calculator
- Clock
- Calendar/date picker
- Notification Center

Optional apps:

- Camera-style app if it uses uploaded/project media, not real camera unless explicitly needed.
- Games if they demonstrate creative/technical work.
- Design tools if they showcase Keketso's systems/motion/interface thinking.

### Project Apps

Projects are portfolio entries.

Each project app should have:

- Name
- Icon
- Description
- Type: component, iframe, static, external
- Tags
- Status
- Role/year
- Screenshots
- Default size
- Surface mode
- Pinning options

### App Installation / Registration

In a web OS, "installing an app" means registering it in the app registry.

Admin install flow:

1. Add app/project.
2. Choose app type.
3. Add metadata.
4. Choose icon/custom icon.
5. Set default window behavior.
6. Pin to desktop/taskbar if needed.
7. Publish.

Visitor install flow should not exist unless intentionally designed as a safe, local-only personalization feature.

## Context Menu Taxonomy

Windows has many context menus because the context changes by surface, selection, and file type. Keketso OS should model this with a context registry rather than one generic menu.

Recommended contexts:

1. `desktop.empty`
2. `desktop.icon`
3. `taskbar.empty`
4. `taskbar.appButton`
5. `startMenu.app`
6. `window.titlebar`
7. `window.body`
8. `fileExplorer.empty`
9. `fileExplorer.sidebarItem`
10. `fileExplorer.folder`
11. `fileExplorer.file`
12. `fileExplorer.image`
13. `fileExplorer.project`
14. `fileExplorer.visitorFolder`
15. `fileExplorer.visitorImage`
16. `notification.item`
17. `settings.sidebarRow`
18. `admin.record`
19. `media.preview`
20. `textSelection`

This is a starting set, not a hard limit. The key is that menus are context-aware and composable.

### Common Menu Groups

Use groups consistently:

```text
Primary action
Open / Preview / Launch

Clipboard
Cut / Copy / Paste / Duplicate

Organization
Rename / Move / Pin / Sort / View

Share/export
Download / Copy link / Open external

System
Properties / App info / Settings

Danger
Delete / Remove / Uninstall
```

### Example Menus

Desktop empty:

- View
- Sort by
- Refresh
- Paste, if available
- New folder, if desktop files are enabled
- Open Terminal/Command Palette, optional
- Settings
- About This OS

Desktop icon:

- Open
- Open in new window
- Pin/unpin to taskbar
- Remove from desktop
- App info
- Properties

Taskbar empty:

- Taskbar settings
- Show desktop
- Open Task Manager
- Notification settings

Taskbar app button:

- Open/restore
- Minimize
- Pin/unpin to taskbar
- Close window
- App info

Window title bar:

- Restore
- Minimize
- Maximize
- Move, optional
- Resize, optional
- Always on top, optional
- Close

File Explorer empty area:

- New folder, if permitted
- Upload image, if permitted
- Paste, if compatible
- View
- Sort by
- Refresh
- Properties

Folder:

- Open
- Open in new window
- Rename, if permitted
- Copy
- Move
- Delete, if permitted
- Properties

Image:

- Open preview
- Download
- Copy
- Rename, if permitted
- Move, if permitted
- Set as background, if admin/owner permitted
- Delete, if permitted
- Properties

Visitor image:

- Open preview
- Download
- Report, optional
- Properties
- Admin only: approve, hide, delete

Admin app/project record:

- Open
- Edit
- Duplicate
- Pin to desktop
- Pin to taskbar
- Unpublish
- Delete
- Properties

## Context Menu Engine

Implement menus as data, not hardcoded JSX per surface.

Suggested model:

```typescript
type ContextId =
  | 'desktop.empty'
  | 'desktop.icon'
  | 'taskbar.empty'
  | 'taskbar.appButton'
  | 'window.titlebar'
  | 'fileExplorer.image'
  | 'admin.record';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  group?: 'primary' | 'clipboard' | 'organize' | 'share' | 'system' | 'danger';
  disabled?: boolean;
  hidden?: boolean;
  danger?: boolean;
  action: string;
}

interface ContextMenuRequest {
  context: ContextId;
  targetId?: string;
  targetType?: string;
  selectionIds?: string[];
  permissions?: string[];
}
```

Candidate files:

- `src/components/ContextMenu.tsx`
- `src/store/desktopStore.ts`
- `src/store/fileStore.ts`
- `src/types.ts`
- New helper: `src/lib/contextMenuRegistry.ts`

Acceptance criteria:

- Right-click menus differ by context.
- Common actions appear consistently.
- Unsupported actions are hidden or disabled, not broken.
- Permissions affect menu contents.
- Visitor Gallery menus are more restricted than admin/system menus.

## Keyboard And Pointer Behaviors

Operating systems feel real because common gestures work.

Recommended shortcuts:

- `Enter`: open selected item.
- `Delete`: delete or move to Trash if permitted.
- `F2`: rename if permitted.
- `Ctrl+C`: copy.
- `Ctrl+X`: cut.
- `Ctrl+V`: paste.
- `Ctrl+A`: select all in active list.
- `Esc`: close menu/dialog or clear selection.
- `Alt+F4`: close active window.
- `Win/Cmd+D`: show desktop if browser allows capture inside app.
- `Ctrl+O`: open File Explorer or open dialog, depending active app.

Pointer:

- Double-click opens desktop icons and folders.
- Single-click selects.
- Drag moves windows by title bar.
- Drag moves files when permitted.
- Drag from local desktop uploads only into explicit upload targets.

## System Settings

Settings should include OS-level controls:

- Appearance: theme, density, background, image treatment.
- Taskbar: position, size, pinned apps, auto-hide if implemented.
- Windows: animation, default open behavior, mobile behavior.
- Files: upload limits, Visitor Gallery rules, default view.
- Notifications: enabled, history, sound if ever supported.
- Apps: app registry, pinned apps.
- About/System: version, build, credits.

Admin-only settings should be clearly separated.

## Implementation Phases

### Phase 1: Behavior Inventory

- Audit current Desktop, Taskbar, Window, File Explorer, ContextMenu, and stores.
- List existing interactions.
- Identify missing right-click contexts.

### Phase 2: Context Menu Registry

- Create context IDs.
- Define common menu groups.
- Implement menu resolution based on context, target, selection, permissions.
- Wire into existing `ContextMenu.tsx`.

### Phase 3: File Explorer OS Locations

- Add side nav locations: Desktop, Documents, Downloads, Projects, CV, Images, Visitor Gallery, System.
- Map locations to virtual folders.
- Apply per-location permissions.

### Phase 4: Window Behavior Normalization

- Standardize title bar context menu.
- Standardize minimize/maximize/restore/focus.
- Add surfaceMode and preferredWindowMode where needed.

### Phase 5: App Registry

- Treat admin-added projects as installable app records.
- Add app metadata for surface/window behavior.
- Support pinning and app info menus.

### Phase 6: Visitor Gallery Permissions

- Lock visitor actions to folder creation and image upload only.
- Restrict context menus accordingly.
- Add moderation actions for admin.

### Phase 7: Settings And System Utilities

- Add OS settings for appearance, taskbar, windows, files, notifications, apps, and about.
- Add or improve Clock/Calendar and Notification Center if they become system tray features.

## Acceptance Checklist

- The app feels like an operating system before it feels like a portfolio website.
- Desktop, taskbar, windows, files, and apps have familiar OS behaviors.
- File Explorer has common OS locations in the side nav.
- Apps can be registered/installed through Admin.
- Right-click menus are context-aware.
- File and folder CRUD works where permissions allow it.
- Visitor Gallery has stricter behavior than admin/system areas.
- Window title bars, taskbar buttons, desktop icons, file items, and admin records all expose appropriate menus.
- Common keyboard shortcuts work inside the web OS.
- The system remains web-safe and does not pretend to support native capabilities it cannot actually provide.
