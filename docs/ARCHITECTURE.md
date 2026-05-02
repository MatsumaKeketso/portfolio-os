# PortfolioOS - Interactive Web Desktop

> **Documentation** - Last Updated: 2026-05-01 (v2.1.0 — Firebase migration, Keketso OS identity, surface primitives, context menu registry)

## 📋 Project Overview

**Keketso OS** (project name: PortfolioOS) is a browser-based operating system experience built as a portfolio by Keketso, developed by Generative Studio. The application simulates a complete OS in the browser: window management, file explorer, taskbar, start menu, app registry, admin publishing workflow, and multiple built-in and project apps.

### Key Characteristics
- **Type**: Single Page Application (SPA)
- **Product name**: Keketso OS
- **Repo name**: portfolio-os / PortfolioOS
- **Purpose**: Portfolio operating system — the OS itself is the portfolio
- **Architecture**: Component-based desktop environment
- **Developer**: Keketso Matsuma, Johannesburg, South Africa — built by Generative Studio
- **Version**: 2.1.0
- **Live**: genos.dev

---

## 🏗️ Technical Architecture

### Technology Stack

#### Core Framework
- **React 18.3.1** - UI library with hooks and modern patterns
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.2** - Fast build tool and dev server

#### Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 12.23.26** - Animation library for smooth transitions
- **Lucide React 0.344.0** - Icon library (29+ icon options)

#### State Management
- **Zustand 5.0.9** - Lightweight state management (6 stores)
  - `desktopStore` - Window, app, background management
  - `authStore` - Firebase Auth session
  - `themeStore` - Theme presets and CSS variable injection
  - `userStore` - User profile, resume, skills, projects
  - `fileStore` - Virtual file system
  - `notificationStore` - Toast notification queue

#### Backend
- **Firebase ^11.10.0** — Firestore (database), Authentication, Cloud Storage
  - `src/lib/firebase.ts` — exports `auth`, `db`, `storage`
  - Firestore collection: `os-site_content` (documents: `profile`, `apps`, `backgrounds`, `selectedBackground`, `filesystem`, `theme`)
  - Storage path: `portfolio-files/`
  - Env vars: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

#### Development Tools
- **ESLint 9.9.1** - Code linting
- **PostCSS 8.4.35** - CSS processing
- **Autoprefixer 10.4.18** - CSS vendor prefixing

### Build Configuration

```typescript
// vite.config.ts
- React plugin enabled
- Lucide-react excluded from optimization (for performance)
```

```typescript
// TypeScript Configuration
- Target: ES2020
- Strict mode enabled
- JSX: react-jsx
- Module resolution: bundler
```

---

## 📁 Project Structure

```
portfolio-os/
├── src/
│   ├── components/
│   │   ├── apps/              # Built-in applications
│   │   │   ├── About.tsx          # Legacy About Me (kept for compat)
│   │   │   ├── AboutOS.tsx        # About This OS — system concept screen
│   │   │   ├── Browser.tsx
│   │   │   ├── Calculator.tsx
│   │   │   ├── CV.tsx             # Tabbed CV (Profile/Experience/Skills/Projects/Contact/Files)
│   │   │   ├── Contact.tsx        # Legacy (kept for compat, not in default apps)
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── Notepad.tsx
│   │   │   ├── Portfolio.tsx      # Legacy (kept for compat)
│   │   │   ├── Resume.tsx         # Legacy (kept for compat)
│   │   │   ├── Settings.tsx
│   │   │   ├── Skills.tsx         # Legacy (kept for compat)
│   │   │   ├── TaskManager.tsx
│   │   │   └── Weather.tsx
│   │   ├── ui/                # Shared design-system primitives
│   │   │   ├── surface.tsx        # Surface, ChromeSurface, ContentSurface, FloatingSurface, InsetSurface, MediaSurface
│   │   │   ├── SystemRow.tsx      # SystemRow, SystemRowGroup, SystemRowDivider
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── input.tsx
│   │   ├── AdminPanel.tsx
│   │   ├── ContextMenu.tsx
│   │   ├── Desktop.tsx
│   │   ├── DesktopIcons.tsx
│   │   ├── StartMenu.tsx
│   │   ├── Taskbar.tsx
│   │   ├── Window.tsx
│   │   └── WindowManager.tsx
│   ├── store/
│   │   ├── desktopStore.ts    # Windows, apps, backgrounds, system prefs
│   │   ├── authStore.ts       # Firebase Auth session
│   │   ├── themeStore.ts      # Theme presets + CSS variable injection
│   │   ├── userStore.ts       # User profile, CV, projects
│   │   ├── fileStore.ts       # Virtual file system + Visitor Gallery
│   │   └── notificationStore.ts # Toast queue
│   ├── lib/
│   │   ├── firebase.ts            # Firebase app init (auth, db, storage)
│   │   ├── uploadUtils.ts         # Firebase Storage upload helpers
│   │   ├── contextMenuRegistry.ts # Context IDs, ContextMenuItemDef, resolveMenuItems, sortAndSeparate
│   │   ├── filePermissions.ts     # LocationContext, getPermissions, fileIsWritable
│   │   ├── fileUtils.ts
│   │   ├── utils.ts
│   │   ├── design-tokens.ts
│   │   └── imageUtils.ts
│   ├── theme/                 # Design token system
│   │   ├── theme.ts
│   │   ├── ThemeProvider.tsx
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── types.ts               # App, WindowState, FileItem, VISITOR_GALLERY_ID, etc.
│   └── index.css
├── public/
├── firebase.json
├── .firebaserc
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.app.json
```

