export interface App {
  id: string;
  name: string;
  icon: string;
  type: 'component' | 'iframe' | 'static';
  component?: string;
  url?: string;
  pinnedToTaskbar?: boolean;
  pinnedToDesktop?: boolean;
  desktopPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  description?: string;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  type: 'component' | 'iframe' | 'static';
  component?: string;
  url?: string;
  content?: string;
  fileId?: string; // For tracking which file is being edited
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
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
}

export interface FileSystemState {
  files: FileItem[];
  currentPath: string[];
}
