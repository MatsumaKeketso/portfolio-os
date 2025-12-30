import { create } from 'zustand';
import { FileItem, FileSystemState } from '../types';

// Helper functions
const generateUniqueName = (files: FileItem[], baseName: string, parentId: string | null): string => {
  const siblings = files.filter(f => f.parentId === parentId);
  const siblingNames = new Set(siblings.map(f => f.name));

  if (!siblingNames.has(baseName)) return baseName;

  // Extract name and extension
  const lastDot = baseName.lastIndexOf('.');
  const name = lastDot > 0 ? baseName.substring(0, lastDot) : baseName;
  const ext = lastDot > 0 ? baseName.substring(lastDot) : '';

  // Try " - Copy", " - Copy (2)", etc.
  let counter = 1;
  let newName = `${name} - Copy${ext}`;

  while (siblingNames.has(newName)) {
    counter++;
    newName = `${name} - Copy (${counter})${ext}`;
  }

  return newName;
};

const isAncestor = (files: FileItem[], childId: string, ancestorId: string): boolean => {
  let currentId: string | null = childId;
  while (currentId) {
    if (currentId === ancestorId) return true;
    const current = files.find(f => f.id === currentId);
    currentId = current?.parentId || null;
  }
  return false;
};

const getFilePath = (files: FileItem[], fileId: string | null): string => {
  if (!fileId) return '';
  const file = files.find(f => f.id === fileId);
  if (!file) return '';
  if (file.parentId === null) return `/${file.name}`;
  const parentPath = getFilePath(files, file.parentId);
  return `${parentPath}/${file.name}`;
};

interface FileStoreState extends FileSystemState {
  // Clipboard
  clipboard: {
    fileIds: string[];
    operation: 'cut' | 'copy' | null;
  };

  // Multi-select
  selectedFileIds: string[];
  lastSelectedFileId: string | null;

  // Existing operations
  addFile: (file: FileItem) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<FileItem>) => void;
  navigateToFolder: (folderId: string | null) => void;
  navigateUp: () => void;
  getCurrentFolderFiles: () => FileItem[];
  getFileById: (fileId: string) => FileItem | undefined;
  getPathString: () => string;
  getAllFiles: () => FileItem[];

  // File operations
  moveFiles: (fileIds: string[], newParentId: string | null) => void;
  copyFilesTo: (fileIds: string[], newParentId: string | null) => void;
  renameFile: (fileId: string, newName: string) => void;
  duplicateFiles: (fileIds: string[]) => void;

  // Selection operations
  setSelectedFiles: (fileIds: string[]) => void;
  addToSelection: (fileId: string) => void;
  removeFromSelection: (fileId: string) => void;
  selectRange: (fromFileId: string, toFileId: string) => void;
  clearSelection: () => void;
  selectAll: (folderId: string | null) => void;

  // Clipboard operations
  cutFiles: (fileIds: string[]) => void;
  copyFiles: (fileIds: string[]) => void;
  pasteFiles: (targetFolderId: string | null) => void;
  clearClipboard: () => void;
}

const defaultFiles: FileItem[] = [
  {
    id: 'folder-projects',
    name: 'Projects',
    type: 'folder',
    parentId: null,
    path: '/Projects',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'folder-portfolio-sites',
    name: 'Portfolio Sites',
    type: 'folder',
    parentId: null,
    path: '/Portfolio Sites',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'folder-certificates',
    name: 'Certificates',
    type: 'folder',
    parentId: null,
    path: '/Certificates',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'file-resume',
    name: 'Resume.txt',
    type: 'document',
    parentId: null,
    path: '/Resume.txt',
    size: 2048,
    content: 'Professional Resume\n\nSoftware Developer based in Johannesburg\nSpecialized in React, TypeScript, and Modern Web Technologies',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'file-about',
    name: 'About Me.txt',
    type: 'document',
    parentId: null,
    path: '/About Me.txt',
    size: 512,
    content: 'Software Developer from Johannesburg, South Africa\n\nPassionate about creating innovative web applications and interactive experiences.',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
];

const loadFilesFromStorage = (): FileItem[] => {
  const stored = localStorage.getItem('portfolioOS_files');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultFiles;
    }
  }
  return defaultFiles;
};

