# PortfolioOS - Interactive Web Desktop

> **Documentation** - Last Updated: 2026-05-01 (updated for v2.1 Firebase migration)

## 📋 Project Overview

**PortfolioOS** is an innovative, interactive web-based desktop environment built to showcase a developer's portfolio in a unique and engaging way. The application simulates a complete operating system experience directly in the browser, featuring a window management system, file explorer, taskbar, start menu, and multiple built-in applications.

### Key Characteristics
- **Type**: Single Page Application (SPA)
- **Purpose**: Interactive Portfolio Showcase
- **Architecture**: Component-based desktop environment
- **Developer**: Based in Johannesburg, South Africa
- **Version**: 1.0.0

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

#### Backend Integration
- **Firebase ^11.10.0** - Firestore (database), Authentication, Cloud Storage
  - `src/lib/firebase.ts` — exports `auth`, `db`, `storage`
  - Firestore collection: `os-site_content` (documents: `profile`, `apps`, `backgrounds`, `selectedBackground`, `filesystem`, `theme`)
  - Storage path: `portfolio-files/`

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
│   │   │   ├── About.tsx
│   │   │   ├── Browser.tsx
│   │   │   ├── Calculator.tsx
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── Notepad.tsx
│   │   │   ├── TaskManager.tsx
│   │   │   └── Weather.tsx
│   │   ├── AdminPanel.tsx     # Admin configuration UI
│   │   ├── Desktop.tsx        # Main desktop component
│   │   ├── DesktopIcons.tsx   # Desktop icon grid
│   │   ├── StartMenu.tsx      # Start menu interface
│   │   ├── Taskbar.tsx        # Bottom taskbar
│   │   ├── Window.tsx         # Window wrapper component
│   │   └── WindowManager.tsx  # Window rendering manager
│   ├── store/
│   │   ├── desktopStore.ts    # Desktop, window, background state
│   │   ├── authStore.ts       # Firebase Auth session
│   │   ├── themeStore.ts      # Theme presets + CSS variable injection
│   │   ├── userStore.ts       # User profile, CV, projects
│   │   ├── fileStore.ts       # Virtual file system
│   │   └── notificationStore.ts # Toast queue
│   ├── lib/
│   │   ├── firebase.ts        # Firebase app init (auth, db, storage)
│   │   ├── uploadUtils.ts     # Firebase Storage upload helpers
│   │   ├── utils.ts
│   │   ├── design-tokens.ts
│   │   └── imageUtils.ts
│   ├── theme/                 # Centralized design system
│   │   ├── theme.ts
│   │   ├── ThemeProvider.tsx
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   ├── types.ts               # TypeScript definitions
│   └── index.css              # Tailwind imports
├── public/                    # Static assets + PWA manifest
├── index.html                 # HTML template
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

## 🖥️ Built-in Applications

### 1. File Explorer
- **Icon**: Folder
- **Default Size**: 800x600px
- **Features**:
  - Navigation breadcrumb path
  - Grid view (4 columns)
  - Create folders and text files
  - Upload files via button or drag-drop
  - File properties sidebar
  - Document and image preview
  - Delete functionality
  - File metadata display

### 2. Portfolio Browser
- **Icon**: Globe
- **Default Size**: 900x700px
- **Type**: Component
- **Purpose**: Browse portfolio websites

### 3. Calculator
- **Icon**: Calculator
- **Default Size**: 320x480px
- **Features**:
  - Basic operations (+, −, ×, ÷)
  - Decimal support
  - Clear function
  - Operation history display
  - Dark theme UI

### 4. Notepad
- **Icon**: FileText
- **Default Size**: 600x400px
- **Type**: Simple text editor

### 5. Weather Widget
- **Icon**: Cloud
- **Default Size**: 400x500px
- **Features**:
  - Current weather for Johannesburg
  - Temperature, feels like, condition
  - Humidity and wind speed
  - 5-day forecast
  - Hardcoded data (no API integration)

### 6. Task Manager
- **Icon**: Activity
- **Default Size**: 700x500px
- **Purpose**: View running portfolio projects

### 7. About Me
- **Icon**: User
- **Default Size**: 600x500px
- **Content**:
  - Developer bio
  - Featured projects (NailHub Social, Delegation Coach, 3D ShapeShift)
  - Social links (GitHub, Base44, Udemy, NailHub)
  - Technology stack information

