export interface App {
  id: string;
  name: string;
  icon: string;
  customIcon?: string;
  type: 'component' | 'iframe' | 'static';
  component?: string;
  url?: string;
  pinnedToTaskbar?: boolean;
  pinnedToDesktop?: boolean;
  desktopPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  description?: string;
  // Project app metadata
  projectStatus?: 'live' | 'featured' | 'wip' | 'archived';
  tags?: string[];
  role?: string;
  year?: string;
  projectLinks?: {
    live?: string;
    github?: string;
    demo?: string;
  };
  // Window surface contract — controls body background and chrome style
  surfaceMode?: 'content' | 'utilityDark' | 'immersive' | 'iframe';
  // Window behaviour hints
  preferredWindowMode?: 'floating' | 'maximized' | 'fixed';
  mobileBehavior?: 'maximize' | 'fullscreen' | 'hide';
  minSize?: { width: number; height: number };
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  customIcon?: string; // Base64 data URL for custom uploaded icon
  type: 'component' | 'iframe' | 'static';
  component?: string;
  url?: string;
  content?: string;
  fileId?: string; // For tracking which file is being edited
  file?: FileItem; // For passing full file object to viewers
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  /** Controls window body background and chrome treatment */
  surfaceMode?: 'content' | 'utilityDark' | 'immersive' | 'iframe';
  /** Minimum resize dimensions — enforced during drag-resize */
  minSize?: { width: number; height: number };
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'document';
  parentId: string | null;
  path: string;
  size?: number;
  content?: string;
  dataUrl?: string;
  mimeType?: string;
  createdAt: number;
  modifiedAt: number;
  isProtected?: boolean;    // Cannot be deleted or renamed by visitors
  isVisitorOwned?: boolean; // Created by a visitor session
}

export const VISITOR_GALLERY_ID = 'folder-visitor-gallery';

export interface FileSystemState {
  files: FileItem[];
  currentPath: string[];
}