---

## 🎯 Core Features

### 1. Window Management System
- **Draggable Windows** - Click and drag window title bars
- **Resizable Windows** - Drag from bottom-right corner (min: 300x200px)
- **Window Controls**:
  - Minimize - Hide window (remains in taskbar)
  - Maximize - Full screen mode
  - Close - Remove window from desktop
- **Z-Index Management** - Click to bring window to front
- **Cascading Positioning** - New windows offset by 30px
- **Smooth Animations** - Framer Motion transitions (0.15s duration)

### 2. Desktop Environment
- **Background**: Gradient overlay (blue-900 → blue-800 → purple-900) with semi-transparent image
- **Desktop Icons**: Grid layout for pinned applications
- **Drag & Drop File Upload**: Drop files anywhere on desktop to upload
- **Keyboard Shortcuts**:
  - `Ctrl + Shift + A` - Toggle admin mode
  - `Escape` - Close start menu
- **Click Outside Detection** - Auto-close start menu

### 3. Virtual File System
- **Hierarchical Structure**: Folder/file tree with parent-child relationships
- **File Types**: folder, file, document, image, video
- **Operations**:
  - Create folders
  - Create text files with content
  - Upload files (images, videos, documents)
  - Delete files/folders (cascading delete)
  - Navigate folder hierarchy
  - File preview (documents and images)
- **Metadata Tracking**: Size, creation date, modification date, MIME type
- **Firebase Storage Integration**:
  - Images and videos uploaded to `portfolio-files/` path
  - Download URLs stored in Firestore filesystem document
  - Automatic cleanup of storage upon file deletion
- **Firestore Persistence**: File tree synced to `os-site_content/filesystem`

### 4. Admin Panel
- **Access**: `Ctrl + Shift + A` or URL parameter `?admin=1`
- **Features**:
  - Add new applications (component, iframe, or static)
  - Edit existing applications
  - Delete applications
  - Configure app properties:
    - Name, icon, type, description
    - Pin to taskbar/desktop
    - Default window size
    - Component name or URL
  - Export configuration (JSON download)
  - Import configuration (JSON upload)
- **Icon Library**: 29 available icons from Lucide React

### 5. Taskbar
- **Position**: Fixed bottom, full width
- **Components**:
  - Start menu button (Grid3x3 icon)
  - Pinned app shortcuts
  - Running app indicators (blue dot)
  - System tray (WiFi, Volume icons)
  - Clock (time + date, updates every second)
- **Interactions**:
  - Click pinned app: Open or minimize
  - Visual feedback for open apps

### 6. Start Menu
- **Layout**: Grid of all available applications
- **Display**: App icon, name, and description
- **Interaction**: Click to launch application
- **Positioning**: Above taskbar, left-aligned

---

## 🖥️ Default System Apps

### 1. File Explorer (`surfaceMode: 'content'`)
- Side navigation: Desktop, Documents, Downloads, Projects, CV, Images, Visitor Gallery, System
- Grid/list view, sort, search, upload, drag/drop, rename, duplicate, cut/copy/paste, delete
- Permission-aware: Visitor Gallery restricts file creation to image uploads only
- Context menus use `contextMenuRegistry.ts` item model + `sortAndSeparate`

### 2. CV (`surfaceMode: 'content'`)
- Tabs: Profile, Experience, Skills, Projects, Contact, Files
- Pulls from `userStore`; respects contact privacy settings
- Light content surface; keeps project work as summaries

