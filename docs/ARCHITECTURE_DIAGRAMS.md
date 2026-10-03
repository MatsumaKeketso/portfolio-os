# GenOS — Architecture Diagrams (Eraser)

Diagram-as-code for [Eraser](https://app.eraser.io). Each block is pasted into a new
Eraser diagram of the type noted in its heading. Keep these in sync with
`src/components/Desktop.tsx` (boot), `src/store/desktopStore.ts` (app registry,
`openWindow`), and `src/components/WindowManager.tsx` (lazy app map).

Verified against code on 2026-09-18.

---

## 1. System architecture by load phase — *Flow Chart*

Shows the initial bundle, the parallel boot fan-out, Firebase + local backups,
the 9 Zustand stores, the always-mounted shell, the post-login refetch, the
`openWindow` decision path, and which apps are warmed at boot vs. lazy-loaded.

```eraser
direction down
colorMode pastel
styleMode shadow
typeface clean

// ─────────────────────────────────────────────
// PHASE 0 — Initial bundle (before any React)
// ─────────────────────────────────────────────
Browser [shape: oval, icon: globe, label: "Browser opens genos.dev"]
IndexChunk [icon: package, color: gray, label: "index-*.js  (2.4 MB · 565 kB gz)  main chunk: React, stores, shell, AppIcon + Phosphor catalog"]
Main [icon: react, label: "main.tsx  →  App.tsx  →  ThemeProvider  →  Desktop"]
PWA [icon: cloud, color: gray, label: "prod only: registerServiceWorker() + initPWAInstallPrompt()"]

Browser > IndexChunk
IndexChunk > Main
Main --> PWA

// ─────────────────────────────────────────────
// PHASE 1 — Boot (Desktop.tsx · Promise.all · min 950 ms)
// ─────────────────────────────────────────────
Boot [icon: clock, color: orange, label: "BOOT  ·  9 tasks run in parallel  ·  boot screen shown until all settle"] {
  auth [icon: lock, label: "auth · checkSession()  onAuthStateChanged → role guest | superuser"]
  theme [icon: palette, label: "theme · fetchTheme()  brand hex → OKLCH ramp → CSS vars"]
  profile [icon: user, label: "profile · fetchProfile()"]
  archive [icon: folder, label: "archive · fetchFileSystem()"]
  apps [icon: layout, label: "apps · fetchApps()  defaults ⊕ local backup ⊕ remote"]
  backgrounds [icon: image, label: "backgrounds · fetchBackgrounds()"]
  modules [icon: package, label: "modules · warmStartupModules()  preload 7 app chunks"]
  timeline [icon: calendar, label: "timeline · loadTimeline()"]
  observatory [icon: eye, label: "observatory · loadObservatory()"]
}

Main > Boot

// ─────────────────────────────────────────────
// DATA — Firebase + local backups
// ─────────────────────────────────────────────
Firebase [icon: firebase, color: yellow, label: "Firebase (only backend)"] {
  FbAuth [icon: lock, label: "Auth · email/password · admin@os.com = superuser"]
  Firestore [icon: database, label: "Firestore · os-site_content/*"] {
    docTheme [label: "theme"]
    docProfile [label: "profile  (personal, resume, skills, milestones)"]
    docFilesystem [label: "filesystem"]
    docApps [label: "apps"]
    docBackgrounds [label: "backgrounds"]
    docTimeline [label: "timeline"]
    docObservatory [label: "observatory"]
  }
  Storage [icon: hard-drive, label: "Storage · backgrounds/ milestones/ portfolio-files/ desktop-uploads/ visitor-gallery/ file-explorer/"]
}

LocalBackup [icon: save, color: gray, label: "localStorage mirrors · portfolioOS_profile / _filesystem / _apps / _backgrounds / _selectedBackground / _systemPreferences"]

auth > FbAuth
theme > docTheme
profile > docProfile
archive > docFilesystem
apps > docApps
backgrounds > docBackgrounds
timeline > docTimeline
observatory > docObservatory

profile <> LocalBackup: merge on load, write on save
archive <> LocalBackup
apps <> LocalBackup
backgrounds <> LocalBackup

// ─────────────────────────────────────────────
// STATE — 9 Zustand stores (all in main chunk)
// ─────────────────────────────────────────────
Stores [icon: typescript, color: blue, label: "Zustand stores (9)"] {
  authStore [label: "authStore · isAdmin / isGuest / role"]
  themeStore [label: "themeStore · brand ramp"]
  userStore [label: "userStore · profile, CV, milestones"]
  fileStore [label: "fileStore · files, nav, clipboard, trash"]
  desktopStore [label: "desktopStore · apps, windows, backgrounds, prefs"]
  timelineStore [label: "timelineStore"]
  observatoryStore [label: "observatoryStore"]
  notificationStore [label: "notificationStore · localStorage"]
  mediaStore [label: "mediaStore · current track (audioEngine singleton)"]
}

auth > authStore
theme > themeStore
profile > userStore
archive > fileStore
apps > desktopStore
backgrounds > desktopStore
timeline > timelineStore
observatory > observatoryStore

// ─────────────────────────────────────────────
// PHASE 2 — Desktop shell (mounted once, always present)
// ─────────────────────────────────────────────
Shell [icon: monitor, color: green, label: "DESKTOP SHELL · rendered when hasBootstrapped = true"] {
  DesktopBackground [icon: image, label: "DesktopBackground · solid / gradient / animated-gradient / image"]
  DesktopIcons [icon: layout, label: "DesktopIcons · apps.pinnedToDesktop + folder-desktop files"]
  Taskbar [icon: layout, label: "Taskbar + StartMenu · pinnedToTaskbar + open windows"]
  TimelineStrip [icon: calendar, label: "Timeline strip (milestones from userStore)"]
  WindowManager [icon: layout, label: "WindowManager · renders desktopStore.windows[]"]
  MiniPlayer [icon: music, label: "MiniPlayer · shows when mediaStore has a track"]
  Overlays [icon: bell, label: "NotificationContainer · ContextMenu · LoginModal · WelcomeScreen · KeyboardShortcutsHelp · PWAInstallPrompt"]
}

Boot > Shell: all 9 tasks settled (errors fall back to seed/local data)
desktopStore > DesktopIcons
desktopStore > Taskbar
desktopStore > WindowManager
fileStore > DesktopIcons
userStore > TimelineStrip
mediaStore > MiniPlayer

// ─────────────────────────────────────────────
// PHASE 2b — After sign-in (auth state change)
// ─────────────────────────────────────────────
PostLogin [icon: refresh-cw, color: orange, label: "isAuthenticated flips → refetch profile, filesystem, apps, backgrounds, timeline, observatory (role-aware visibility; superuser sees drafts/private)"]
authStore > PostLogin
PostLogin --> Firestore

// ─────────────────────────────────────────────
// PHASE 3 — On open (per window)
// ─────────────────────────────────────────────
OpenFlow [icon: mouse-pointer, color: purple, label: "ON OPEN · desktopStore.openWindow(app, fileData?)"] {
  Trigger [shape: oval, label: "click desktop icon / taskbar / Start Menu / double-click file"]
  Reuse [shape: diamond, label: "existing window?  singleInstance · same fileId · empty window for appId"]
  Focus [label: "un-minimize + bringToFront (zIndex = max+1)"]
  Create [label: "new WindowState · defaultSize / minSize / surfaceMode / mobileBehavior"]
  Render [label: "Window.tsx chrome  →  Suspense  →  lazy(import('./apps/X'))"]
}

Trigger > Reuse
Reuse > Focus: yes
Reuse > Create: no
Create > Render
DesktopIcons > Trigger
Taskbar > Trigger
WindowManager > Render

// ─────────────────────────────────────────────
// APPS — what actually loads, and when
// ─────────────────────────────────────────────
Warmed [icon: zap, color: green, label: "WARMED AT BOOT · chunk already in cache, opens instantly"] {
  FileExplorer [icon: folder, label: "Archive (FileExplorer) · 1.2 MB chunk — pulls in Tiptap via case-study panel"]
  BrowserApp [icon: globe, label: "Browser · Reads + external URLs"]
  CV [icon: user, label: "CV · reads userStore"]
  AboutOS [icon: info, label: "About This OS · hardcoded content"]
  Settings [icon: settings, label: "Settings · profile / appearance / system / privacy / data"]
  ImageViewer [icon: image, label: "Image Viewer"]
  Music [icon: music, label: "Music · singleInstance, bound to audioEngine"]
}

LazyApps [icon: download, color: gray, label: "LAZY · chunk fetched on first open"] {
  Timeline [icon: calendar, label: "Timeline app"]
  Finance [icon: dollar-sign, label: "Finance"]
  Weather [icon: sun, label: "Weather"]
  TaskManager [icon: activity, label: "Task Manager"]
  Calculator [icon: calculator, label: "Calculator"]
  Notepad [icon: file-text, label: "Notepad"]
  PDFReader [icon: file, label: "PDF Reader · iframe of Storage URL"]
  VideoPlayer [icon: video, label: "Video Player"]
  Feedback [icon: message-square, label: "Feedback"]
  AdminPanelApp [icon: shield, label: "Admin Panel · isAdmin only · apps / backgrounds / milestones / reads / feedback / gallery"]
  GitHub [icon: github, label: "GitHub · iframe app"]
}

Dead [icon: trash, color: red, label: "REGISTERED BUT UNREACHABLE · About.tsx (1.7k lines) · Resume · Portfolio · Skills · Contact"]

modules --> Warmed: import() preload
Render > Warmed
Render > LazyApps
Render --> Dead: only via a Firestore-saved custom app

// ─────────────────────────────────────────────
// FILE ROUTING — double-click a file in Archive / Desktop
// ─────────────────────────────────────────────
FileRouter [icon: git-branch, color: purple, label: "fileRouter.ts · picks app by file type"]
FileExplorer > FileRouter
DesktopIcons > FileRouter
FileRouter > Music: audio  (audio.play() inside the click handler)
FileRouter > PDFReader: pdf
FileRouter > VideoPlayer: video
FileRouter > ImageViewer: image
FileRouter > Notepad: text
FileRouter > LazyApps: other → FileViewer

// Stores the apps read from
userStore > CV
userStore > AdminPanelApp
fileStore > FileExplorer
desktopStore > Settings
authStore > AdminPanelApp: gate
```

---

## 2. Boot timeline — *Sequence Diagram*

What happens between page load and the desktop appearing, plus the two
"later" flows (sign-in refetch, opening an app).

```eraser
title GenOS boot — what happens between page load and the desktop

Browser [icon: globe]
Desktop [icon: react, label: "Desktop.tsx"]
Auth [icon: lock, label: "Firebase Auth"]
Firestore [icon: database, label: "Firestore os-site_content"]
Local [icon: save, label: "localStorage"]
Chunks [icon: package, label: "Vite app chunks"]
Shell [icon: monitor, label: "Desktop shell"]

Browser > Desktop: load index-*.js, mount <App/> → <Desktop/>
activate Desktop
Desktop > Desktop: show boot screen, start 9 tasks in parallel

par [Promise.all — all 9 at once] {
  Desktop > Auth: checkSession() · onAuthStateChanged
  Auth --> Desktop: user | null → role superuser / guest / none
  Desktop > Firestore: get theme
  Firestore --> Desktop: brand hex → apply OKLCH ramp to :root
  Desktop > Local: read portfolioOS_profile / _filesystem / _apps / _backgrounds
  Desktop > Firestore: get profile, filesystem, apps, backgrounds
  Firestore --> Desktop: docs (or empty)
  Desktop > Desktop: merge defaults ⊕ local backup ⊕ remote (remote wins per id)
  Desktop > Local: write merged backups
  Desktop > Chunks: import() FileExplorer, Browser, CV, AboutOS, Settings, ImageViewer, Music
  Chunks --> Desktop: 7 chunks cached
  Desktop > Firestore: get timeline, observatory
  Firestore --> Desktop: entries filtered by role (public+published unless superuser)
}

alt [any task throws] {
  Desktop > Desktop: mark task "error · Using fallback data" — boot continues
}

Desktop > Desktop: wait until ≥ 950 ms elapsed (MIN_BOOT_DURATION_MS)
Desktop > Shell: hasBootstrapped = true
deactivate Desktop
activate Shell
Shell > Shell: mount DesktopBackground, DesktopIcons, Taskbar, TimelineStrip, WindowManager, MiniPlayer, overlays
Shell --> Browser: desktop visible · 0 windows open

opt [user signs in later] {
  Browser > Auth: LoginModal → signInWithEmailAndPassword (or auto-create guest)
  Auth --> Shell: isAuthenticated = true
  Shell > Firestore: refetch profile, filesystem, apps, backgrounds, timeline, observatory
  Firestore --> Shell: role-aware data (superuser now sees drafts, can write)
}

opt [user opens an app] {
  Browser > Shell: click icon / Start Menu / double-click file
  Shell > Shell: openWindow() → reuse existing window or create WindowState
  Shell > Chunks: lazy import (instant if warmed, else network fetch)
  Chunks --> Shell: component
  Shell --> Browser: Window chrome + Suspense fallback → app renders
}
deactivate Shell
```

---

## 3. Boot timeline — *Flow Chart* alternative

Same content as §2 for when a single flow-chart file is preferred. Eraser flow
charts require every relationship to sit **outside** group braces.

```eraser
direction right
colorMode pastel
typeface clean

Load [shape: oval, icon: globe, label: "Page load · index-*.js"]
Mount [icon: react, label: "mount <App/> → <Desktop/> · show boot screen"]

BootTasks [icon: clock, color: orange, label: "9 boot tasks · Promise.all (parallel)"] {
  tAuth [icon: lock, label: "checkSession() → role"]
  tTheme [icon: palette, label: "fetchTheme() → OKLCH ramp on :root"]
  tData [icon: database, label: "fetchProfile / fetchFileSystem / fetchApps / fetchBackgrounds"]
  tMerge [icon: git-merge, label: "merge defaults ⊕ localStorage backup ⊕ remote"]
  tWarm [icon: package, label: "warmStartupModules() · preload 7 app chunks"]
  tContent [icon: calendar, label: "loadTimeline / loadObservatory · role-filtered"]
}

Fallback [icon: alert-triangle, color: red, label: "task throws → 'Using fallback data' · boot continues"]
MinWait [icon: hourglass, label: "wait until ≥ 950 ms elapsed"]
Ready [shape: oval, icon: monitor, color: green, label: "hasBootstrapped = true · shell mounts · 0 windows"]

Login [icon: key, color: orange, label: "later: sign-in → isAuthenticated flips"]
Refetch [icon: refresh-cw, label: "refetch profile, filesystem, apps, backgrounds, timeline, observatory (superuser sees drafts, can write)"]

OpenApp [icon: mouse-pointer, color: purple, label: "later: click icon / Start Menu / file"]
Reuse [shape: diamond, label: "existing window?"]
Focus [label: "un-minimize + bringToFront"]
Create [label: "new WindowState → Window.tsx → Suspense → lazy import (instant if warmed)"]

Load > Mount
Mount > BootTasks
tData > tMerge
BootTasks --> Fallback: on error
BootTasks > MinWait
Fallback > MinWait
MinWait > Ready
Ready --> Login
Login > Refetch
Ready --> OpenApp
OpenApp > Reuse
Reuse > Focus: yes
Reuse > Create: no
```

---

## 4. Permission & data-flow map — *Flow Chart*

Three roles × four enforcement layers. Read left-to-right: who you are → what
the UI shows → what the store will attempt → what Firebase actually allows.
The UI and store layers are *courtesy* gates; only the rules layer is security.

Source: `authStore.ts` (role), `*Store.ts` (`canWrite()`), `filePermissions.ts`,
`contextMenuRegistry.ts` (`resolveMenuItems`), `firestore.rules`, `storage.rules`.

```eraser
direction right
colorMode pastel
typeface clean

// ── Roles ────────────────────────────────────
Roles [icon: users, label: "Who"] {
  Visitor [icon: eye, label: "Visitor · not signed in · role = null"]
  Guest [icon: user, label: "Guest · any email ≠ admin@os.com · auto-created on first sign-in"]
  Superuser [icon: shield, color: red, label: "Superuser · admin@os.com · isAdmin = true"]
}

// ── Layer 1: UI gates ────────────────────────
UI [icon: monitor, color: blue, label: "Layer 1 · UI gates (courtesy only)"] {
  uiAdminPanel [label: "Admin Panel app · isAdmin"]
  uiSettings [label: "Settings · profile / theme / backgrounds / data tabs · isAdmin"]
  uiCV [label: "CV · Populate button · isAdmin"]
  uiExplorer [label: "Archive · create / upload / delete / rename / move · getPermissions(zone, isAdmin)"]
  uiCaseStudy [label: "Project case-study editor · isAdmin"]
  uiTimeline [label: "Timeline · 'Admin view' badge · sees drafts"]
  uiCtxMenu [label: "Context menus · resolveMenuItems(permissions) · danger items need admin/owner"]
  uiStartMenu [label: "Start Menu · Admin / Sign-in entries · isAdmin, isAuthenticated"]
  uiComments [label: "Article comments · delete · isAdmin"]
}

// ── Layer 2: store write guards ──────────────
Store [icon: typescript, color: purple, label: "Layer 2 · store write guards · canWrite() = email === 'admin@os.com'"] {
  stUser [label: "userStore · profile/CV/milestones · guarded"]
  stFile [label: "fileStore · filesystem · guarded"]
  stDesktop [label: "desktopStore · apps, backgrounds · guarded"]
  stTimeline [label: "timelineStore / observatoryStore · guarded + visibility filter"]
  stTheme [color: red, label: "themeStore · NOT guarded · guest theme change → rules reject → console error"]
}

// ── Layer 3: Firestore rules ─────────────────
FsRules [icon: database, color: yellow, label: "Layer 3 · firestore.rules"] {
  frSite [label: "os-site_content/* · read: public · write: superuser"]
  frFeedback [label: "os-feedback · create: anyone (pending only) · read: approved or superuser · moderate: superuser"]
  frComments [label: "os-comments · read/create: anyone · likes: anyone · delete: superuser"]
  frGallery [label: "os-gallery · create: anyone (pending only) · read: approved or superuser · moderate: superuser"]
  frUsers [label: "os-users/{uid} · own doc only · role=guest unless superuser"]
}

// ── Layer 4: Storage rules ───────────────────
StRules [icon: hard-drive, color: yellow, label: "Layer 4 · storage.rules"] {
  srManaged [label: "backgrounds/ milestones/ app-icons/ app-media/ desktop-uploads/ portfolio-files/ reads/ resource-thumbnails/ · read: public · write: superuser · size + type caps"]
  srGallery [label: "visitor-gallery/ · read: public · create: anyone < 5 MB jpeg/png/webp/gif · delete: superuser"]
  srCatchAll [color: red, label: "/{anyOtherFolder}/** · read + write: ANYONE, any size, any type"]
  srExplorer [color: red, label: "file-explorer/ · used by Archive uploads · NOT in managed list → falls into catch-all"]
}

// ── Flows ────────────────────────────────────
Visitor > uiExplorer: read-only + Visitor Gallery upload
Visitor > uiCtxMenu: permissions = visitor
Guest > uiExplorer: same as visitor (no extra rights)
Guest > uiStartMenu: signed-in entries, no Admin
Superuser > uiAdminPanel
Superuser > uiSettings
Superuser > uiCV
Superuser > uiCaseStudy
Superuser > uiTimeline
Superuser > uiCtxMenu: permissions = admin, owner, visitor

uiAdminPanel > stUser
uiAdminPanel > stDesktop
uiSettings > stUser
uiSettings > stDesktop
uiSettings > stTheme
uiCV > stUser
uiExplorer > stFile
uiCaseStudy > stFile
uiTimeline > stTimeline

stUser > frSite
stFile > frSite
stDesktop > frSite
stTimeline > frSite
stTheme > frSite: rejected for non-superuser

uiExplorer > srExplorer: admin uploads land here
uiExplorer > srGallery: visitor gallery uploads
uiAdminPanel > srManaged
uiSettings > srManaged: backgrounds/
uiCaseStudy > srManaged: portfolio-files/
srExplorer --> srCatchAll: inherits public write
Visitor --> srCatchAll: can write directly with the SDK, bypassing UI
```

**Findings this diagram exposes**

1. `file-explorer/` is public-writable. Fix: add it to `isGenOsManagedPath` +
   a superuser-only `match` block (mirrors `desktop-uploads/`). Rule change —
   confirm it is the actual blocker before deploying (see memory rule).
2. `themeStore` has no `canWrite()` guard; every other store does.
3. `ADMIN_EMAIL` is env-driven in `authStore` but hard-coded as
   `'admin@os.com'` in five stores and both rules files. Changing
   `VITE_ADMIN_EMAIL` alone silently breaks writes.
4. Guest gains nothing over Visitor except an `os-users` doc. The role exists
   for future guest-safe flows, not current ones.

---

## 5. Upload persistence path — *Sequence Diagram*

The 7-step contract from the handoff (item 0), drawn once per surface family.
All surfaces go through `lib/uploadUtils.ts` → `uploadBytesResumable`; they
differ in folder, caps, and what metadata write follows.

```eraser
title GenOS upload persistence — one sequence, five surfaces

UI [icon: monitor, label: "Upload surface"]
Validate [icon: check, label: "uploadUtils.validate()"]
Storage [icon: hard-drive, label: "Firebase Storage"]
Store [icon: typescript, label: "Zustand store"]
Local [icon: save, label: "localStorage"]
Firestore [icon: database, label: "Firestore"]
Visitor [icon: eye, label: "Visitor (later)"]

UI > Validate: file + { folder, maxSizeMB, allowedTypes }
alt [size or MIME rejected] {
  Validate --> UI: { success: false, error } → toast, nothing written
}
Validate > Storage: uploadBytesResumable(folder/name)
Storage --> UI: onProgress → UploadProgress toast
alt [Storage rule rejects] {
  Storage --> UI: error → toast, nothing written
}
Storage --> Validate: getDownloadURL()
Validate --> UI: { success: true, url, path }

alt [Archive / Desktop drop — file-explorer/ · desktop-uploads/] {
  UI > Store: fileStore.addFile({ dataUrl: url, mimeType, parentId })
  Store > Local: portfolioOS_filesystem (immediate)
  Store > Firestore: os-site_content/filesystem (debounced 1 s, canWrite only)
}

alt [Background — backgrounds/] {
  UI > Store: desktopStore.addBackground({ url, type: 'image' })
  Store > Local: portfolioOS_backgrounds (immediate)
  Store > Firestore: os-site_content/backgrounds (custom ids only, canWrite only)
}

alt [Milestone image — milestones/] {
  UI > Store: userStore.updateMilestone({ images: [url] })
  Store > Local: portfolioOS_profile (immediate)
  Store > Firestore: os-site_content/profile (canWrite only)
}

alt [Case-study image — portfolio-files/] {
  UI > UI: insert <img src=url> into Tiptap HTML
  UI > Store: fileStore.setCaseStudy(fileId, { html })
  Store > Firestore: os-site_content/filesystem
}

alt [Visitor Gallery — visitor-gallery/ · no store] {
  UI > Firestore: addDoc(os-gallery, { url, name, storagePath, status: 'pending' })
  Firestore --> UI: doc id
  UI > UI: shows in gallery for uploader immediately
}

Visitor > Firestore: boot → fetch os-site_content/* (public read)
Firestore --> Visitor: metadata with Storage URLs
Visitor > Storage: <img src> / <video src> / iframe (public read on managed folders)
opt [Visitor Gallery] {
  Visitor > Firestore: query os-gallery where status == 'approved'
}
```

**Regression checklist derived from the diagram** (run per deploy):

| Surface | Folder | Cap | Types | Metadata doc | Visible to visitor after refresh? |
|---|---|---|---|---|---|
| Archive upload (admin) | `file-explorer/` | 100 MB | image, video, audio, pdf, txt, csv | `filesystem` | yes |
| Archive → Visitor Gallery | `visitor-gallery/` | 5 MB | jpeg/png/webp/gif | `os-gallery` (pending) | after approval |
| Desktop drag-drop | `desktop-uploads/` | 100 MB | image, video, audio | `filesystem` | yes |
| Settings / Admin background | `backgrounds/` | 10 MB | image | `backgrounds` | yes |
| Milestone image | `milestones/` | 2 MB | image | `profile` | yes |
| App icon / media | `app-icons/` `app-media/` | 2 / 25 MB | image / image+video | `apps` | yes |
| Case-study image | `portfolio-files/` | 100 MB | any | `filesystem` | yes |

---

## 6. Window lifecycle — *Flow Chart*

`desktopStore.openWindow` → `WindowState` → `Window.tsx` interactions.

```eraser
direction down
colorMode pastel
typeface clean

Open [shape: oval, icon: mouse-pointer, label: "openWindow(app, fileData?)"]
IsLink [shape: diamond, label: "app.type === 'link'?"]
ExtTab [shape: oval, label: "window.open(url, _blank) · no window"]
MobileHide [shape: diamond, label: "mobile && mobileBehavior === 'hide'?"]
Noop [shape: oval, label: "ignored"]

Match [shape: diamond, label: "existing window?"]
MatchRules [label: "1. singleInstance → any window for appId   2. fileData → window with same fileId   3. else → empty window (no fileId) for appId"]
Restore [label: "isMinimized=false · zIndex=max+1 · singleInstance: swap fileId/file/title"]

Create [label: "new WindowState"]
Size [label: "size = defaultSize clamped to viewport · minSize fallback 300×200"]
Pos [label: "position = 100 + n·30 cascade"]
MaxRule [shape: diamond, label: "preferredWindowMode==='maximized' || (mobile && mobileBehavior maximize/fullscreen)?"]
Maximized [label: "isMaximized = true"]
Floating [label: "isMaximized = false"]

Live [icon: layout, color: green, label: "LIVE WINDOW · Window.tsx"] {
  Focus [label: "mousedown → bringToFront"]
  Drag [label: "titlebar drag → updateWindowPosition · snap zones left / right / top"]
  Resize [label: "corner drag → updateWindowSize · respects minSize"]
  DblClick [label: "titlebar double-click → maximizeWindow toggle"]
  Min [label: "− → minimizeWindow · stays in taskbar at 35% opacity"]
  Max [label: "□ → maximizeWindow toggle · taskbar cutout on fullscreen"]
  Close [label: "× → closeWindow · removed from windows[]"]
}

TaskbarClick [label: "taskbar icon click → minimized ? restore : minimize"]
ContextRestore [label: "taskbar context menu → Restore / Minimize / Close"]

Open > IsLink
IsLink > ExtTab: yes
IsLink > MobileHide: no
MobileHide > Noop: yes
MobileHide > Match: no
Match > MatchRules
MatchRules > Restore: found
Match > Create: none
Create > Size
Size > Pos
Pos > MaxRule
MaxRule > Maximized: yes
MaxRule > Floating: no
Maximized > Live
Floating > Live
Restore > Live
TaskbarClick > Min
TaskbarClick > Restore
ContextRestore > Restore
ContextRestore > Close
Music [icon: music, label: "Music is the only singleInstance app · audioEngine singleton keeps playing across file swaps"]
Music --> MatchRules
```

---

## 7. Store ↔ Firestore ↔ localStorage merge semantics — *Flow Chart*

Who wins when local backup and remote disagree. **This is not uniform** —
see the finding below.

```eraser
direction right
colorMode pastel
typeface clean

Profile [icon: user, color: blue, label: "userStore · profile"] {
  pLoad [label: "load: remote exists → remote wins WHOLESALE (local ignored)"]
  pMissing [label: "remote missing → local ⊕ defaults → publish"]
  pErr [label: "fetch error → local (if any)"]
  pSave [label: "save: local immediately · Firestore if canWrite"]
}

Files [icon: folder, color: orange, label: "fileStore · filesystem"] {
  fLoad [label: "load: merge(systemFolders, REMOTE, LOCAL) → LOCAL WINS per id"]
  fRepub [label: "re-publish if local has ids remote lacks"]
  fSave [label: "save: local immediately · Firestore debounced 1 s if canWrite"]
}

Backgrounds [icon: image, color: orange, label: "desktopStore · backgrounds"] {
  bLoad [label: "load: merge(defaults, REMOTE custom, LOCAL) → LOCAL WINS per id"]
  bRepub [label: "re-publish if local has ids remote lacks"]
  bSave [label: "save: local immediately · Firestore (custom ids only) if canWrite"]
}

Apps [icon: layout, color: green, label: "desktopStore · apps (uncommitted diff)"] {
  aLoad [label: "load: merge(defaults, LOCAL, REMOTE) → REMOTE WINS per id"]
  aRepub [label: "re-publish if merge added ids remote lacks"]
  aSave [label: "save: local (custom ids) immediately · Firestore if canWrite"]
}

Theme [icon: palette, label: "themeStore · theme"] {
  tLoad [label: "load: remote or Generative Studio default · no local mirror"]
  tSave [label: "save: Firestore debounced 500 ms · NO canWrite guard"]
}

Content [icon: calendar, label: "timelineStore / observatoryStore"] {
  cLoad [label: "load: remote or seed · filtered by visibility(canWrite) · no local mirror"]
  cSave [label: "save: debounced · canWrite guard"]
}

Risk [icon: alert-triangle, color: red, label: "RESURRECTION / STALE-OVERRIDE RISK · any store where a stale local backup wins or re-adds ids"]

fLoad > Risk: rename on device A, device B's stale local reverts it and re-publishes
bLoad > Risk
aRepub > Risk: delete on A, B's stale local re-adds + re-publishes
pLoad --> Risk: safe — remote wins
```

**Finding:** three different precedence rules exist — *remote wholesale*
(profile), *local wins per id* (filesystem, backgrounds), *remote wins per id*
(apps). The per-id merges also never delete, so removals don't propagate
across devices. Recommended single rule: **remote wins per id when the remote
doc exists; local is only for (a) remote-missing bootstrap and (b) fetch
errors; deletions carry a tombstone or the remote list is authoritative.**

---

## 8. Theme pipeline — *Flow Chart*

One hex in, every brand utility out. Status colours are deliberately *off*
the pipeline.

```eraser
direction right
colorMode pastel
typeface clean

Input [shape: oval, icon: palette, label: "Settings → Appearance · one hex · default #ef4444 (Generative Studio)"]
Presets [label: "themeStore presets · Generative Studio · Ocean Blue · Forest Green · Purple Haze · Sunset Orange · Monochrome · Cyberpunk · Star Citizen · Product Mono"]
Store [icon: typescript, label: "themeStore.colors.primary"]
Ramp [icon: git-branch, label: "brandRamp.generateBrandRamp(hex) · OKLCH · 11 stops 50…2100 + DEFAULT"]
OnColor [label: "brandRamp.idealOnColor(brand-600) · WCAG → #000 or #fff"]
Legacy [color: gray, label: "brandLegacyChannels() → --color-primary / -secondary / -tertiary / -accent (compat, all = brand)"]

Vars [icon: code, color: yellow, label: "CSS custom properties on :root"] {
  vBrand [label: "--brand-50 … --brand-2100 · --brand (verbatim hex)"]
  vOn [label: "--color-fg-on-primary"]
  vSem [label: "semantic: --color-fg-brand = brand-300 · --color-bg-brand-solid = brand-600 · hover = brand-800 · --stroke-focus = brand-400 · bg-brand-subtle = brand / 0.10"]
}

TW [icon: layout, color: blue, label: "tailwind.config.js"] {
  twRamp [label: "brand.{50…2100} → bg-brand-600 · text-brand-300 · border-brand · /alpha supported"]
  twSem [label: "fg-brand · bg-brand-solid · stroke-brand · stroke-focus · fg-on-primary"]
}

Consumers [icon: monitor, color: green, label: "Components"] {
  cBtn [label: "Button solid-brand-* · bg-brand-600 text-fg-on-primary"]
  cFocus [label: "os-focus-ring · focus:border-stroke-brand"]
  cActive [label: "selected rows · sidebar rails · tab underlines"]
  cBg [label: "Brand Flow / Brand Gradient / Brand Tint backgrounds · rgb(var(--brand-N))"]
  cGlow [label: "glow-* shadows · WindowEdgeGlow"]
}

Status [icon: alert-circle, color: red, label: "OFF-PIPELINE · fixed meaning, never retheme · fg-error #fb7185 · fg-warning #facc15 · fg-success #4ade80 · fg-info #60a5fa"]
Chrome [icon: monitor, color: gray, label: "OFF-PIPELINE · OS chrome neutrals · os-ink-950/900/800 · os-line-dark · background-chrome"]
Guard [icon: shield, label: "npm run lint:tokens · rejects raw hex + palette-for-semantic in src/components"]

Presets > Input
Input > Store
Store > Ramp
Store > Legacy
Ramp > vBrand
Ramp > OnColor
OnColor > vOn
vBrand > vSem
vBrand > twRamp
vSem > twSem
vOn > twSem
twRamp > cBg
twRamp > cGlow
twSem > cBtn
twSem > cFocus
twSem > cActive
ThemeDoc [icon: database, label: "Firestore os-site_content/theme · debounced 500 ms"]
Store --> ThemeDoc
Guard --> Consumers
```

---

## 9. Storage folder ↔ rule ↔ writer matrix — *Table*

The five-second view of what the Storage rules actually allow.

| Folder | Rule block | Read | Write | Cap | Content-type | Written by (code) |
|---|---|---|---|---|---|---|
| `visitor-gallery/` | explicit | public | **anyone** (create) · superuser (update/delete) | 5 MB | jpeg/png/webp/gif | `FileExplorer.tsx` visitor-gallery zone |
| `app-icons/` | explicit | public | superuser | 2 MB | image/* | `AdminPanel.tsx` app editor |
| `app-media/` | explicit | public | superuser | 25 MB | image/*, video/* | `AdminPanel.tsx` app editor |
| `backgrounds/` | explicit | public | superuser | 10 MB | image/* | `Settings.tsx`, `AdminPanel.tsx` |
| `milestones/` | explicit | public | superuser | 2 MB | image/* | `AdminPanel.tsx` milestone form |
| `desktop-uploads/` | explicit | public | superuser | 100 MB | image/*, video/* | `Desktop.tsx` drag-drop |
| `portfolio-files/` | explicit | public | superuser | 100 MB | any | `ProjectCaseStudyPanel.tsx` (Tiptap images) |
| `reads/` | explicit | public | superuser | 10 MB | image/* | reads import script |
| `resource-thumbnails/` | explicit | public | superuser | 5 MB | image/* | — |
| **`file-explorer/`** | **catch-all** | public | **anyone** | **none** | **any** | `FileExplorer.tsx` admin uploads |
| `/{anything-else}/**` | catch-all | public | anyone | none | any | — (other apps in the same Firebase project) |
| `/{rootFile}` | root | public | anyone | none | any | legacy |

Client-side `uploadUtils` caps (`maxSizeMB`, `allowedTypes`) apply to every
row, but they are advisory — the Storage rule is the only enforcement.

---

## Reading notes

- **Boot is parallel, not sequential.** The 950 ms floor is a UX minimum, not a
  dependency wait; a slow Firestore read never blocks theme or chunk warming.
- **The main chunk carries all 9 stores, the shell, and the full Phosphor
  catalog.** Only app bodies are code-split.
- **7 apps are pre-fetched during boot**; the other 11 hit the network on first
  open. `Timeline` is pinned to the desktop but *not* warmed.
- **Login is not a boot dependency.** Visitors get the full public desktop;
  sign-in triggers a second fetch round to promote visibility and unlock writes.
