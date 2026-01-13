# PortfolioOS

> A fully-featured, interactive web-based desktop environment for showcasing your portfolio in a unique and engaging way.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.5.3-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Live Demo:** [https://genos.dev](https://genos.dev)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Applications](#-applications)
- [Customization](#-customization)
- [Development](#-development)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## 🌟 Overview

**PortfolioOS** is an innovative web application that simulates a complete desktop operating system experience directly in your browser. Built with React and TypeScript, it provides a professional and interactive way to showcase your portfolio, skills, and projects.

### Key Highlights

- 🖥️ **Full Desktop Environment** - Windows, taskbar, start menu, and desktop icons
- 📁 **Virtual File System** - Complete file management with Supabase storage integration
- 🎨 **8 Theme Presets** - Including Star Citizen inspired theme (default)
- 🔐 **Authentication System** - Secure admin access via Supabase Auth
- 📱 **12 Built-in Applications** - From file explorer to portfolio showcase
- ⚡ **Real-time Database** - All data persisted to Supabase with automatic sync
- 🎯 **Progressive Web App** - Installable with offline support
- ♿ **Accessibility** - Keyboard shortcuts and ARIA labels

---

## ✨ Features

### Desktop Experience

- **Window Management** - Drag, resize, minimize, maximize windows with smooth animations
- **Taskbar** - Customizable position (top/bottom/left/right), size, and auto-hide
- **Start Menu** - Application launcher with search functionality
- **Desktop Icons** - Drag-and-drop reordering, customizable sizes
- **Context Menus** - Right-click menus for quick actions
- **Background Gallery** - 15+ backgrounds including animated effects (Aurora, Beams, Grid)

### File System

- **Full File Management** - Create, rename, duplicate, delete files and folders
- **Multi-Select** - Ctrl+Click and Shift+Click support
- **Cut/Copy/Paste** - Standard clipboard operations
- **Drag & Drop** - Move files between folders
- **File Upload** - Images and videos uploaded to Supabase Storage
- **Grid/List Views** - Toggle between view modes
- **Sort & Search** - Sort by name, date, size, type with live search
- **File Preview** - Built-in preview for documents and images

### Theming & Customization

- **8 Theme Presets:**
  - Star Citizen (default) - Cyan and deep blue
  - Ocean Blue - Sky and cyan tones
  - Forest Green - Natural greens
  - Purple Haze - Purple and fuchsia
  - Sunset Orange - Warm oranges
  - Monochrome - Grayscale elegance
  - Cyberpunk - Neon cyan and pink
  - Default - Classic red and blue

- **Customization Options:**
  - Custom color picker (4 channels: primary, secondary, tertiary, accent)
  - Border radius control (sharp to fully rounded)
  - Spacing density (compact, normal, comfortable)
  - Icon style (default, rounded, sharp)
  - Taskbar positioning and sizing
  - Desktop icon sizing
  - Window animations toggle

### Admin Panel

Access via `Ctrl + Shift + A` (requires authentication)

- **App Management** - Add, edit, remove applications
- **Custom Icons** - Upload custom app icons or select from 500+ Lucide icons
- **Background Manager** - Upload and manage desktop backgrounds
- **Milestone Editor** - Create and manage timeline events
- **Bulk Import** - Import multiple apps from URLs
- **Config Export/Import** - Backup and restore configuration as JSON

### User Profile

Complete profile management system:

- **Personal Info** - Name, title, bio, photo, location, contact
- **Social Links** - GitHub, LinkedIn, Twitter, website, and custom links
- **Resume/CV** - Experience, education, certifications with dates
- **Skills** - Categorized skills with proficiency levels (Beginner → Expert)
- **Projects** - Portfolio showcase with images, descriptions, links, and status
- **Milestones** - Timeline of achievements and career events
- **Privacy Controls** - Toggle visibility of email and phone

### Keyboard Shortcuts

Press `?` to view all shortcuts. Key combinations:

- `Ctrl + Shift + A` - Admin panel (requires authentication)
- `Esc` - Close menus and dialogs
- `Alt + F4` - Close active window
- `Win + D` - Minimize all windows
- `Ctrl + O` - Open File Explorer
- `Double-click` - Open desktop icons
- `Right-click` - Context menu

---

## 🛠️ Technology Stack

### Core

- **React 18.3.1** - UI library with hooks
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.2** - Lightning-fast build tool

### UI & Styling

- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 12.23.26** - Advanced animations
- **Lucide React 0.344.0** - 500+ icon library
- **Class Variance Authority** - Component variants
- **clsx + tailwind-merge** - Conditional styling

### State & Data

- **Zustand 5.0.9** - Lightweight state management (6 stores)
- **Supabase 2.57.4** - PostgreSQL database, authentication, file storage
- Real-time data synchronization with debounced saves

### Development

- **ESLint** - Code linting with React plugins
- **PostCSS + Autoprefixer** - CSS processing
- **TypeScript ESLint** - Type-aware linting

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for ES2020 support)
- **npm** or **yarn** package manager
- **Supabase Account** (for backend features)

### Installation

```bash
# Clone the repository
git clone https://github.com/MatsumaKeketso/portfolio-os.git
cd portfolio-os

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the SQL setup scripts in your Supabase SQL Editor:

1. **Database Schema** - Run `supabase-setup.sql`
2. **Storage Buckets** - Run `storage-setup.sql`

These scripts create:
- `site_content` table for storing app/profile data
- `portfolio-files` storage bucket for uploaded files
- Row Level Security (RLS) policies

### Development Server

```bash
# Start development server
npm run dev
# or
yarn dev

# Server runs at http://localhost:5173
```

### Build for Production

```bash
# Type check
npm run typecheck

# Build
npm run build

# Preview build
npm run preview
```

### Authentication

Default credentials for admin access:
- **Email:** `admin@genos.dev`
- **Password:** Set during Supabase Auth setup

After login, press `Ctrl + Shift + A` to access admin panel.

---

## 🏗️ Architecture

### Project Structure

```
portfolio-os/
├── src/
│   ├── components/          # React components
│   │   ├── apps/           # Application components (12)
│   │   ├── ui/             # Reusable UI library (4)
│   │   ├── aceternity/     # Premium backgrounds (3)
│   │   ├── Desktop.tsx     # Main desktop
│   │   ├── WindowManager.tsx
│   │   ├── Taskbar.tsx
│   │   ├── StartMenu.tsx
│   │   ├── AdminPanel.tsx
│   │   └── 20+ other components
│   ├── store/              # Zustand stores (6)
│   │   ├── desktopStore.ts
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   ├── fileStore.ts
│   │   ├── userStore.ts
│   │   └── notificationStore.ts
│   ├── theme/              # Design system
│   │   ├── theme.ts
│   │   ├── ThemeProvider.tsx
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── lib/                # Utilities
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   ├── design-tokens.ts
│   │   └── imageUtils.ts
│   ├── types.ts            # TypeScript definitions
│   ├── App.tsx
│   └── main.tsx
├── public/                 # Static assets + PWA
├── docs/                   # Additional documentation
├── supabase-setup.sql      # Database schema
├── storage-setup.sql       # Storage setup
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### State Management (Zustand Stores)

#### 1. **desktopStore** - Desktop & Window Management
- Apps configuration (12 default apps)
- Window states (position, size, z-index)
- Backgrounds (15 presets + custom uploads)
- System preferences (taskbar, icons, animations)
- Actions: window management, app CRUD, background switching

#### 2. **authStore** - Authentication
- Supabase Auth integration
- Session management with real-time listener
- Login/logout actions
- User state

#### 3. **themeStore** - Visual Theming
- 8 theme presets
- Custom color picker (4 channels)
- Border radius, spacing, icon style controls
- CSS variable injection for runtime theming
- Supabase persistence

#### 4. **fileStore** - Virtual File System
- File tree with parent-child relationships
- Clipboard (cut/copy/paste)
- Multi-select with range selection
- Navigation stack
- File operations (CRUD, move, rename, duplicate)
- Supabase Storage integration for media

#### 5. **userStore** - User Profile
- Personal information
- Social links (standard + custom)
- Resume (experience, education, certifications)
- Skills with proficiency levels
- Projects with images and links
- Milestones timeline
- Preferences and metadata
- Supabase persistence with debouncing

#### 6. **notificationStore** - Toast Notifications
- Queue management
- Auto-dismiss (default 5s)
- 4 types: success, error, info, warning

### Data Persistence

**Supabase Integration:**
- **Database:** `site_content` table stores all configuration
- **Storage:** `portfolio-files` bucket for uploaded files
- **Auth:** Email/password authentication
- **Real-time:** Automatic sync with debounced saves (1000ms)

**Data Flow:**
```
User Action → Store Update → Debounced Save → Supabase → Real-time Sync
```

---

## 📱 Applications

PortfolioOS includes 12 built-in applications:

### 1. **File Explorer** 📁
- Complete file management system
- Grid/list view modes
- Multi-select operations
- Drag-and-drop support
- Search and sort functionality
- File preview for documents and images
- Supabase Storage integration for media

### 2. **Portfolio Browser** 🌐
- Tabbed browsing interface
- Bookmark management
- Browsing history
- URL navigation
- Custom homepage

### 3. **Calculator** 🔢
- Basic arithmetic operations
- Decimal support
- Operation history
- Dark theme interface

### 4. **Notepad** 📝
- Simple text editor
- File save/load functionality
- Keyboard shortcuts
- Auto-save support

### 5. **Weather** ⛅
- Real-time weather widget
- Location-based forecast
- Temperature, humidity, wind speed
- 5-day forecast

### 6. **Task Manager** 📊
- System information display
- Running processes
- Portfolio project status
- Resource usage

### 7. **About** 👤
- Personal bio and information
- Featured projects showcase
- Social media links
- Technology stack display

### 8. **Settings** ⚙️
5 tabs for complete customization:
- **Profile** - Quick edit personal info
- **Appearance** - Theme and display settings
- **System** - Taskbar, icons, performance
- **Privacy** - Contact visibility controls
- **Data** - Export/import profile, reset

### 9. **Resume** 📄
- Professional CV display
- Experience timeline
- Education history
- Certifications showcase
- Download option

### 10. **Portfolio** 🎨
- Project showcase with filtering
- Search functionality
- Technology tags
- Status indicators (In Progress, Completed, Archived)
- Featured projects highlight
- Project images and links

### 11. **Skills** 💻
- Categorized skill display
- Proficiency levels with visual bars
- Years of experience
- Technology icons
- Skill search and filter

### 12. **Contact** 📧
- Contact information display
- Social media links
- Email and phone (respects privacy settings)
- Location information
- Direct contact actions

### Adding Custom Apps

Via Admin Panel (`Ctrl + Shift + A`):
1. Click "Add New App"
2. Choose type: Component, IFrame, or Static
3. Configure name, icon, description
4. Set default size and pinning
5. For IFrame: provide URL
6. For Component: specify component name

---

## 🎨 Customization

### Theme System

Access via Settings app or Start Menu → Customization

**8 Built-in Presets:**

| Theme | Primary | Secondary | Best For |
|-------|---------|-----------|----------|
| **Star Citizen** | Cyan (#00d9ff) | Deep Blue | Sci-fi, gaming portfolios |
| **Ocean Blue** | Sky | Cyan | Professional, calming |
| **Forest Green** | Green | Emerald | Eco, natural themes |
| **Purple Haze** | Purple | Fuchsia | Creative, artistic |
| **Sunset Orange** | Orange | Amber | Warm, energetic |
| **Monochrome** | Slate | Gray | Minimalist, elegant |
| **Cyberpunk** | Cyan | Pink | Futuristic, bold |
| **Default** | Red | Blue | Classic, balanced |

**Custom Colors:**
- 4 color channels: Primary, Secondary, Tertiary, Accent
- Live preview of changes
- Reset to default option

**Layout Options:**
- **Border Radius:** None, Small, Medium, Large, Extra Large
- **Spacing:** Compact (0.75x), Normal (1x), Comfortable (1.25x)
- **Icon Style:** Default, Rounded, Sharp

### Desktop Backgrounds

15 preset backgrounds:
- **Gradients:** Windows Blue, Dark Space, Sunset, Forest
- **Animated Effects:** Aurora Dreams, Energy Beams, Cyber Grid
- **Star Citizen Themed:** Quantum Drive, Deep Space, Microtech Sky, Crusader, and more

Upload custom backgrounds:
- Supported formats: JPG, PNG, WebP
- Max file size: 5MB
- Multiple file upload supported

### Taskbar Customization

- **Position:** Top, Bottom (default), Left, Right
- **Size:** Small, Medium (default), Large
- **Auto-hide:** Coming soon

### Desktop Icons

- **Size:** Small (64px), Medium (80px, default), Large (96px)
- **Arrangement:** Manual drag or auto-grid
- **Pinning:** Pin/unpin apps to desktop

---

## 💻 Development

### Component Development

Create new apps in `src/components/apps/`:

```tsx
// src/components/apps/MyApp.tsx
import React from 'react';

export const MyApp: React.FC = () => {
  return (
    <div className="p-4">
      <h1>My Custom App</h1>
      {/* App content */}
    </div>
  );
};
```

Register in `WindowManager.tsx`:

```tsx
import { MyApp } from './apps/MyApp';

const componentMap = {
  // ... existing apps
  MyApp: MyApp,
};
```

Add to default apps in `desktopStore.ts`.

### Using the Theme System

Access theme in components:

```tsx
import { useTheme } from '../theme';

function MyComponent() {
  const { theme } = useTheme();

  return (
    <div style={{
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    }}>
      Content
    </div>
  );
}
```

Or use CSS variables:

```css
.my-element {
  background: rgb(var(--color-primary));
  border-radius: var(--border-radius);
}
```

### Using Stores

Access Zustand stores:

```tsx
import { useDesktopStore } from '../store/desktopStore';
import { useUserStore } from '../store/userStore';

function MyComponent() {
  const { apps, openWindow } = useDesktopStore();
  const { profile, updatePersonal } = useUserStore();

  // Use store data and actions
}
```

### Adding Notifications

```tsx
import { useNotificationStore } from '../store/notificationStore';

function MyComponent() {
  const { addNotification } = useNotificationStore();

  const handleAction = () => {
    addNotification({
      type: 'success',
      title: 'Action Complete',
      message: 'Your changes have been saved',
      duration: 3000
    });
  };
}
```

### Code Style

- Use TypeScript for all new files
- Follow existing component patterns
- Add proper type definitions
- Use Tailwind CSS for styling
- Implement smooth animations with Framer Motion
- Follow accessibility best practices (ARIA labels, keyboard nav)

### Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

---

## 📚 Documentation

- **[THEME_SYSTEM.md](./THEME_SYSTEM.md)** - Complete theme system guide
- **[ADMINPANEL_AUDIT.md](./ADMINPANEL_AUDIT.md)** - Admin panel functionality audit
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Detailed architecture (READMEAI.md)
- **[docs/CHANGELOG.md](./docs/CHANGELOG.md)** - Version history (READMEAI_2.md)

### Key Concepts

**Window Management:**
- Windows are managed by `desktopStore` with unique IDs
- Z-index starts at 1000, increments on focus
- Position and size stored in `WindowState`
- Cascade positioning for new windows (+30px offset)

**File System:**
- Virtual file tree stored in `fileStore`
- Parent-child relationships via `parentId`
- Media files uploaded to Supabase Storage
- File paths constructed from parent chain

**Theming:**
- CSS variables injected at runtime
- Theme changes don't require component re-renders
- Presets defined in `themeStore`
- Custom themes persisted to Supabase

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes with proper TypeScript types
4. Test thoroughly in development mode
5. Run linter: `npm run lint`
6. Run type checker: `npm run typecheck`
7. Commit with clear messages
8. Push and create a Pull Request

### Code Standards

- **TypeScript:** Use strict types, avoid `any`
- **Components:** Functional components with hooks
- **Styling:** Tailwind CSS utilities, avoid inline styles
- **State:** Use appropriate Zustand store
- **Accessibility:** Include ARIA labels and keyboard support
- **Performance:** Lazy load heavy components, optimize re-renders

### Reporting Issues

Please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS version
- Screenshots if applicable

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Technologies
- [React](https://react.dev) - UI library
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Supabase](https://supabase.com) - Backend platform
- [Lucide](https://lucide.dev) - Icon library

### Design Inspiration
- Windows 11 - Desktop environment paradigm
- macOS - Window management patterns
- Star Citizen - Sci-fi aesthetic and HUD design
- Material Design - Component design principles

---

## 📞 Contact & Support

**Developer:** Keketso Matsuma
**Location:** Johannesburg, South Africa
**Email:** keketso@genos.dev

### Links
- **Website:** [https://genos.dev](https://genos.dev)
- **GitHub:** [@MatsumaKeketso](https://github.com/MatsumaKeketso)
- **Issues:** [GitHub Issues](https://github.com/MatsumaKeketso/portfolio-os/issues)

---

## 🔮 Roadmap

### v2.1 (In Development)
- [ ] Mobile responsive design
- [ ] Enhanced accessibility (screen reader support)
- [ ] Performance mode toggle
- [ ] Context menu improvements
- [ ] Welcome screen for first-time users

### v3.0 (Planned)
- [ ] Multi-language support
- [ ] Real-time collaboration features
- [ ] Plugin system for custom apps
- [ ] Cloud sync across devices
- [ ] Analytics dashboard
- [ ] SEO optimization
- [ ] Social sharing features

---

## 📊 Project Stats

- **Components:** 37 React components
- **Applications:** 12 built-in apps
- **Themes:** 8 presets + custom
- **Backgrounds:** 15+ options
- **Keyboard Shortcuts:** 15+ combinations
- **Icons:** 500+ from Lucide React
- **Lines of Code:** 10,000+ (TypeScript)

---

**Built with ❤️ by Keketso Matsuma**

*PortfolioOS - Your portfolio, reimagined as an operating system.*