### 3. About This OS (`surfaceMode: 'content'`)
- Sections: System, Concept, Keketso, Generative Studio, Credits, Build
- System-level screen explaining the OS concept; does not duplicate CV
- Side-nav uses `SystemRow` pattern

### 4. Settings (`surfaceMode: 'content'`)
- Tabs: Profile, Appearance, System, Privacy, Data

### 5. Task Manager (`surfaceMode: 'utilityDark'`)
- Dark utility UI; shows running processes/project overview

### 6. Calculator (`surfaceMode: 'utilityDark'`)
- Basic operations, decimal support, dark theme UI

### 7. Browser (`surfaceMode: 'iframe'`)
- Project preview and external exploration iframe

### 8. Notepad
- Simple text editor

### Legacy Apps (kept for compatibility, not in default app list)
- `About.tsx`, `Resume.tsx`, `Portfolio.tsx`, `Skills.tsx`, `Contact.tsx`, `Weather.tsx`
- Still lazy-loadable via `WindowManager.tsx`; not shown as first-level defaults

---

## 🔧 State Management

### Desktop Store (`desktopStore.ts`)

**State Properties**:
```typescript
{
  apps: App[]                    // All available applications
  windows: WindowState[]         // Currently open windows
  isStartMenuOpen: boolean       // Start menu visibility
  isAdminMode: boolean          // Admin panel visibility
  maxZIndex: number             // Highest z-index (starts at 1000)
}
```

**Key Actions**:
- `addApp()` - Add new application
- `removeApp()` - Delete application and close its windows
- `updateApp()` - Modify application properties
- `openWindow()` - Create new window or restore minimized
- `closeWindow()` - Remove window
- `minimizeWindow()` - Toggle minimize state
- `maximizeWindow()` - Toggle maximize state
- `updateWindowPosition()` - Move window
- `updateWindowSize()` - Resize window
- `bringToFront()` - Increase z-index
- `toggleStartMenu()` - Show/hide start menu
- `toggleAdminMode()` - Show/hide admin panel
- `exportConfig()` - Serialize apps to JSON
- `importConfig()` - Load apps from JSON

**Persistence**: Apps saved to Firestore `os-site_content/apps`

### File Store (`fileStore.ts`)

**State Properties**:
```typescript
{
  files: FileItem[]              // All files and folders
  currentPath: string[]          // Navigation stack (folder IDs)
}
```

**Key Actions**:
- `addFile()` - Create new file/folder
- `removeFile()` - Delete file and children (protected folders blocked)
- `updateFile()` - Modify file properties
- `navigateToFolder()` - Enter folder
- `navigateUp()` - Go to parent folder
- `getCurrentFolderFiles()` - Get files in current location
- `getFileById()` - Retrieve specific file
- `getPathString()` - Generate breadcrumb path
- `getAllFiles()` - Get complete file list

**Protected Root Folders**: Desktop, Documents, Downloads, Projects, CV, Images, Visitor Gallery (`VISITOR_GALLERY_ID`), System

**Persistence**: File tree saved to Firestore `os-site_content/filesystem`; media files stored in Firebase Storage under `portfolio-files/`

---

## 📊 Type Definitions

### App Interface
```typescript
interface App {
  id: string
  name: string
  icon: string                   // Lucide icon name
  type: 'component' | 'iframe' | 'static'
  component?: string
  url?: string
  pinnedToTaskbar?: boolean
  pinnedToDesktop?: boolean
  desktopPosition?: { x: number; y: number }
  defaultSize?: { width: number; height: number }
  description?: string
  // Surface/window contract
  surfaceMode?: 'content' | 'utilityDark' | 'immersive' | 'iframe'
  preferredWindowMode?: 'floating' | 'maximized' | 'fixed'
  minSize?: { width: number; height: number }
  mobileBehavior?: 'maximize' | 'fullscreen' | 'hide'
  // Project/portfolio metadata
  projectStatus?: string
  tags?: string[]
  role?: string
  year?: number
  projectLinks?: { label: string; url: string }[]
}
```

### WindowState Interface
```typescript
interface WindowState {
  id: string
  appId: string
  title: string
  icon: string
  type: 'component' | 'iframe' | 'static'
  component?: string
  url?: string
  content?: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  surfaceMode?: 'content' | 'utilityDark' | 'immersive' | 'iframe'
}
```

