# File Explorer Documentation

> Comprehensive guide to the PortfolioOS File Explorer - a full-featured file management system with cloud storage integration.

---

## Table of Contents

- [Overview](#overview)
- [User Guide](#user-guide)
  - [Getting Started](#getting-started)
  - [Basic Operations](#basic-operations)
  - [Advanced Features](#advanced-features)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
- [Technical Architecture](#technical-architecture)
  - [Component Structure](#component-structure)
  - [State Management](#state-management)
  - [Data Flow](#data-flow)
  - [Storage Integration](#storage-integration)
- [Developer Guide](#developer-guide)
  - [File System API](#file-system-api)
  - [Adding Custom File Types](#adding-custom-file-types)
  - [Extending Functionality](#extending-functionality)
- [Troubleshooting](#troubleshooting)

---

## Overview

The **File Explorer** is a sophisticated file management application built into PortfolioOS that provides a familiar desktop-like experience for organizing and managing files and folders. It features full Supabase Storage integration, drag-and-drop support, multi-select operations, and real-time synchronization.

### Key Features

- **Full File System Operations** - Create, rename, delete, move, copy files and folders
- **Cloud Storage** - Automatic upload to Supabase Storage with fallback to Base64
- **Multi-Select** - Ctrl+Click and Shift+Click for batch operations
- **Drag & Drop** - Internal rearrangement and external file uploads
- **Dual View Modes** - Grid view with customizable icon sizes and detailed list view
- **Advanced Sorting** - Sort by name, date, size, or type in ascending/descending order
- **Real-time Search** - Instant filtering by file name
- **File Preview** - Integration with FileViewer and Notepad apps
- **Clipboard Operations** - Cut, copy, and paste with visual feedback
- **Upload Progress** - Real-time progress tracking for file uploads
- **Persistent State** - All data automatically saved to Supabase database

### Supported File Types

| Category | Extensions | Features |
|----------|-----------|----------|
| **Text** | .txt, .md, .rtf | Edit in Notepad, plain text preview |
| **Code** | .js, .ts, .py, .java, .cpp, .html, .css, .json, .xml, .yaml, etc. | Syntax highlighting in FileViewer |
| **Images** | .jpg, .png, .gif, .svg, .webp, .bmp, .ico | Preview in FileViewer, upload to cloud |
| **Videos** | .mp4, .webm, .mov, .avi, .mkv | Preview in FileViewer, upload to cloud |
| **Audio** | .mp3, .wav, .ogg, .m4a, .flac | Audio player in FileViewer |
| **Documents** | .pdf | PDF viewer in FileViewer |
| **Archives** | .zip, .rar, .7z, .tar, .gz | Icon only, no preview |
| **Spreadsheets** | .xls, .xlsx, .csv | Icon only, no preview |

---

## User Guide

### Getting Started

#### Opening File Explorer

1. **From Desktop:** Double-click the File Explorer icon
2. **From Start Menu:** Click Start → File Explorer
3. **Keyboard Shortcut:** Press `Ctrl + O`

#### Understanding the Interface

```
┌─────────────────────────────────────────────────────────┐
│ ◀ ▶  OS / Documents / Projects          [+📁] [+📄] [⬆]│  Navigation Bar
├─────────────────────────────────────────────────────────┤
│ [⊞⊞] [⋮]  Name ↓  |  Size  |  Modified   [🔍 Search]   │  Toolbar
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📁 My Folder     📄 Document.txt    🖼️ Image.png      │
│  📁 Projects      📄 Notes.md        🎬 Video.mp4      │  Content Area
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Navigation Bar:**
- **Back/Forward Buttons** - Navigate through folder history
- **Breadcrumb Path** - Shows current location, click to jump to any parent folder
- **New Folder** [+📁] - Create a new folder
- **New File** [+📄] - Create a new text file
- **Upload** [⬆] - Upload files from your computer

**Toolbar:**
- **View Mode Toggle** - Switch between grid and list views
- **Sort Options** - Sort by name, date, size, or type
- **Search Bar** - Filter files by name in current folder

---

### Basic Operations

#### Creating Files and Folders

**Create New Folder:**
1. Click the **[+📁] New Folder** button
2. Enter folder name in the dialog
3. Press **Enter** or click **Create**

**Create New File:**
1. Click the **[+📄] New File** button
2. Enter file name (automatically adds .txt if no extension)
3. Optionally add initial content
4. Press **Enter** or click **Create**

**Keyboard Tip:** Press `Enter` to confirm, `Escape` to cancel

---

#### Uploading Files

**Method 1: Upload Button**
1. Click the **[⬆] Upload** button in the navigation bar
2. Select one or more files from your computer
3. Watch the upload progress in the bottom-right corner
4. Files appear in the current folder when complete

**Method 2: Drag & Drop**
1. Drag files from your desktop/file browser
2. Drop them anywhere in the File Explorer window
3. Files upload automatically to the current folder

**Upload Limits:**
- Maximum file size: **100MB**
- Supported types: Images, videos, PDFs, text files
- Multiple files can be uploaded simultaneously
- Progress tracked individually for each file

**Upload Flow:**
```
Select File(s)
    ↓
Validation (size, type)
    ↓
Upload to Supabase Storage
    ↓
Generate public URL
    ↓
Save metadata to database
    ↓
Display in File Explorer
```

---

#### Selecting Files

**Single Selection:**
- Click once on any file or folder

**Multi-Selection:**
- **Ctrl+Click** (Windows) or **Cmd+Click** (Mac) - Toggle selection
- **Shift+Click** - Select range from last selected to clicked file
- **Ctrl+A** - Select all files in current folder
- **Click empty space** - Deselect all

**Visual Feedback:**
- Selected files have a **blue background** with border
- Cut files appear with **50% opacity**
- Selection count shown when multiple files selected

---

#### Moving and Organizing

**Move Files (Drag & Drop):**
1. Click and hold on a file or folder
2. Drag it over the destination folder
3. Folder highlights with a **blue ring** when ready
4. Release to move

**Move Files (Cut & Paste):**
1. Select file(s)
2. Press **Ctrl+X** or right-click → **Cut**
3. Navigate to destination folder
4. Press **Ctrl+V** or right-click → **Paste**

**Copy Files:**
1. Select file(s)
2. Press **Ctrl+C** or right-click → **Copy**
3. Navigate to destination folder
4. Press **Ctrl+V** or right-click → **Paste**

**Safety Features:**
- Cannot move folder into itself or its children
- Cannot move to the same location (no-op)
- Pasting creates copies if destination same as source
- Visual feedback (opacity change) for cut files

---

#### Renaming

**Method 1: F2 Key**
1. Select a file or folder
2. Press **F2**
3. Edit the name inline
4. Press **Enter** to confirm or **Escape** to cancel

**Method 2: Context Menu**
1. Right-click on a file or folder
2. Select **Rename**
3. Edit the name inline
4. Press **Enter** to confirm

**Rename Rules:**
- File names must be unique within the same folder
- Existing extensions are preserved (e.g., renaming `image.png` to `photo` becomes `photo.png`)
- Conflict detection prevents duplicate names

---

#### Deleting

**Delete Files:**
1. Select file(s) or folder(s)
2. Press **Delete** key or right-click → **Delete**
3. Files are **permanently deleted** (no trash/recycle bin currently)

**Warning:** Deletion is immediate and cannot be undone. Deleting a folder removes all its contents recursively.

**What Gets Deleted:**
- File metadata from database
- File content from Supabase Storage (for uploaded files)
- All children if deleting a folder

---

#### Duplicating

**Create a Copy:**
1. Select file(s) or folder(s)
2. Right-click → **Duplicate** or press **Ctrl+D**
3. Copy appears in same folder with " - Copy" suffix

**Duplicate Naming:**
- First copy: `Document.txt` → `Document - Copy.txt`
- Subsequent copies: `Document - Copy 2.txt`, `Document - Copy 3.txt`, etc.
- Works recursively for folders (all contents duplicated)

---

### Advanced Features

#### View Modes

**Grid View** (Default)
- **Icon Display:** Large file type icons or thumbnails
- **Layout:** Responsive grid (3-6 columns based on icon size)
- **Icon Sizes:**
  - Small: 64px (6 columns)
  - Medium: 80px (4 columns, default)
  - Large: 96px (3 columns)
- **Best For:** Visual browsing, images, folders

**List View**
- **Columns:** Icon | Name | Size | Type | Date Modified
- **Sorting:** Click column headers to sort
- **Layout:** Compact rows with full details
- **Best For:** Finding files, comparing metadata, large directories

**Switching Views:**
- Click the grid/list toggle button in toolbar
- View preference applies to all folders (not per-folder)

---

#### Sorting

**Sort Options:**
- **Name** (alphabetical)
- **Date Modified** (newest or oldest first)
- **Size** (smallest or largest first)
- **Type** (grouped by file extension)

**Sort Order:**
- Click sort dropdown to select criteria
- Click again on same criteria to reverse order
- Visual indicator: **↑** ascending, **↓** descending

**Sorting Behavior:**
- **Folders always appear first** regardless of sort criteria
- Within folders and files, sort applies independently
- Sort is case-insensitive for names

---

#### Search

**Using Search:**
1. Type in the search box in the toolbar
2. Files filter in real-time as you type
3. Click **X** to clear search

**Search Behavior:**
- **Scope:** Current folder only (not recursive)
- **Matching:** Case-insensitive substring match on file name
- **Performance:** Instant results via client-side filtering
- **Preserves:** Current sort order and view mode

**Search Limitations:**
- Does not search file contents
- Does not search in subfolders
- No fuzzy matching or advanced queries

---

#### Context Menu

**Accessing Context Menu:**
- Right-click on any file or folder
- Right-click on empty space for folder actions

**Available Actions:**

**File Context Menu:**
- **Open** - Opens file in appropriate app (Notepad/FileViewer)
- **Rename** - Enter inline rename mode
- **Duplicate** - Create a copy in same folder
- **Cut** - Move to clipboard for pasting
- **Copy** - Copy to clipboard for pasting
- **Delete** - Permanently remove file

**Folder Context Menu:**
- **Open** - Navigate into folder
- **Rename** - Rename folder
- **Duplicate** - Create recursive copy
- **Cut** - Move to clipboard
- **Copy** - Copy to clipboard
- **Delete** - Delete folder and all contents

**Empty Space Context Menu:**
- **Paste** - Paste from clipboard (if clipboard not empty)
- **New Folder** - Create new folder
- **New File** - Create new text file
- **Select All** - Select all items in current folder

---

#### File Preview & Opening

**Opening Files:**
Double-click on a file to open it in the appropriate application:

| File Type | Opens In | Capabilities |
|-----------|----------|--------------|
| Text (.txt, .md) | **Notepad** | Full editing, auto-save |
| Code files | **FileViewer** | Syntax highlighting, read-only |
| Images | **FileViewer** | Image viewer |
| Videos | **FileViewer** | Video player with controls |
| Audio | **FileViewer** | Audio player |
| PDFs | **FileViewer** | PDF renderer |
| HTML | **FileViewer** | HTML renderer (sandboxed) |

**Opening Folders:**
- Double-click to navigate into folder
- Updates breadcrumb navigation
- Updates file list to show folder contents

---

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl + O** | Open File Explorer |
| **Ctrl + A** | Select all files in current folder |
| **Ctrl + C** | Copy selected files |
| **Ctrl + X** | Cut selected files |
| **Ctrl + V** | Paste from clipboard |
| **F2** | Rename selected file |
| **Delete** | Delete selected files |
| **Escape** | Clear selection / Close dialogs / Close context menu |
| **Enter** | Open selected file/folder |
| **Backspace** | Navigate to parent folder |

**Multi-Selection:**
- **Ctrl + Click** - Add/remove from selection
- **Shift + Click** - Select range

---

## Technical Architecture

### Component Structure

The File Explorer is built as a monolithic React component with integration points to several sub-components and utilities.

#### Main Component

**File:** `src/components/apps/FileExplorer.tsx` (1002 lines)

**Component Hierarchy:**
```tsx
<FileExplorer>
  ├─ Navigation Bar
  │  ├─ Back/Forward Buttons
  │  ├─ Breadcrumb Path
  │  ├─ New Folder Button → Dialog
  │  ├─ New File Button → Dialog
  │  └─ Upload Button → File Input
  │
  ├─ Toolbar
  │  ├─ View Mode Toggle (Grid/List)
  │  ├─ Sort Dropdown
  │  ├─ Icon Size Slider (Grid only)
  │  └─ Search Input
  │
  ├─ Content Area
  │  ├─ Grid View (Framer Motion layout)
  │  │  └─ FileItem[] (draggable)
  │  └─ List View (Table)
  │     └─ FileRow[] (draggable)
  │
  ├─ New File/Folder Dialog (Modal)
  │  ├─ Name Input
  │  ├─ Content Input (files only)
  │  └─ Create/Cancel Buttons
  │
  ├─ Context Menu (Conditional)
  │  └─ Action Menu Items
  │
  └─ Upload Progress Toast (Conditional)
     └─ UploadProgressToast component
</FileExplorer>
```

---

#### Related Components

**1. ContextMenu** (`src/components/ContextMenu.tsx`)
```tsx
interface ContextMenuProps {
  x: number;
  y: number;
  items: Array<{
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'danger';
    disabled?: boolean;
  }>;
  onClose: () => void;
}
```

**Features:**
- Auto-positions to stay within viewport
- Keyboard navigation (arrow keys, Enter, Escape)
- Click-outside to close
- Danger variant for destructive actions (red text)

---

**2. UploadProgressToast** (`src/components/UploadProgress.tsx`)
```tsx
interface UploadProgress {
  fileName: string;
  progress: number;      // 0-100
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

interface UploadProgressToastProps {
  uploads: UploadProgress[];
  onClose: () => void;
}
```

**Features:**
- Shows multiple uploads simultaneously
- Progress bar for each file
- Status icons (loading spinner, checkmark, X)
- Auto-dismiss on completion
- Manual close button

---

**3. FileViewer** (`src/components/apps/FileViewer.tsx`)

Universal file preview window opened via double-click:

**Supported Previews:**
- **Images:** `<img>` tag with object-fit
- **Videos:** `<video>` player with controls
- **Audio:** `<audio>` player with controls
- **PDFs:** `<iframe>` with sandbox
- **Code:** `<iframe>` with syntax highlighting
- **Text:** `<iframe>` with plain text
- **HTML:** `<iframe>` with sandboxed rendering

---

**4. Notepad** (`src/components/apps/Notepad.tsx`)

Text editor opened for .txt and .md files:

**Features:**
- Full text editing with `<textarea>`
- Auto-save (2-second debounce)
- Direct integration with fileStore
- File name in window title
- Keyboard shortcuts (Ctrl+S to save)

---

### State Management

#### Zustand Store: `fileStore`

**File:** `src/store/fileStore.ts`

The File Explorer uses a centralized Zustand store for all file system state, providing a single source of truth.

#### State Interface

```typescript
interface FileStoreState extends FileSystemState {
  // Core Data
  files: FileItem[];              // All files in system
  currentPath: string[];          // Stack of folder IDs (navigation)

  // UI State
  selectedFileIds: string[];      // Multi-select state
  lastSelectedFileId: string | null;

  // Clipboard
  clipboard: {
    fileIds: string[];
    operation: 'cut' | 'copy' | null;
  };

  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Actions (50+ methods)
  // ... see API Reference below
}
```

---

#### FileItem Interface

```typescript
interface FileItem {
  id: string;                    // Unique ID (e.g., 'file-1234567890')
  name: string;                  // Display name with extension
  type: 'folder' | 'file' | 'image' | 'video' | 'document';
  parentId: string | null;       // Parent folder ID (null = root)
  path: string;                  // Full path (e.g., '/Projects/MyProject')

  // Optional Metadata
  size?: number;                 // File size in bytes
  content?: string;              // Text file content
  dataUrl?: string;              // Supabase URL or Base64
  mimeType?: string;             // MIME type (e.g., 'image/png')

  // Timestamps
  createdAt: number;             // Unix timestamp
  modifiedAt: number;            // Unix timestamp
}
```

---

#### Local Component State

The FileExplorer component maintains its own local state for UI concerns:

```typescript
// View Preferences
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium');
const [searchQuery, setSearchQuery] = useState('');

// Modals & Dialogs
const [showNewDialog, setShowNewDialog] = useState<'folder' | 'file' | null>(null);
const [newName, setNewName] = useState('');
const [newFileContent, setNewFileContent] = useState('');

// Context Menu
const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

// Inline Rename
const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
const [renameValue, setRenameValue] = useState('');

// Drag & Drop
const [dropTargetId, setDropTargetId] = useState<string | null>(null);

// Upload Progress
const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
```

**Why Separate State?**
- View preferences are ephemeral (not persisted)
- UI state doesn't need global access
- Keeps fileStore focused on data, not UI
- Reduces unnecessary re-renders in other components

---

### Data Flow

#### Read Flow (Display Files)

```
1. Component Mounts
   ↓
2. fileStore.fetchFileSystem()
   ↓
3. Supabase Query (site_content table, id='filesystem')
   ↓
4. Update fileStore.files[]
   ↓
5. fileStore.getCurrentFolderFiles()
   ↓
6. Component reads via useFileStore()
   ↓
7. Apply filters (search, sort)
   ↓
8. Render in Grid/List View
```

**Optimizations:**
- `useMemo` for filtered/sorted file list
- Only queries Supabase once on initial load
- All subsequent operations are local + debounced save

---

#### Write Flow (Create/Update/Delete)

```
1. User Action (e.g., create folder)
   ↓
2. Validate Input (name conflicts, etc.)
   ↓
3. Call fileStore Action (e.g., addFile)
   ↓
4. Update Local State (fileStore.files[])
   ↓
5. Trigger Debounced Save (1000ms)
   ↓
6. Save to Supabase (upsert to site_content)
   ↓
7. Component Auto Re-renders (Zustand subscription)
```

**Debounced Saving:**
- Prevents API spam during rapid operations
- 1000ms delay after last state change
- Batches multiple operations into single save
- User sees instant feedback (optimistic updates)

---

#### Upload Flow (File Upload)

```
1. User Selects Files (button or drag-drop)
   ↓
2. Validate Each File (size, type)
   ↓
3. Loop Through Files Sequentially
   ↓
   For Each File:
     ├─ Generate Unique Filename
     ├─ Upload to Supabase Storage
     ├─ Track Progress (0-100%)
     ├─ Get Public URL
     ├─ Create FileItem in fileStore
     └─ Update Upload Progress UI
   ↓
4. Show Success/Error Notifications
   ↓
5. Clear Upload Progress After 3s
```

**Upload Configuration:**
```typescript
{
  maxSizeMB: 100,
  allowedTypes: ['image/*', 'video/*', 'application/pdf', 'text/*'],
  bucket: 'portfolio-files',
  onProgress: (progress: number) => { /* Update UI */ }
}
```

---

### Storage Integration

#### Supabase Storage

**File:** `src/lib/uploadUtils.ts`

**Storage Bucket:** `portfolio-files` (public bucket)

**Upload Strategy:**
```typescript
async function uploadFileWithFallback(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  try {
    // Attempt Supabase upload
    return await uploadToSupabase(file, options);
  } catch (error) {
    // Fallback to Base64 if Supabase fails
    return await uploadToBase64(file);
  }
}
```

**File Naming:**
```typescript
// Format: {timestamp}-{random}-{filename}
const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;

// Example: 1704153600000-k3j2h9f1s-vacation.jpg
```

**Public URLs:**
```typescript
const { data } = supabase.storage
  .from('portfolio-files')
  .getPublicUrl(fileName);

// Returns: https://xyz.supabase.co/storage/v1/object/public/portfolio-files/{fileName}
```

---

#### Database Persistence

**Table:** `site_content`
**Row ID:** `filesystem`

**Schema:**
```sql
CREATE TABLE site_content (
  id TEXT PRIMARY KEY,
  data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Saved Data Structure:**
```json
{
  "id": "filesystem",
  "data": {
    "files": [
      {
        "id": "file-1704153600000",
        "name": "Document.txt",
        "type": "file",
        "parentId": null,
        "path": "/",
        "size": 1024,
        "content": "Hello World",
        "mimeType": "text/plain",
        "createdAt": 1704153600000,
        "modifiedAt": 1704153600000
      },
      {
        "id": "folder-1704153700000",
        "name": "Projects",
        "type": "folder",
        "parentId": null,
        "path": "/Projects",
        "createdAt": 1704153700000,
        "modifiedAt": 1704153700000
      }
    ],
    "currentPath": ["folder-1704153700000"]
  }
}
```

**Save Function:**
```typescript
const saveToSupabase = async (state: FileSystemState) => {
  await supabase
    .from('site_content')
    .upsert({
      id: 'filesystem',
      data: {
        files: state.files,
        currentPath: state.currentPath
      },
      updated_at: new Date().toISOString()
    });
};
```

**Load Function:**
```typescript
const fetchFileSystem = async () => {
  const { data } = await supabase
    .from('site_content')
    .select('data')
    .eq('id', 'filesystem')
    .single();

  if (data?.data) {
    set({
      files: data.data.files || defaultFiles,
      currentPath: data.data.currentPath || []
    });
  }
};
```

---

## Developer Guide

### File System API

The `fileStore` exposes a comprehensive API for file operations. Here are the most commonly used methods:

#### Navigation

```typescript
import { useFileStore } from '../store/fileStore';

// In component
const {
  currentPath,
  navigateToFolder,
  navigateTo,
  navigateUp,
  getPathString
} = useFileStore();

// Navigate into a folder
navigateToFolder('folder-123');

// Navigate to specific path
navigateTo(['folder-1', 'folder-2', 'folder-3']);

// Go up one level
navigateUp();

// Get current path as string
const pathString = getPathString(); // e.g., "Projects/MyProject"
```

---

#### File Queries

```typescript
const {
  files,
  getCurrentFolderFiles,
  getFileById,
  getAllFiles
} = useFileStore();

// Get files in current folder
const currentFiles = getCurrentFolderFiles();

// Get specific file
const file = getFileById('file-123');

// Get all files (entire tree)
const allFiles = getAllFiles();
```

---

#### File Operations

**Creating:**
```typescript
const { addFile } = useFileStore();

// Create folder
addFile({
  id: `folder-${Date.now()}`,
  name: 'New Folder',
  type: 'folder',
  parentId: currentFolderId || null,
  path: '/New Folder',
  createdAt: Date.now(),
  modifiedAt: Date.now()
});

// Create file
addFile({
  id: `file-${Date.now()}`,
  name: 'Document.txt',
  type: 'file',
  parentId: currentFolderId || null,
  path: '/Document.txt',
  content: 'Initial content',
  mimeType: 'text/plain',
  size: 15,
  createdAt: Date.now(),
  modifiedAt: Date.now()
});
```

**Updating:**
```typescript
const { updateFile, updateFileContent } = useFileStore();

// Update metadata
updateFile('file-123', {
  name: 'Renamed.txt',
  modifiedAt: Date.now()
});

// Update content (auto-saves)
updateFileContent('file-123', 'New content');
```

**Deleting:**
```typescript
const { removeFile } = useFileStore();

// Delete file or folder (recursive)
removeFile('file-123');
```

**Moving/Copying:**
```typescript
const { moveFiles, copyFilesTo, duplicateFiles } = useFileStore();

// Move files
moveFiles(['file-1', 'file-2'], 'destination-folder-id');

// Copy files
copyFilesTo(['file-1', 'file-2'], 'destination-folder-id');

// Duplicate in same folder
duplicateFiles(['file-1', 'file-2']);
```

**Renaming:**
```typescript
const { renameFile } = useFileStore();

// Rename file
renameFile('file-123', 'New Name.txt');
```

---

#### Clipboard Operations

```typescript
const {
  clipboard,
  cutFiles,
  copyFiles,
  pasteFiles,
  clearClipboard
} = useFileStore();

// Cut files
cutFiles(['file-1', 'file-2']);

// Copy files
copyFiles(['file-1', 'file-2']);

// Paste to folder
pasteFiles('destination-folder-id');

// Check clipboard state
if (clipboard.operation === 'cut') {
  // Files are cut (show with reduced opacity)
}

// Clear clipboard
clearClipboard();
```

---

#### Selection Management

```typescript
const {
  selectedFileIds,
  lastSelectedFileId,
  setSelectedFiles,
  addToSelection,
  removeFromSelection,
  selectRange,
  clearSelection,
  selectAll
} = useFileStore();

// Set selection (replaces existing)
setSelectedFiles(['file-1', 'file-2']);

// Add to selection (Ctrl+Click)
addToSelection('file-3');

// Remove from selection
removeFromSelection('file-1');

// Range select (Shift+Click)
selectRange('file-1', 'file-5');

// Clear selection
clearSelection();

// Select all in folder
selectAll('folder-id');
```

---

### Adding Custom File Types

To add support for a new file type:

#### 1. Add MIME Type Mapping

**File:** `src/lib/fileUtils.ts`

```typescript
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    // ... existing types
    'sketch': 'application/x-sketch',
    'fig': 'application/x-figma',
    // Add your type here
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}
```

---

#### 2. Add Icon Mapping

**File:** `src/lib/fileUtils.ts`

```typescript
import { Figma, Pencil } from 'lucide-react';

export function getFileIcon(file: FileItem) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  const iconMap: Record<string, any> = {
    // ... existing icons
    'sketch': Pencil,
    'fig': Figma,
    // Add your icon here
  };

  return iconMap[extension] || File;
}
```

---

#### 3. Add Color Mapping

**File:** `src/lib/fileUtils.ts`

```typescript
export function getFileColor(file: FileItem): string {
  const extension = file.name.split('.').pop()?.toLowerCase();

  const colorMap: Record<string, string> = {
    // ... existing colors
    'sketch': 'text-yellow-500',
    'fig': 'text-purple-500',
    // Add your color here
  };

  return colorMap[extension] || 'text-gray-400';
}
```

---

#### 4. Add Viewer Type (Optional)

If your file type needs a custom viewer:

**File:** `src/lib/fileUtils.ts`

```typescript
export function getViewerType(file: FileItem): ViewerType {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // ... existing logic

  if (['sketch', 'fig'].includes(extension)) {
    return 'design'; // Custom viewer type
  }

  return 'none';
}
```

Then implement the viewer in `FileViewer.tsx`:

```typescript
// src/components/apps/FileViewer.tsx

if (viewerType === 'design') {
  return (
    <div className="p-4">
      <h3>Design File Preview</h3>
      <p>File: {file.name}</p>
      {/* Add custom preview logic */}
    </div>
  );
}
```

---

### Extending Functionality

#### Adding a Sidebar

To add a sidebar to the File Explorer:

```typescript
// src/components/apps/FileExplorer.tsx

const FileExplorer: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 bg-gray-800/50 border-r border-gray-700 p-4">
          <h3 className="text-sm font-semibold mb-2">Quick Access</h3>
          <div className="space-y-1">
            <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-700">
              📁 Recent Files
            </button>
            <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-700">
              ⭐ Favorites
            </button>
          </div>
        </div>
      )}

      {/* Existing Explorer Content */}
      <div className="flex-1">
        {/* ... existing code */}
      </div>
    </div>
  );
};
```

---

#### Adding File Tags

To add tagging support:

**1. Update FileItem Interface:**
```typescript
// src/types.ts
interface FileItem {
  // ... existing fields
  tags?: string[];
}
```

**2. Add Tag Management to Store:**
```typescript
// src/store/fileStore.ts
addTagToFile: (fileId: string, tag: string) => {
  set(state => ({
    files: state.files.map(f =>
      f.id === fileId
        ? { ...f, tags: [...(f.tags || []), tag] }
        : f
    )
  }));
  get().saveToSupabase();
},

removeTagFromFile: (fileId: string, tag: string) => {
  set(state => ({
    files: state.files.map(f =>
      f.id === fileId
        ? { ...f, tags: (f.tags || []).filter(t => t !== tag) }
        : f
    )
  }));
  get().saveToSupabase();
}
```

**3. Display Tags in UI:**
```typescript
// In FileExplorer.tsx
<div className="flex flex-wrap gap-1 mt-1">
  {file.tags?.map(tag => (
    <span
      key={tag}
      className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded"
    >
      {tag}
    </span>
  ))}
</div>
```

---

#### Adding File Compression

To add ZIP file creation:

```typescript
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const compressFiles = async (fileIds: string[]) => {
  const { getFileById } = useFileStore.getState();
  const zip = new JSZip();

  for (const fileId of fileIds) {
    const file = getFileById(fileId);
    if (file && file.type !== 'folder') {
      // Add file to ZIP
      if (file.dataUrl?.startsWith('data:')) {
        // Base64
        const base64 = file.dataUrl.split(',')[1];
        zip.file(file.name, base64, { base64: true });
      } else if (file.dataUrl) {
        // Fetch from URL
        const response = await fetch(file.dataUrl);
        const blob = await response.blob();
        zip.file(file.name, blob);
      }
    }
  }

  // Generate ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'files.zip');
};
```

---

## Troubleshooting

### Common Issues

#### Files Don't Persist After Refresh

**Symptom:** Files disappear when reloading the page

**Causes:**
1. Supabase not configured (using localStorage fallback)
2. Database save failing silently
3. Environment variables not set

**Solutions:**
```bash
# 1. Check environment variables
cat .env

# Should contain:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 2. Check browser console for errors
# Open DevTools → Console tab
# Look for Supabase errors

# 3. Verify database setup
# Run supabase-setup.sql in Supabase SQL Editor
```

---

#### Upload Fails with "Permission Denied"

**Symptom:** Files fail to upload, showing error notification

**Causes:**
1. Not authenticated (Supabase requires auth for uploads)
2. Storage bucket not created
3. Storage policies not set up

**Solutions:**
```typescript
// 1. Check if authenticated
import { useAuthStore } from '../store/authStore';
const { user } = useAuthStore();
console.log('Authenticated:', !!user);

// 2. Sign in via Admin Panel
// Press Ctrl+Shift+A and login

// 3. Verify storage setup
// Run storage-setup.sql in Supabase SQL Editor
```

---

#### Files Upload but Don't Appear

**Symptom:** Upload shows success but files not visible

**Causes:**
1. File metadata not saved to database
2. File created in wrong folder
3. Search filter active

**Solutions:**
```typescript
// 1. Check if file was added to store
const { files } = useFileStore.getState();
console.log('All files:', files);

// 2. Clear search filter
setSearchQuery('');

// 3. Check current folder
const currentFiles = getCurrentFolderFiles();
console.log('Current folder files:', currentFiles);
```

---

#### Drag & Drop Not Working

**Symptom:** Cannot drag files or folders

**Causes:**
1. Browser security restrictions
2. Event handlers not firing
3. Drop target not accepting drop

**Solutions:**
```typescript
// 1. Check console for errors during drag
console.log('Drag started');

// 2. Ensure preventDefault called
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault(); // Required!
  e.stopPropagation();
};

// 3. Check if item is draggable
<div draggable={true} onDragStart={handleDragStart}>
  {/* ... */}
</div>
```

---

#### Context Menu Appears Off-Screen

**Symptom:** Right-click menu cut off by window edge

**Cause:** Context menu position not adjusted for viewport

**Solution:**
The ContextMenu component already handles this, but if customizing:

```typescript
const adjustPosition = (x: number, y: number, width: number, height: number) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return {
    x: x + width > viewportWidth ? viewportWidth - width - 10 : x,
    y: y + height > viewportHeight ? viewportHeight - height - 10 : y
  };
};
```

---

#### Performance Issues with Many Files

**Symptom:** Slow rendering with 500+ files

**Causes:**
1. All files rendered in DOM
2. No virtualization
3. Expensive re-renders

**Solutions:**
```typescript
// 1. Use React.memo for file items
const FileItem = React.memo(({ file }: { file: FileItem }) => {
  // ... component code
});

// 2. Implement virtual scrolling
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={files.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <FileItem file={files[index]} />
    </div>
  )}
</FixedSizeList>

// 3. Paginate results
const itemsPerPage = 100;
const paginatedFiles = files.slice(
  currentPage * itemsPerPage,
  (currentPage + 1) * itemsPerPage
);
```

---

### Debug Mode

Enable detailed logging:

```typescript
// src/store/fileStore.ts

// Add to store
debug: process.env.NODE_ENV === 'development',

// Wrap actions with logging
addFile: (file: FileItem) => {
  if (get().debug) {
    console.log('[FileStore] Adding file:', file);
  }

  set(state => ({
    files: [...state.files, file]
  }));

  if (get().debug) {
    console.log('[FileStore] New file count:', get().files.length);
  }

  get().saveToSupabase();
}
```

---

### Browser Compatibility

**Supported Browsers:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Known Issues:**
- Safari < 14: Drag & drop may not work properly
- Firefox < 88: Clipboard API requires HTTPS
- Mobile browsers: Touch events not fully implemented

---

## Performance Metrics

Typical performance characteristics:

| Operation | Time | Notes |
|-----------|------|-------|
| Initial Load | 500-1000ms | Depends on file count |
| File Creation | < 50ms | Instant, debounced save |
| File Upload (1MB) | 1-3s | Depends on network |
| File Upload (10MB) | 10-30s | Depends on network |
| Search (100 files) | < 10ms | Client-side filter |
| Search (1000 files) | < 50ms | Client-side filter |
| Folder Navigation | < 20ms | Local state update |
| Multi-select (10 files) | < 5ms | Per selection |
| Drag & Drop (local) | < 10ms | Local state update |

---

## Future Enhancements

Planned features (see full roadmap in project root):

- [ ] Navigation history (back/forward stack)
- [ ] Trash/Recycle bin with restore
- [ ] Undo/Redo operations
- [ ] File preview pane in explorer
- [ ] Thumbnail generation for images
- [ ] Virtual scrolling for large directories
- [ ] Advanced search (recursive, by content)
- [ ] File filtering by type/date/size
- [ ] Favorites/Bookmarks
- [ ] Recent files list
- [ ] File compression (ZIP creation/extraction)
- [ ] File sharing (public links)
- [ ] Keyboard-only navigation (arrow keys)
- [ ] Breadcrumb improvements (folder metadata on hover)
- [ ] Per-folder view preferences
- [ ] Column customization (list view)
- [ ] Multi-column sorting
- [ ] Batch operation progress
- [ ] File tags and labels
- [ ] File permissions (read/write/delete)

---

## API Reference

### FileStore Actions

Complete list of available actions:

```typescript
interface FileStoreActions {
  // Data Loading
  fetchFileSystem: () => Promise<void>;
  saveToSupabase: () => Promise<void>;

  // File CRUD
  addFile: (file: FileItem) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<FileItem>) => void;
  updateFileContent: (fileId: string, content: string) => void;

  // Navigation
  navigateToFolder: (folderId: string) => void;
  navigateTo: (path: string[]) => void;
  navigateUp: () => void;

  // Queries
  getCurrentFolderFiles: () => FileItem[];
  getFileById: (fileId: string) => FileItem | undefined;
  getPathString: () => string;
  getAllFiles: () => FileItem[];

  // File Operations
  moveFiles: (fileIds: string[], newParentId: string | null) => void;
  copyFilesTo: (fileIds: string[], newParentId: string | null) => void;
  renameFile: (fileId: string, newName: string) => void;
  duplicateFiles: (fileIds: string[]) => void;

  // Selection
  setSelectedFiles: (fileIds: string[]) => void;
  addToSelection: (fileId: string) => void;
  removeFromSelection: (fileId: string) => void;
  selectRange: (fromFileId: string, toFileId: string) => void;
  clearSelection: () => void;
  selectAll: (folderId: string | null) => void;

  // Clipboard
  cutFiles: (fileIds: string[]) => void;
  copyFiles: (fileIds: string[]) => void;
  pasteFiles: (targetFolderId: string | null) => void;
  clearClipboard: () => void;
}
```

---

## Contributing

To contribute improvements to File Explorer:

1. **Understand the architecture** - Read this document thoroughly
2. **Follow existing patterns** - Match code style and structure
3. **Test thoroughly** - Verify file operations don't corrupt data
4. **Update documentation** - Document new features here
5. **Consider backwards compatibility** - Don't break existing files
6. **Add TypeScript types** - Maintain type safety

**Key Files to Modify:**
- Component: `src/components/apps/FileExplorer.tsx`
- Store: `src/store/fileStore.ts`
- Utilities: `src/lib/fileUtils.ts`, `src/lib/uploadUtils.ts`
- Types: `src/types.ts`

---

## License

This File Explorer is part of PortfolioOS and is licensed under the MIT License.

---

**Built with ❤️ for PortfolioOS**

*Last Updated: 2026-01-17*