### 8. NailHub Social (iframe)
- **Icon**: Heart
- **URL**: https://www.nailhub.co.za
- **Default Size**: 900x700px
- **Description**: Social platform for nail artists

### 9. GitHub (iframe)
- **Icon**: Github
- **URL**: https://github.com
- **Default Size**: 900x700px
- **Not pinned by default**

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
- `removeFile()` - Delete file and children
- `updateFile()` - Modify file properties
- `navigateToFolder()` - Enter folder
- `navigateUp()` - Go to parent folder
- `getCurrentFolderFiles()` - Get files in current location
- `getFileById()` - Retrieve specific file
- `getPathString()` - Generate breadcrumb path
- `getAllFiles()` - Get complete file list

**Default Files**:
- Projects (folder)
- Portfolio Sites (folder)
- Certificates (folder)
- Resume.txt (document)
- About Me.txt (document)

**Persistence**: File tree saved to Firestore `os-site_content/filesystem`; media files stored in Firebase Storage

---

## 📊 Type Definitions

### App Interface
```typescript
interface App {
  id: string                     // Unique identifier
  name: string                   // Display name
  icon: string                   // Lucide icon name
  type: 'component' | 'iframe' | 'static'
  component?: string             // React component name
  url?: string                   // External URL (for iframe)
  pinnedToTaskbar?: boolean
  pinnedToDesktop?: boolean
  desktopPosition?: { x: number; y: number }
  defaultSize?: { width: number; height: number }
  description?: string
}
```

### WindowState Interface
```typescript
interface WindowState {
  id: string                     // Unique window instance ID
  appId: string                  // Reference to App
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

### Color Palette
- **Desktop Background**: Gradient (blue-900 → blue-800 → purple-900)
- **Window Chrome**: Gray-900/95 with backdrop blur
- **Window Header**: Gray-800/80
- **Taskbar**: Gray-900/95 with backdrop blur
- **Accent Color**: Blue-600 (active states)
- **Destructive**: Red-600 (delete, close)

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

### LocalStorage Keys
- `portfolioOS_apps` - Application configuration
- `portfolioOS_files` - Virtual file system

### Data Format
- **Apps**: JSON array of App objects
- **Files**: JSON array of FileItem objects

### Reset to Defaults
Clear localStorage keys to restore default configuration:
```javascript
localStorage.removeItem('portfolioOS_apps');
localStorage.removeItem('portfolioOS_files');
```

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
- **No Authentication**: Admin mode accessible via keyboard shortcut
- **Client-Side Storage**: All data in browser localStorage
- **No Server Communication**: Fully client-side application
- **IFrame Security**: External sites loaded in sandboxed iframes

### Recommendations for Production
- Implement authentication for admin panel
- Add server-side storage for persistence
- Sanitize user inputs in file names and content
- Implement CSP headers for iframe security
- Add rate limiting for file uploads

---

## 🐛 Known Limitations

1.  **Static Weather Data**: No API integration for real weather
2.  **No Multi-User Support**: Single-user experience
3.  **Browser Storage Limits**: LocalStorage quota (mitigated by Supabase Storage for media)
4.  **No Mobile Optimization**: Desktop-focused experience

---

## 🔄 Future Enhancement Opportunities

### Suggested Features
- [x] Cloud storage integration (Supabase implementation)
- [ ] User authentication and profiles
- [ ] Real-time weather API integration
- [ ] Mobile responsive design
- [ ] Multi-monitor support (virtual desktops)
- [ ] Keyboard navigation improvements
- [ ] Context menus (right-click)
- [ ] Window snapping (edge docking)
- [ ] Search functionality
- [ ] Themes and customization
- [ ] Notification system
- [ ] Terminal/command line app
- [ ] Code editor app
- [ ] Music player app
- [ ] Settings app for preferences

### Technical Improvements
- [ ] Lazy loading for app components
- [ ] Virtual scrolling for large file lists
- [ ] IndexedDB for larger file storage
- [ ] Service worker for offline support
- [ ] Progressive Web App (PWA) capabilities
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Unit and integration tests
- [ ] Performance monitoring
- [ ] Error boundaries
- [ ] Analytics integration

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

**Note**: This documentation is AI-generated based on comprehensive code analysis performed on 2025-12-30. It will be updated as new changes are added to the project.