### FileItem Interface
```typescript
interface FileItem {
  id: string
  name: string
  type: 'folder' | 'file' | 'image' | 'video' | 'document'
  parentId: string | null        // null = root level
  path: string                   // Full path string
  size?: number                  // Bytes
  content?: string               // Text content
  dataUrl?: string               // Base64 encoded data
  mimeType?: string
  createdAt: number              // Timestamp
  modifiedAt: number             // Timestamp
}
```

---

## 🎨 Design System

### Surface Primitives (`src/components/ui/surface.tsx`)
- `ChromeSurface` — dark taskbar, start menu, title bars, menus, admin nav
- `ContentSurface` — light app body for CV, Settings, File Explorer, AboutOS
- `FloatingSurface` — dropdowns, context menus, date pickers, notification panels
- `InsetSurface` — input wells, selected rows, nested controls
- `MediaSurface` — image previews with optional halftone dot hover treatment
- `SurfaceHeader`, `SurfaceContent`, `SurfaceFooter`, `SurfaceDivider`

### System Row (`src/components/ui/SystemRow.tsx`)
- `SystemRow` — 36–44px rows with icon, label, metadata, hover/selected state
- `SystemRowGroup` — grouped section with optional header
- `SystemRowDivider` — visual separator
- Used in Start Menu, AboutOS; planned for File Explorer sidebar, Settings, Admin

### Default Theme Preset — Product Mono
| Token | Value |
|-------|-------|
| `primary` (ink) | `#111111` |
| `secondary` | `#666666` |
| `tertiary` (canvas) | `#f5f5f3` |
| `accent` | `#10b981` (emerald) |
| `borderRadius` | `md` (8px) |
| `spacing` | `compact` |

Additional theme presets remain available: Default, Ocean Blue, Forest Green, Purple Haze, Sunset Orange, Monochrome, Cyberpunk, Star Citizen.

### Typography
- **Default**: System font stack
- **Window Titles**: 14px, medium weight
- **Taskbar Clock**: 12px
- **Icons**: 16-24px (Lucide React)

### Animations
- **Window Open/Close**: Opacity + scale (0.15s)
- **Hover Effects**: Scale 1.05 on desktop icons
- **Transitions**: All interactive elements have smooth transitions

### Spacing
- **Window Cascade**: 30px offset
- **Taskbar Height**: 48px (3rem)
- **Window Min Size**: 300x200px
- **Grid Gaps**: 12-16px

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version compatible with ES2020)
- Yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd portfolio-os

# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Run linter
yarn lint

# Type check
yarn typecheck
```

### Development Server
- Runs on default Vite port (usually http://localhost:5173)
- Hot Module Replacement (HMR) enabled
- Fast refresh for React components

### Admin Mode Access
```
# Via keyboard shortcut
Ctrl + Shift + A