export const useFileStore = create<FileStoreState>((set, get) => ({
  files: loadFilesFromStorage(),
  currentPath: [],
  clipboard: { fileIds: [], operation: null },
  selectedFileIds: [],
  lastSelectedFileId: null,

  addFile: (file) => set((state) => {
    const newFiles = [...state.files, file];
    localStorage.setItem('portfolioOS_files', JSON.stringify(newFiles));
    return { files: newFiles };
  }),

  removeFile: (fileId) => set((state) => {
    const newFiles = state.files.filter(f => f.id !== fileId);
    const childFiles = state.files.filter(f => f.parentId === fileId);
    const allRemovedIds = [fileId, ...childFiles.map(f => f.id)];
    const finalFiles = state.files.filter(f => !allRemovedIds.includes(f.id));

    localStorage.setItem('portfolioOS_files', JSON.stringify(finalFiles));
    return { files: finalFiles };
  }),

  updateFile: (fileId, updates) => set((state) => {
    const newFiles = state.files.map(f =>
      f.id === fileId ? { ...f, ...updates, modifiedAt: Date.now() } : f
    );
    localStorage.setItem('portfolioOS_files', JSON.stringify(newFiles));
    return { files: newFiles };
  }),

  navigateToFolder: (folderId) => set((state) => {
    const file = state.files.find(f => f.id === folderId);
    if (file?.type === 'folder') {
      return {
        currentPath: [...state.currentPath, folderId],
        selectedFileIds: [],
        lastSelectedFileId: null
      };
    }
    return state;
  }),

  navigateUp: () => set((state) => {
    if (state.currentPath.length > 0) {
      return {
        currentPath: state.currentPath.slice(0, -1),
        selectedFileIds: [],
        lastSelectedFileId: null
      };
    }
    return state;
  }),

  getCurrentFolderFiles: () => {
    const state = get();
    const currentFolderId = state.currentPath[state.currentPath.length - 1] || null;
    return state.files.filter(f => f.parentId === currentFolderId);
  },

  getFileById: (fileId) => {
    return get().files.find(f => f.id === fileId);
  },

  getPathString: () => {
    const state = get();
    if (state.currentPath.length === 0) {
      return 'This PC > Portfolio';
    }
    const names = state.currentPath.map(id => {
      const file = get().files.find(f => f.id === id);
      return file?.name || 'Unknown';
    });
    return 'This PC > Portfolio > ' + names.join(' > ');
  },

  getAllFiles: () => get().files,

  // File operations
  moveFiles: (fileIds, newParentId) => set((state) => {
    let updatedFiles = [...state.files];

    for (const fileId of fileIds) {
      // Prevent circular moves
      if (newParentId && isAncestor(updatedFiles, newParentId, fileId)) {
        continue; // Skip this file
      }

      const file = updatedFiles.find(f => f.id === fileId);
      if (!file) continue;

      // Generate unique name if conflict
      const uniqueName = generateUniqueName(updatedFiles, file.name, newParentId);
      const newPath = getFilePath(updatedFiles, newParentId) + `/${uniqueName}`;

      // Update file
      updatedFiles = updatedFiles.map(f => {
        if (f.id === fileId) {
          return { ...f, name: uniqueName, parentId: newParentId, path: newPath, modifiedAt: Date.now() };
        }
        return f;
      });

      // Update descendants paths recursively
      const updateDescendantPaths = (parentId: string) => {
        const children = updatedFiles.filter(f => f.parentId === parentId);
        children.forEach(child => {
          const childNewPath = getFilePath(updatedFiles, child.id);
          updatedFiles = updatedFiles.map(f =>
            f.id === child.id ? { ...f, path: childNewPath } : f
          );
          if (child.type === 'folder') {
            updateDescendantPaths(child.id);
          }
        });
      };

      if (file.type === 'folder') {
        updateDescendantPaths(fileId);
      }
    }

    localStorage.setItem('portfolioOS_files', JSON.stringify(updatedFiles));
    return { files: updatedFiles };
  }),

  copyFilesTo: (fileIds, newParentId) => set((state) => {
    let updatedFiles = [...state.files];

    const copyFileRecursive = (sourceFileId: string, targetParentId: string | null): string => {
      const source = updatedFiles.find(f => f.id === sourceFileId);
      if (!source) return '';

      const newId = `${source.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const uniqueName = generateUniqueName(updatedFiles, source.name, targetParentId);
      const newPath = getFilePath(updatedFiles, targetParentId) + `/${uniqueName}`;

      const newFile: FileItem = {
        ...source,
        id: newId,
        name: uniqueName,
        parentId: targetParentId,
        path: newPath,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };

      updatedFiles.push(newFile);

      // Recursively copy children if folder
      if (source.type === 'folder') {
        const children = updatedFiles.filter(f => f.parentId === sourceFileId);
        children.forEach(child => {
          copyFileRecursive(child.id, newId);
        });
      }

      return newId;
    };

    fileIds.forEach(fileId => copyFileRecursive(fileId, newParentId));

    localStorage.setItem('portfolioOS_files', JSON.stringify(updatedFiles));
    return { files: updatedFiles };
  }),

  renameFile: (fileId, newName) => set((state) => {
    if (!newName.trim()) return state;

    const file = state.files.find(f => f.id === fileId);
    if (!file) return state;

    // Check for conflicts
    const siblings = state.files.filter(f => f.parentId === file.parentId && f.id !== fileId);
    if (siblings.some(f => f.name === newName)) {
      // Name already exists, could show error or auto-rename
      return state;
    }

    let updatedFiles = [...state.files];

    // Update file name and path
    const newPath = getFilePath(updatedFiles, file.parentId) + `/${newName}`;
    updatedFiles = updatedFiles.map(f =>
      f.id === fileId ? { ...f, name: newName, path: newPath, modifiedAt: Date.now() } : f
    );

    // Update descendant paths if folder
    if (file.type === 'folder') {
      const updateDescendantPaths = (parentId: string) => {
        const children = updatedFiles.filter(f => f.parentId === parentId);
        children.forEach(child => {
          const childNewPath = getFilePath(updatedFiles, child.id);
          updatedFiles = updatedFiles.map(f =>
            f.id === child.id ? { ...f, path: childNewPath } : f
          );
          if (child.type === 'folder') {
            updateDescendantPaths(child.id);
          }
        });
      };
      updateDescendantPaths(fileId);
    }

    localStorage.setItem('portfolioOS_files', JSON.stringify(updatedFiles));
    return { files: updatedFiles };
  }),

  duplicateFiles: (fileIds) => {
    const state = get();
    const firstFile = state.files.find(f => f.id === fileIds[0]);
    if (firstFile) {
      get().copyFilesTo(fileIds, firstFile.parentId);
    }
  },

  // Selection operations
  setSelectedFiles: (fileIds) => set({
    selectedFileIds: fileIds,
    lastSelectedFileId: fileIds.length > 0 ? fileIds[fileIds.length - 1] : null
  }),

  addToSelection: (fileId) => set((state) => ({
    selectedFileIds: [...state.selectedFileIds, fileId],
    lastSelectedFileId: fileId
  })),

  removeFromSelection: (fileId) => set((state) => ({
    selectedFileIds: state.selectedFileIds.filter(id => id !== fileId)
  })),

  selectRange: (fromFileId, toFileId) => set((state) => {
    const currentFiles = get().getCurrentFolderFiles();
    const fromIndex = currentFiles.findIndex(f => f.id === fromFileId);
    const toIndex = currentFiles.findIndex(f => f.id === toFileId);

    if (fromIndex === -1 || toIndex === -1) return state;

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);

    const rangeIds = currentFiles.slice(start, end + 1).map(f => f.id);
    return { selectedFileIds: rangeIds, lastSelectedFileId: toFileId };
  }),

  clearSelection: () => set({
    selectedFileIds: [],
    lastSelectedFileId: null
  }),

  selectAll: (folderId) => set(() => {
    const filesInFolder = get().getCurrentFolderFiles();
    return {
      selectedFileIds: filesInFolder.map(f => f.id),
      lastSelectedFileId: filesInFolder.length > 0 ? filesInFolder[filesInFolder.length - 1].id : null
    };
  }),

  // Clipboard operations
  cutFiles: (fileIds) => set({
    clipboard: { fileIds, operation: 'cut' }
  }),

  copyFiles: (fileIds) => set({
    clipboard: { fileIds, operation: 'copy' }
  }),

  pasteFiles: (targetFolderId) => {
    const state = get();
    const { clipboard } = state;

    if (clipboard.fileIds.length === 0) return;

    if (clipboard.operation === 'cut') {
      get().moveFiles(clipboard.fileIds, targetFolderId);
      get().clearClipboard();
    } else if (clipboard.operation === 'copy') {
      get().copyFilesTo(clipboard.fileIds, targetFolderId);
      // Keep clipboard for multiple pastes
    }
  },

  clearClipboard: () => set({
    clipboard: { fileIds: [], operation: null }
  }),
}));
