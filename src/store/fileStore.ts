import { create } from 'zustand';
import { FileItem, FileSystemState } from '../types';

interface FileStoreState extends FileSystemState {
  addFile: (file: FileItem) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<FileItem>) => void;
  navigateToFolder: (folderId: string | null) => void;
  navigateUp: () => void;
  getCurrentFolderFiles: () => FileItem[];
  getFileById: (fileId: string) => FileItem | undefined;
  getPathString: () => string;
  getAllFiles: () => FileItem[];
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
      return { currentPath: [...state.currentPath, folderId] };
    }
    return state;
  }),

  navigateUp: () => set((state) => {
    if (state.currentPath.length > 0) {
      return { currentPath: state.currentPath.slice(0, -1) };
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
}));