# Via URL parameter
http://localhost:5173?admin=1
```

---

## 💾 Data Persistence

### Firebase (primary backend)
All backend state is persisted via Firebase. Firestore collection: `os-site_content`.

| Document | Store | Contents |
|----------|-------|----------|
| `profile` | `userStore` | Name, bio, experience, skills, projects, social links |
| `apps` | `desktopStore` | App registry |
| `backgrounds` | `desktopStore` | Background list |
| `selectedBackground` | `desktopStore` | Active background ID |
| `filesystem` | `fileStore` | Virtual file tree |
| `theme` | `themeStore` | Active theme settings |

Media files (images, videos) are stored in Firebase Storage under `portfolio-files/`.

### LocalStorage (secondary / preferences)
| Key | Purpose |
|-----|---------|
| `portfolioOS_systemPreferences` | Taskbar position/size, icon size, animations |

### Reset to Defaults
Clear Firestore documents or local state to restore defaults. The stores include fallback defaults for all Firestore documents.

---

## 🔌 Component Integration

### Adding New Apps

#### Via Admin Panel (Runtime)
1. Press `Ctrl + Shift + A`
2. Click "Add New App"
3. Fill in app details
4. Choose type: Component, IFrame, or Static
5. Configure pinning and size
6. Click "Create App"

#### Via Code (Development)
1. Create component in `src/components/apps/`
2. Add to `defaultApps` array in `desktopStore.ts`
3. Import component in `WindowManager.tsx`

### Window Manager Component Mapping
The `WindowManager` component dynamically loads app components based on the `component` property:
- FileExplorer → `<FileExplorer />`
- Browser → `<Browser />`
- Calculator → `<Calculator />`
- Notepad → `<Notepad />`
- Weather → `<Weather />`
- TaskManager → `<TaskManager />`
- About → `<About />`

---

## 🎯 Use Cases

### Portfolio Showcase
- Display projects in File Explorer
- Link to live demos via Browser or iframe apps
- Showcase skills through interactive applications

### Interactive Resume
- About Me app for bio and experience
- File system for organizing portfolio materials
- Custom apps demonstrating technical capabilities

### Client Presentations
- Professional desktop environment
- Organized project structure
- Easy navigation and exploration

---

## 🔒 Security Considerations

### Current Implementation
- **Authentication**: Firebase Auth (`signInWithEmailAndPassword`, `onAuthStateChanged`). Admin features require authenticated session.
- **Backend**: Firebase Firestore + Storage. Data is not purely client-side.
- **Visitor Gallery**: Client-side upload filtering enforces image-only (JPEG/PNG/WebP/GIF). SVG is blocked. Storage security rules should mirror client-side constraints (pending).
- **IFrame Security**: External sites loaded in sandboxed iframes.

### Still Needed for Production
- Server/storage security rules to enforce visitor image-only upload constraints
- Rate limiting for visitor uploads
- CSP headers for iframe security
- Re-encoding visitor images to strip metadata

---

## 🐛 Known Limitations

1. **Static Weather Data**: No API integration for real weather
2. **No Multi-User Support**: Single-user experience; visitor uploads are not authenticated
3. **No Mobile Optimization**: Desktop-focused experience; mobile window behavior is not yet intentionally handled
4. **Surface Adoption Incomplete**: `ChromeSurface`/`ContentSurface` primitives exist but are not yet fully adopted across Window, ContextMenu, FileExplorer, Settings, and dialogs
5. **Context Menu Registry**: Partially wired — File Explorer uses it; Desktop, Start Menu, Taskbar, Window, and Admin still use local assembly

---

## 🔄 Upcoming Work

See `docs/INCREMENTAL_REFINEMENT_PLAN.md` and `docs/IMPLEMENTATION_PROGRESS.md` for the active execution plan. High-level items:

### In Progress / Next
- Finish context menu registry adoption (Desktop, Start Menu, Taskbar, Window)
- Server/storage-side Visitor Gallery upload enforcement
- `minSize` / `mobileBehavior` window enforcement
- Adopt `FloatingSurface` in `ContextMenu.tsx`; `MediaSurface` in File Explorer image grid
- Real App Info panel + Admin deep-link from Start Menu

### Planned
- Feedback app (Section 6 of refinement plan)
- `DateRangePicker`, `NotificationPanel`, `SettingsShell` shared components
- Mobile responsive window behavior
- Trash location in File Explorer
- Server-side visitor upload moderation controls in Admin Panel

---

## 📝 Code Quality

### TypeScript Coverage
- **Strict Mode**: Enabled
- **Type Safety**: Full type definitions for all interfaces
- **No Unused Locals**: Enforced
- **No Unused Parameters**: Enforced

### Linting
- ESLint configured with React hooks plugin
- React refresh plugin for HMR

### Best Practices Observed
- ✅ Component composition
- ✅ Custom hooks usage
- ✅ Proper state management separation
- ✅ Type-safe props and state
- ✅ Consistent naming conventions
- ✅ Clean component structure

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with proper TypeScript types
4. Test in development mode
5. Run linter and type checker
6. Submit pull request

### Code Style
- Use TypeScript for all new files
- Follow existing component patterns
- Add proper type definitions
- Use Tailwind CSS for styling
- Implement smooth animations with Framer Motion

---

## 📄 License

*License information not specified in current codebase*

---

## 🙏 Acknowledgments

### Technologies
- React Team - UI framework
- Vercel - Vite build tool
- Tailwind Labs - CSS framework
- Framer - Motion animation library
- Lucide - Icon library
- Firebase - Backend platform (Auth, Firestore, Storage)

### Inspiration
- Windows OS desktop environment
- macOS window management
- Modern web desktop applications

---

## 📞 Contact & Links

### Developer
- **Location**: Johannesburg, South Africa
- **Specialization**: React, TypeScript, Modern Web Technologies

### External Links (from About app)
- [GitHub](https://github.com)
- [Base44](https://base44.co.za)
- [Udemy](https://www.udemy.com)
- [NailHub](https://www.nailhub.co.za)

---

## 📚 Additional Resources

### Related Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion API](https://www.framer.com/motion/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Note**: Last updated 2026-05-01 for v2.1.0 (Firebase migration, surface primitives, context menu registry, File Explorer OS locations).
