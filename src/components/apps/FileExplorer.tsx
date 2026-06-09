import { useState, useRef, useEffect, useMemo, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useFileStore, SYSTEM_FOLDER_IDS } from '../../store/fileStore';
import { useDesktopStore } from '../../store/desktopStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { FileItem, VISITOR_GALLERY_ID, TRASH_FOLDER_ID } from '../../types';
import { ContextMenu, ContextMenuItem } from '../ContextMenu';
import { SystemRow, SystemRowGroup, SystemRowDivider } from '../ui/SystemRow';
import { MediaSurface } from '../ui/surface';
import { AppShell } from '../ui/AppShell';
import { uploadFile, UploadProgress as UploadProgressType } from '../../lib/uploadUtils';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { getFilePathFromUrl } from '../../lib/uploadUtils';
import { UploadProgressToast } from '../UploadProgress';
import { getFileIcon, getFileColor, formatFileSize } from '../../lib/fileUtils';
import { getLocationContext, getPermissions, fileIsWritable } from '../../lib/filePermissions';
import { openFileWithApp } from '../../lib/fileRouter';
import { ContextMenuItemDef, ContextPermission, resolveAndSort } from '../../lib/contextMenuRegistry';
import { cn } from '../../lib/utils';
import { createThumbnail } from '../../lib/imageUtils';
import { SplitCard, type SplitCardStat } from '../ui/SplitCard';
import { Icon3D, resolveIcon3DType } from '../ui/Icon3D';
import { ProjectCaseStudyPanel } from './ProjectCaseStudyPanel';

// Compact relative-time formatter ("3d ago", "2h ago", "just now"). Pure UI
// sugar — fine to inline here while it has no other caller.
function formatRelativeDate(ts?: number): string {
  if (!ts) return '—';
  const diffMs = Date.now() - ts;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

// ---------------------------------------------------------------------------
// Sidebar location definitions
// ---------------------------------------------------------------------------

const SIDEBAR_LOCATIONS = [
  { id: 'desktop', label: 'Desktop', icon: Icons.Monitor, folderId: 'folder-desktop' as string | null },
  { id: 'folder-documents', label: 'Documents', icon: Icons.FileText, folderId: 'folder-documents' },
  { id: 'folder-downloads', label: 'Downloads', icon: Icons.Download, folderId: 'folder-downloads' },
  { id: 'folder-projects', label: 'Projects', icon: Icons.Briefcase, folderId: 'folder-projects' },
  { id: 'folder-cv', label: 'CV', icon: Icons.UserCheck, folderId: 'folder-cv' },
  { id: 'folder-images', label: 'Images', icon: Icons.Image, folderId: 'folder-images' },
  { id: VISITOR_GALLERY_ID, label: 'Visitor Gallery', icon: Icons.Users, folderId: VISITOR_GALLERY_ID },
  { id: 'folder-system', label: 'System', icon: Icons.HardDrive, folderId: 'folder-system' },
  { id: TRASH_FOLDER_ID, label: 'Trash', icon: Icons.Trash2, folderId: TRASH_FOLDER_ID },
] as const;

const VISITOR_ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const isAllowedVisitorImage = (file: File) => VISITOR_ALLOWED_IMAGE_TYPES.has(file.type);

// Admin upload allowlist — covers media + common document/data types.
// Storage rules are the final enforcement; this just stops uploadFile's
// client-side validator from rejecting safe document types.
const ADMIN_ALLOWED_TYPES = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const createImageThumbnail = async (file: File): Promise<string | undefined> => {
  if (!file.type.startsWith('image/')) return undefined;
  try {
    return await createThumbnail(file, 360);
  } catch (error) {
    console.warn('Failed to create image thumbnail:', error);
    return undefined;
  }
};

const createImageThumbnailFromUrl = async (url: string): Promise<string | undefined> => {
  try {
    return await createThumbnail(url, 360);
  } catch (error) {
    console.warn('Failed to repair image thumbnail:', error);
    return undefined;
  }
};

const toContextMenuItems = (defs: ContextMenuItemDef[], permissions: ContextPermission[]): ContextMenuItem[] =>
  resolveAndSort(defs, permissions).map((item) => ({
    label: item.label,
    icon: item.icon,
    onClick: item.action,
    disabled: item.disabled,
    danger: item.danger,
    divider: item.divider,
    shortcut: item.shortcut,
  }));

export function FileExplorer() {
  const fileStore = useFileStore();
  const { openWindow } = useDesktopStore();
  const { isAdmin } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const [showNewDialog, setShowNewDialog] = useState<'folder' | 'file' | null>(null);
  const [newName, setNewName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [, setIsDraggingInternal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType[]>([]);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const sortOptions: Array<{ value: typeof sortBy; label: string; icon: keyof typeof Icons }> = [
    { value: 'name', label: 'Name', icon: 'Type' },
    { value: 'date', label: 'Date Modified', icon: 'CalendarDays' },
    { value: 'size', label: 'Size', icon: 'HardDrive' },
    { value: 'type', label: 'Type', icon: 'FileType' },
  ];

  // ---------------------------------------------------------------------------
  // Permissions — derived from current path + auth state
  // ---------------------------------------------------------------------------

  const locationContext = useMemo(
    () => getLocationContext(fileStore.currentPath, fileStore.files),
    [fileStore.currentPath, fileStore.files],
  );

  const permissions = useMemo(
    () => getPermissions(locationContext, isAdmin),
    [locationContext, isAdmin],
  );

  const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;
  const currentFiles = useMemo(
    () => fileStore.files.filter((file) => file.parentId === currentFolderId),
    [fileStore.files, currentFolderId],
  );
  const pathString = fileStore.getPathString();

  // Projects is a special case-study surface: a side panel (no inline expand)
  // shows the selected project's markdown case study without reflowing the grid.
  const isProjectsView = fileStore.currentPath[0] === SYSTEM_FOLDER_IDS.projects;
  const panelProject = useMemo<FileItem | undefined>(() => {
    if (!isProjectsView) return undefined;
    // Inside a project (or deeper) → the project is the folder at path depth 1.
    const projectIdInPath = fileStore.currentPath[1];
    if (projectIdInPath) return fileStore.files.find((f) => f.id === projectIdInPath);
    // At the Projects root → show the currently selected project folder, if any.
    const selId = fileStore.selectedFileIds[0];
    const sel = selId ? fileStore.files.find((f) => f.id === selId) : undefined;
    return sel && sel.type === 'folder' ? sel : undefined;
  }, [isProjectsView, fileStore.currentPath, fileStore.selectedFileIds, fileStore.files]);

  // When navigating to Visitor Gallery, load approved uploads from Firestore
  useEffect(() => {
    if (locationContext !== 'visitorGallery') return;
    const q = query(
      collection(db, 'os-gallery'),
      where('status', '==', 'approved'),
      orderBy('uploadedAt', 'desc'),
    );
    getDocs(q).then((snap) => {
      const existingUrls = new Set(
        fileStore.files.filter(f => f.parentId === VISITOR_GALLERY_ID).map(f => f.dataUrl),
      );
      snap.forEach((d) => {
        const data = d.data();
        if (existingUrls.has(data.url)) return;
        fileStore.addFile({
          id: `vg-${d.id}`,
          name: data.name,
          type: 'image',
          mimeType: 'image/jpeg',
          parentId: VISITOR_GALLERY_ID,
          path: `/Visitor Gallery/${data.name}`,
          dataUrl: data.url,
          thumbnailUrl: data.thumbnailUrl,
          createdAt: data.uploadedAt?.toMillis?.() ?? Date.now(),
          modifiedAt: data.uploadedAt?.toMillis?.() ?? Date.now(),
          isVisitorOwned: true,
        });
      });
    }).catch(() => {});
  }, [locationContext]);

  // ---------------------------------------------------------------------------
  // Sidebar helpers
  // ---------------------------------------------------------------------------

  const isLocationActive = (loc: (typeof SIDEBAR_LOCATIONS)[number]) => {
    if (loc.folderId === null) return fileStore.currentPath.length === 0;
    return fileStore.currentPath[0] === loc.folderId;
  };

  const navigateToLocation = (folderId: string | null) => {
    if (folderId === null) {
      fileStore.navigateTo([]);
      return;
    }
    // Create the system folder on first access if it doesn't yet exist in the loaded filesystem
    const exists = fileStore.getFileById(folderId);
    if (!exists) {
      const loc = SIDEBAR_LOCATIONS.find((l) => l.folderId === folderId);
      if (loc) {
        fileStore.addFile({
          id: folderId,
          name: loc.label,
          type: 'folder',
          parentId: null,
          path: `/${loc.label}`,
          isProtected: true,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
        });
      }
    }
    fileStore.navigateTo([folderId]);
  };

  // ---------------------------------------------------------------------------
  // File display helpers
  // ---------------------------------------------------------------------------

  const getFileIconComponent = (file: FileItem) =>
    getFileIcon(file.name, file.type, file.mimeType);

  const getFileColorClass = (file: FileItem) =>
    getFileColor(file.name, file.type, file.mimeType);

  const displayFiles = useMemo(() => {
    let files = [...currentFiles];
    if (searchQuery.trim()) {
      const normalizedSearch = searchQuery.toLowerCase();
      files = files.filter((f) =>
        f.name.toLowerCase().includes(normalizedSearch),
      );
    }
    files.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      let comparison = 0;
      switch (sortBy) {
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'date': comparison = (a.modifiedAt || a.createdAt) - (b.modifiedAt || b.createdAt); break;
        case 'size': comparison = (a.size || 0) - (b.size || 0); break;
        case 'type': comparison = a.type.localeCompare(b.type); break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return files;
  }, [currentFiles, searchQuery, sortBy, sortOrder]);

  const childCountByFolderId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const file of fileStore.files) {
      if (!file.parentId) continue;
      counts.set(file.parentId, (counts.get(file.parentId) ?? 0) + 1);
    }
    return counts;
  }, [fileStore.files]);

  useEffect(() => {
    const candidates = displayFiles
      .filter((file) => file.type === 'image' && file.dataUrl && !file.thumbnailUrl)
      .slice(0, 3);

    if (candidates.length === 0) return;

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      for (const file of candidates) {
        if (cancelled || !file.dataUrl) return;
        const thumbnailUrl = await createImageThumbnailFromUrl(file.dataUrl);
        if (!cancelled && thumbnailUrl) {
          fileStore.updateFile(file.id, { thumbnailUrl });
        }
      }
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [displayFiles, fileStore]);

  // ---------------------------------------------------------------------------
  // Create / upload handlers
  // ---------------------------------------------------------------------------

  const handleCreateFolder = () => {
    if (!newName.trim() || !permissions.canCreateFolder) return;
    const folderId = `folder-${Date.now()}`;
    const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;
    fileStore.addFile({
      id: folderId,
      name: newName,
      type: 'folder',
      parentId: currentFolderId,
      path: `${pathString}/${newName}`,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
    setNewName('');
    setShowNewDialog(null);
  };

  const handleCreateFile = () => {
    if (!newName.trim() || !permissions.canCreateFile) return;
    const fileId = `file-${Date.now()}`;
    const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;
    const fileName = newName.endsWith('.txt') ? newName : `${newName}.txt`;
    fileStore.addFile({
      id: fileId,
      name: fileName,
      type: 'document',
      parentId: currentFolderId,
      path: `${pathString}/${fileName}`,
      content: newFileContent,
      size: newFileContent.length,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
    setNewName('');
    setNewFileContent('');
    setShowNewDialog(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;
    const fileArray = Array.from(files);
    setUploadProgress([]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      // Enforce Visitor Gallery image-only restriction
      if (locationContext === 'visitorGallery' && !isAllowedVisitorImage(file)) {
        addNotification({
          type: 'warning',
          title: 'Upload skipped',
          message: 'Visitor Gallery accepts JPG, PNG, WebP, and GIF images only.',
          duration: 4000,
        });
        continue;
      }

      const fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('audio/')
            ? 'audio'
            : 'file';

      let dataUrl = '';
      let uploadError: string | undefined;
      const thumbnailUrl = await createImageThumbnail(file);

      // Every uploaded file goes through Firebase Storage. Previously this
      // gate only matched image/video/audio, which silently dropped PDFs and
      // other documents — the metadata was stored but the bytes were lost.
      {
        try {
          const result = await uploadFile(file, {
            maxSizeMB: locationContext === 'visitorGallery' ? 5 : 100,
            allowedTypes: locationContext === 'visitorGallery'
              ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
              : ADMIN_ALLOWED_TYPES,
            folder: locationContext === 'visitorGallery' ? 'visitor-gallery' : 'file-explorer',
            generateUniqueName: locationContext === 'visitorGallery',
            onProgress: (progress) => {
              setUploadProgress((prev) => {
                const existing = prev.findIndex((p) => p.fileName === progress.fileName);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = progress;
                  return updated;
                }
                return [...prev, progress];
              });
            },
          });
          if (result.url && !result.error) {
            dataUrl = result.url;
            if (locationContext === 'visitorGallery') {
              addDoc(collection(db, 'os-gallery'), {
                url: result.url,
                name: file.name,
                thumbnailUrl,
                storagePath: getFilePathFromUrl(result.url) ?? `visitor-gallery/${file.name}`,
                status: 'pending',
                uploadedAt: serverTimestamp(),
              }).catch(() => {});
            }
          } else {
            uploadError = result.error;
          }
        } catch (err) {
          console.error('Upload exception:', err);
          uploadError = err instanceof Error ? err.message : 'Upload failed';
        }
      }

      // Fallback to base64 only for media types where inline preview is viable.
      // Documents (PDFs etc.) cannot reasonably embed as base64 in Firestore.
      if (!dataUrl && (fileType === 'image' || fileType === 'video' || fileType === 'audio')) {
        const reader = new FileReader();
        reader.onload = (event) => createFileItem(event.target?.result as string);
        reader.readAsDataURL(file);
        continue;
      }

      // If a non-media file failed to upload, surface the error and skip the
      // file rather than storing broken metadata with an empty dataUrl.
      if (!dataUrl && fileType === 'file') {
        addNotification({
          type: 'error',
          title: 'Upload failed',
          message: uploadError
            ? `${file.name}: ${uploadError}`
            : `${file.name} could not be uploaded.`,
          duration: 5000,
        });
        continue;
      }

      createFileItem(dataUrl);

      function createFileItem(urlOrContent: string) {
        fileStore.addFile({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: fileType,
          parentId: currentFolderId,
          path: `${pathString}/${file.name}`,
          size: file.size,
          mimeType: file.type,
          dataUrl: urlOrContent,
          thumbnailUrl,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isVisitorOwned: !isAdmin,
        });
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------------------------------------------------------------------------
  // Navigation / selection
  // ---------------------------------------------------------------------------

  const handleFolderDouble = (file: FileItem) => {
    if (file.type === 'folder') fileStore.navigateToFolder(file.id);
  };

  const handleFileClick = (file: FileItem, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      fileStore.selectedFileIds.includes(file.id)
        ? fileStore.removeFromSelection(file.id)
        : fileStore.addToSelection(file.id);
    } else if (e.shiftKey && fileStore.lastSelectedFileId) {
      fileStore.selectRange(fileStore.lastSelectedFileId, file.id);
    } else {
      fileStore.setSelectedFiles([file.id]);
    }
  };

  const handleFileDoubleClick = (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.type === 'folder') { handleFolderDouble(file); return; }
    openFileWithApp(file, openWindow);
  };

  // ---------------------------------------------------------------------------
  // Drag and drop
  // ---------------------------------------------------------------------------

  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    if (!fileStore.selectedFileIds.includes(file.id)) fileStore.setSelectedFiles([file.id]);
    setIsDraggingInternal(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-fileexplorer-file', JSON.stringify(fileStore.selectedFileIds));
  };

  const handleDragOver = (e: React.DragEvent, targetFile?: FileItem) => {
    e.preventDefault();
    const isInternalDrag = e.dataTransfer.types.includes('application/x-fileexplorer-file');
    if (isInternalDrag) {
      if (targetFile?.type === 'folder') { setDropTargetId(targetFile.id); e.dataTransfer.dropEffect = 'move'; }
      else if (!targetFile) { setDropTargetId('__current__'); e.dataTransfer.dropEffect = 'move'; }
    } else {
      if (!permissions.canUpload) {
        e.dataTransfer.dropEffect = 'none';
        setDropTargetId(null);
        return;
      }
      if (targetFile?.type === 'folder') setDropTargetId(targetFile.id);
      else if (!targetFile) setDropTargetId('__current__');
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = () => setDropTargetId(null);

  const handleDrop = (e: React.DragEvent, targetFile?: FileItem) => {
    e.preventDefault();
    const isInternalDrag = e.dataTransfer.types.includes('application/x-fileexplorer-file');
    if (isInternalDrag) {
      const fileIds = JSON.parse(e.dataTransfer.getData('application/x-fileexplorer-file'));
      const targetFolderId = targetFile?.type === 'folder'
        ? targetFile.id
        : fileStore.currentPath[fileStore.currentPath.length - 1] || null;
      fileStore.moveFiles(fileIds, targetFolderId);
    } else if (e.dataTransfer.files) {
      handleExternalFileDrop(e.dataTransfer.files, targetFile);
    }
    setIsDraggingInternal(false);
    setDropTargetId(null);
  };

  const handleExternalFileDrop = async (files: FileList, targetFile?: FileItem) => {
    const currentFolderId = targetFile?.type === 'folder'
      ? targetFile.id
      : fileStore.currentPath[fileStore.currentPath.length - 1] || null;
    const fileArray = Array.from(files);
    setUploadProgress([]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (locationContext === 'visitorGallery' && !isAllowedVisitorImage(file)) {
        addNotification({
          type: 'warning',
          title: 'Drop skipped',
          message: 'Visitor Gallery accepts JPG, PNG, WebP, and GIF images only.',
          duration: 4000,
        });
        continue;
      }

      const fileType = file.type.startsWith('image/') ? 'image'
        : file.type.startsWith('video/') ? 'video'
        : file.type.startsWith('audio/') ? 'audio'
        : 'file';
      let dataUrl = '';
      let uploadError: string | undefined;
      const thumbnailUrl = await createImageThumbnail(file);

      // Every dropped file goes through Firebase Storage. See handleUpload
      // for the matching fix.
      {
        try {
          const result = await uploadFile(file, {
            maxSizeMB: locationContext === 'visitorGallery' ? 5 : 100,
            allowedTypes: locationContext === 'visitorGallery'
              ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
              : ADMIN_ALLOWED_TYPES,
            folder: locationContext === 'visitorGallery' ? 'visitor-gallery' : 'file-explorer',
            generateUniqueName: locationContext === 'visitorGallery',
            onProgress: (progress) => {
              setUploadProgress((prev) => {
                const existing = prev.findIndex((p) => p.fileName === progress.fileName);
                if (existing >= 0) { const u = [...prev]; u[existing] = progress; return u; }
                return [...prev, progress];
              });
            },
          });
          if (result.url && !result.error) {
            dataUrl = result.url;
            if (locationContext === 'visitorGallery') {
              addDoc(collection(db, 'os-gallery'), {
                url: result.url,
                name: file.name,
                thumbnailUrl,
                storagePath: getFilePathFromUrl(result.url) ?? `visitor-gallery/${file.name}`,
                status: 'pending',
                uploadedAt: serverTimestamp(),
              }).catch(() => {});
            }
          } else {
            uploadError = result.error;
          }
        } catch (err) {
          console.error('Upload exception:', err);
          uploadError = err instanceof Error ? err.message : 'Upload failed';
        }
      }

      if (!dataUrl && (fileType === 'image' || fileType === 'video' || fileType === 'audio')) {
        const reader = new FileReader();
        reader.onload = (event) => createFile(event.target?.result as string);
        reader.readAsDataURL(file);
        continue;
      }

      if (!dataUrl && fileType === 'file') {
        addNotification({
          type: 'error',
          title: 'Upload failed',
          message: uploadError
            ? `${file.name}: ${uploadError}`
            : `${file.name} could not be uploaded.`,
          duration: 5000,
        });
        continue;
      }

      createFile(dataUrl);

      function createFile(urlOrContent: string) {
        fileStore.addFile({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: fileType,
          parentId: currentFolderId,
          path: `${pathString}/${file.name}`,
          size: file.size,
          mimeType: file.type,
          dataUrl: urlOrContent,
          thumbnailUrl,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isVisitorOwned: !isAdmin,
        });
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Rename
  // ---------------------------------------------------------------------------

  const startRename = (fileId: string) => {
    const file = fileStore.getFileById(fileId);
    if (file && fileIsWritable(file, isAdmin)) {
      setRenamingFileId(fileId);
      setRenameValue(file.name);
    }
  };

  const finishRename = () => {
    if (renamingFileId && renameValue.trim()) fileStore.renameFile(renamingFileId, renameValue.trim());
    setRenamingFileId(null);
    setRenameValue('');
  };

  const cancelRename = () => { setRenamingFileId(null); setRenameValue(''); };

  // ---------------------------------------------------------------------------
  // Context menu
  // ---------------------------------------------------------------------------

  const handleContextMenu = (e: React.MouseEvent, file?: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (file && !fileStore.selectedFileIds.includes(file.id)) fileStore.setSelectedFiles([file.id]);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const getContextMenuItems = (): ContextMenuItem[] => {
    const selectedCount = fileStore.selectedFileIds.length;
    const hasClipboard = fileStore.clipboard.fileIds.length > 0;
    const selectedFiles = fileStore.selectedFileIds.map((id) => fileStore.getFileById(id)).filter(Boolean) as FileItem[];
    const allWritable = selectedFiles.every((f) => fileIsWritable(f, isAdmin));

    const items: ContextMenuItemDef[] = [];

    if (selectedCount > 0 && permissions.canMove) {
      items.push(
        { id: 'cut', label: 'Cut', icon: Icons.Scissors, action: () => fileStore.cutFiles(fileStore.selectedFileIds), shortcut: 'Ctrl+X', group: 'clipboard' },
        { id: 'copy', label: 'Copy', icon: Icons.Copy, action: () => fileStore.copyFiles(fileStore.selectedFileIds), shortcut: 'Ctrl+C', group: 'clipboard' },
      );
    }

    if (hasClipboard) {
      items.push({
        id: 'paste',
        label: 'Paste',
        icon: Icons.Clipboard,
        action: () => {
          const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;
          fileStore.pasteFiles(currentFolderId);
        },
        shortcut: 'Ctrl+V',
        group: 'clipboard',
      });
    }

    if (selectedCount === 1 && permissions.canRename && allWritable) {
      items.push(
        { id: 'rename', label: 'Rename', icon: Icons.Edit, action: () => startRename(fileStore.selectedFileIds[0]), shortcut: 'F2', group: 'organize' },
      );
    }

    if (selectedCount > 0) {
      items.push({
        id: 'duplicate',
        label: 'Duplicate',
        icon: Icons.CopyPlus,
        action: () => fileStore.duplicateFiles(fileStore.selectedFileIds),
        group: 'organize',
        disabled: !permissions.canCreateFolder && !permissions.canCreateFile,
      });
    }

    if (selectedCount > 0 && inTrash) {
      items.push({
        id: 'restore',
        label: selectedCount === 1 ? 'Restore' : `Restore ${selectedCount} items`,
        icon: Icons.Undo2,
        action: handleRestoreSelection,
        group: 'organize',
      });
    }

    if (selectedCount > 0 && permissions.canDelete && allWritable) {
      items.push({
        id: 'delete',
        label: inTrash ? 'Delete permanently' : 'Move to Trash',
        icon: Icons.Trash2,
        danger: true,
        action: handleDeleteMultiple,
        shortcut: 'Del',
        group: 'danger',
      });
    }

    if (selectedCount === 0) {
      if (permissions.canCreateFolder) {
        items.push({ id: 'new-folder', label: 'New Folder', icon: Icons.FolderPlus, action: () => setShowNewDialog('folder'), group: 'primary' });
      }
      if (permissions.canCreateFile) {
        items.push({ id: 'new-file', label: 'New File', icon: Icons.FilePlus, action: () => setShowNewDialog('file'), group: 'primary' });
      }
      items.push({
        id: 'select-all',
        label: 'Select All',
        icon: Icons.CheckSquare,
        action: () => {
          fileStore.selectAll(currentFolderId);
        },
        shortcut: 'Ctrl+A',
        group: 'system',
      });
      if (inTrash && permissions.canDelete) {
        const hasItems = fileStore.files.some((f) => f.parentId === TRASH_FOLDER_ID);
        items.push({
          id: 'empty-trash',
          label: 'Empty Trash',
          icon: Icons.Trash2,
          danger: true,
          disabled: !hasItems,
          action: handleEmptyTrash,
          group: 'danger',
        });
      }
    }

    return toContextMenuItems(items, menuPermissions);
  };

  const menuPermissions: ContextPermission[] = [
    'visitor',
    ...(isAdmin ? (['admin', 'owner'] as ContextPermission[]) : []),
  ];

  const inTrash = currentFolderId === TRASH_FOLDER_ID
    || fileStore.currentPath.includes(TRASH_FOLDER_ID);

  const handleDeleteMultiple = () => {
    const ids = fileStore.selectedFileIds;
    if (ids.length === 0) return;
    if (inTrash) {
      if (!globalThis.window.confirm(`Permanently delete ${ids.length} item${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
      ids.forEach((id) => fileStore.removeFile(id));
    } else {
      fileStore.moveToTrash(ids);
    }
    fileStore.clearSelection();
  };

  const handleRestoreSelection = () => {
    if (fileStore.selectedFileIds.length === 0) return;
    fileStore.restoreFromTrash(fileStore.selectedFileIds);
  };

  const handleEmptyTrash = () => {
    const trashCount = fileStore.files.filter((f) => f.parentId === TRASH_FOLDER_ID).length;
    if (trashCount === 0) return;
    if (!globalThis.window.confirm(`Empty Trash? ${trashCount} item${trashCount === 1 ? '' : 's'} will be permanently deleted.`)) return;
    fileStore.emptyTrash();
  };

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (renamingFileId) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        if (fileStore.selectedFileIds.length > 0) fileStore.copyFiles(fileStore.selectedFileIds);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        if (fileStore.selectedFileIds.length > 0) fileStore.cutFiles(fileStore.selectedFileIds);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;
        fileStore.pasteFiles(currentFolderId);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;
        fileStore.selectAll(currentFolderId);
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (fileStore.selectedFileIds.length === 1) startRename(fileStore.selectedFileIds[0]);
      } else if (e.key === 'Delete') {
        e.preventDefault();
        if (fileStore.selectedFileIds.length > 0 && permissions.canDelete) handleDeleteMultiple();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        fileStore.clearSelection();
        setContextMenu(null);
        setRenamingFileId(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fileStore.selectedFileIds, renamingFileId, permissions]);

  useEffect(() => {
    if (!showSortMenu) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (!sortMenuRef.current?.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [showSortMenu]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AppShell className="bg-background-chrome border-b border-os-line-dark">
      {/* Navigation Bar */}
      <div className="border-b border-os-line-dark p-3 flex items-center gap-2 flex-wrap">
        <button onClick={() => fileStore.navigateUp()} className="p-1.5 hover:bg-os-ink-800 rounded text-white transition-colors" title="Back">
          <Icons.ChevronLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-os-ink-800 rounded text-white transition-colors" title="Forward">
          <Icons.ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => window.location.reload()} className="p-1.5 hover:bg-os-ink-800 rounded text-white transition-colors" title="Refresh">
          <Icons.RefreshCw className="w-4 h-4" />
        </button>

        {/* Breadcrumb */}
        <div className="flex-1 bg-os-ink-800 px-3 py-1.5 rounded border border-os-line-dark text-sm text-white flex items-center gap-1 overflow-x-auto">
          <button onClick={() => fileStore.navigateTo([])} className="hover:text-fg-brand transition-colors flex items-center gap-1 whitespace-nowrap">
            <Icons.Home className="w-3.5 h-3.5" />
            Home
          </button>
          {fileStore.currentPath.map((folderId, index) => {
            const folder = fileStore.getFileById(folderId);
            if (!folder) return null;
            return (
              <div key={folderId} className="flex items-center gap-1">
                <Icons.ChevronRight className="w-3.5 h-3.5 text-white/20" />
                <button
                  onClick={() => fileStore.navigateTo(fileStore.currentPath.slice(0, index + 1))}
                  className="hover:text-fg-brand transition-colors whitespace-nowrap"
                >
                  {folder.name}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1">
          {permissions.canCreateFolder && (
            <button onClick={() => setShowNewDialog('folder')} className="p-1.5 hover:bg-os-ink-800 rounded text-white transition-colors" title="New Folder">
              <Icons.FolderPlus className="w-4 h-4" />
            </button>
          )}
          {permissions.canCreateFile && (
            <button onClick={() => setShowNewDialog('file')} className="p-1.5 hover:bg-os-ink-800 rounded text-white transition-colors" title="New File">
              <Icons.FilePlus className="w-4 h-4" />
            </button>
          )}
          {permissions.canUpload && (
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-os-ink-800 rounded text-white transition-colors" title="Upload">
              <Icons.Upload className="w-4 h-4" />
            </button>
          )}
          <input ref={fileInputRef} type="file" multiple accept={permissions.allowedUploadTypes} onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-os-line-dark p-2 flex items-center gap-2">
        {/* View Mode */}
        <div className="flex items-center gap-1 bg-os-ink-900 rounded-lg p-1 border border-os-line-dark">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-white/40 hover:bg-os-ink-800 hover:text-white'}`}
          >
            <Icons.Grid3x3 className="w-3 h-3" /> Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-white/40 hover:bg-os-ink-800 hover:text-white'}`}
          >
            <Icons.List className="w-3 h-3" /> List
          </button>
        </div>

        <div className="h-6 w-px bg-os-line-dark mx-1" />

        {/* Sort */}
        <div ref={sortMenuRef} className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowSortMenu((value) => !value)}
            className={cn(
              'min-w-[142px] w-fit rounded-lg border border-os-line-dark bg-os-ink-900',
              'pl-3 pr-2 py-1.5 text-xs text-white/70 transition-all',
              'flex items-center justify-between gap-3 hover:bg-os-ink-800 hover:text-white',
              showSortMenu && 'border-stroke-brand bg-os-ink-800 text-white'
            )}
          >
            <span className="flex items-center gap-2 min-w-0">
              <Icons.ArrowUpDown className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span className="truncate">{sortOptions.find((option) => option.value === sortBy)?.label}</span>
            </span>
            <Icons.ChevronDown className={cn('w-3.5 h-3.5 text-white/35 shrink-0 transition-transform', showSortMenu && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-[calc(100%+6px)] z-[10002] min-w-[172px] w-max rounded-xl border border-os-line-dark bg-background-chrome shadow-os-window p-1.5"
              >
                {sortOptions.map((option) => {
                  const Icon = Icons[option.icon] as ComponentType<{ className?: string }>;
                  const isSelected = sortBy === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left text-xs transition-colors',
                        'grid grid-cols-[18px_1fr_16px] items-center gap-2.5',
                        isSelected
                          ? 'bg-brand-600/20 text-white'
                          : 'text-white/55 hover:bg-os-ink-800 hover:text-white/85'
                      )}
                    >
                      <Icon className={cn('w-3.5 h-3.5', isSelected ? 'text-fg-brand' : 'text-white/35')} />
                      <span className="whitespace-nowrap pr-2">{option.label}</span>
                      {isSelected && <Icons.Check className="w-3.5 h-3.5 text-fg-brand" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 hover:bg-os-ink-800 rounded text-white transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? <Icons.ArrowUp className="w-3.5 h-3.5" /> : <Icons.ArrowDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {viewMode === 'grid' && (
          <>
            <div className="h-6 w-px bg-os-line-dark mx-1" />
            <div className="flex items-center gap-1 bg-os-ink-900 rounded-lg p-1 border border-os-line-dark">
              {(['small', 'medium', 'large'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setIconSize(s)}
                  className={`px-2 py-1 text-xs rounded transition-all ${iconSize === s ? 'bg-brand-600 text-white' : 'text-white/40 hover:bg-os-ink-800 hover:text-white'}`}
                >
                  {s[0].toUpperCase()}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex-1" />

        {/* Visitor Gallery badge */}
        {locationContext === 'visitorGallery' && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-os-ink-900 border border-os-line-dark rounded text-[11px] text-white/50">
            <Icons.Users className="w-3 h-3" />
            Images only
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 pr-3 py-1 text-xs bg-os-ink-800 text-white rounded border border-os-line-dark focus:outline-none focus:border-stroke-brand w-48"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              <Icons.X className="w-3 h-3" />
            </button>
          )}
        </div>

        <span className="text-xs text-white/40">
          {displayFiles.length} {displayFiles.length === 1 ? 'item' : 'items'}
          {fileStore.selectedFileIds.length > 0 && ` (${fileStore.selectedFileIds.length} selected)`}
        </span>
      </div>

      {/* Main area: sidebar + content */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">

        {/* Sidebar */}
        <div className="w-[188px] flex-shrink-0 rounded-xl overflow-hidden border border-os-line-dark">
          <div className="flex-1 h-full w-full bg-os-ink-950/70 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto flex flex-col">
              <SystemRowGroup context="chrome" className="pt-3">Locations</SystemRowGroup>
              {SIDEBAR_LOCATIONS.map((loc) => {
                const Icon = loc.icon;
                const isActive = isLocationActive(loc);
                return (
                  <div key={loc.id} className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="explorer-sidebar-active"
                        className="absolute left-0 top-1 bottom-1 w-[3px] bg-brand-400 rounded-r-full z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <SystemRow
                      icon={<Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-fg-brand" : "text-white/40")} />}
                      label={loc.label}
                      context="chrome"
                      selected={isActive}
                      accentRail={false}
                      className={cn(
                        "transition-all duration-200",
                        isActive ? "bg-os-ink-800 text-white" : "hover:bg-os-ink-800/60 text-white/60"
                      )}
                      onClick={() => navigateToLocation(loc.folderId ?? null)}
                    />
                  </div>
                );
              })}
              <SystemRowDivider context="chrome" className="mt-2" />
              <SystemRowGroup context="chrome">Info</SystemRowGroup>
              <div className="px-3 py-2">
                <p className="text-[11px] text-white/25 leading-relaxed">
                  {locationContext === 'visitorGallery'
                    ? 'Visitor Gallery: folders and images only.'
                    : locationContext === 'system'
                      ? isAdmin ? 'System folder: full access.' : 'System folder: read-only.'
                      : 'Open location for full access.'}
                </p>
              </div>
            </div>

            {/* SideNav Footer Card */}
            <div className="p-2 mt-auto">
              <div className="group/footer relative overflow-hidden rounded-xl border border-os-line-dark bg-os-ink-950/78 p-2.5 shadow-os-card">
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -top-2 h-7 w-full text-fg-brand/50"
                  viewBox="0 0 188 32"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M-38 16 C-18 7, 2 25, 22 16 S62 7, 82 16 S122 25, 142 16 S182 7, 222 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    animate={{ x: [0, 40, 0], opacity: [0.32, 0.72, 0.32] }}
                    transition={{ x: { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
                  />
                  <path
                    d="M-24 21 C-4 13, 16 28, 36 20 S76 13, 96 20 S136 28, 156 20 S196 13, 216 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    opacity="0.24"
                  />
                </svg>
                <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent" />

                <div className="relative pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Icons.Activity className="h-3.5 w-3.5 text-fg-brand" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">System Status</p>
                    </div>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-35" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-[11px] font-semibold leading-none text-white/85">Latest Update</p>
                    <p className="mt-1 text-[10px] font-medium leading-4 text-white/45">Visual Design v2.4</p>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <div className="rounded-md border border-os-line-dark bg-os-ink-900/70 px-2 py-1">
                      <p className="text-[9px] uppercase tracking-[0.08em] text-white/25">Mode</p>
                      <p className="mt-0.5 text-[10px] font-medium text-white/65">Archive</p>
                    </div>
                    <div className="rounded-md border border-os-line-dark bg-os-ink-900/70 px-2 py-1">
                      <p className="text-[9px] uppercase tracking-[0.08em] text-white/25">State</p>
                      <p className="mt-0.5 text-[10px] font-medium text-white/65">Live</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content area (+ Projects case-study side panel as a sibling column) */}
        <div className="flex-1 flex min-h-0">
        <div
          className="flex-1 min-w-0 overflow-y-auto bg-transparent rounded-xl relative group/content"
          onContextMenu={(e) => handleContextMenu(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDrop={(e) => handleDrop(e)}
          onDragLeave={handleDragLeave}
        >
          <AnimatePresence>
            {dropTargetId === '__current__' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.12 }}
                className="pointer-events-none absolute inset-3 z-20 rounded-2xl border border-dashed border-brand-400/70 bg-brand-600/10 shadow-[inset_0_0_0_1px_var(--os-line-dark)] flex items-center justify-center"
              >
                <div className="rounded-xl border border-os-line-dark bg-background-chrome/95 px-4 py-3 text-center shadow-os-card">
                  <Icons.UploadCloud className="mx-auto mb-2 h-5 w-5 text-fg-brand" />
                  <p className="text-sm font-medium text-white/85">
                    Drop into {locationContext === 'visitorGallery' ? 'Visitor Gallery' : pathString || 'this folder'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/40">
                    {locationContext === 'visitorGallery' ? 'Images only' : 'Files will be added here'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {displayFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40">
              <Icons.FolderOpen className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-white/50">
                {searchQuery ? 'No files match your search' : 'This folder is empty'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div
              className={cn(
                '@container',
                'grid auto-rows-min items-start content-start gap-5 p-6 overflow-y-auto',
                // Responsive column tracks driven by FileExplorer window width
                // (not viewport) via container queries + auto-fill.
                'grid-cols-[repeat(auto-fill,minmax(160px,1fr))]',
                '@[420px]:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]',
                '@[720px]:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]',
                '@[1080px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]',
              )}
            >
              {displayFiles.map((file) => {
                const isSelected = fileStore.selectedFileIds.includes(file.id);
                const isCut = fileStore.clipboard.operation === 'cut' && fileStore.clipboard.fileIds.includes(file.id);
                const isDropTarget = dropTargetId === file.id;
                const childCount = file.type === 'folder' ? childCountByFolderId.get(file.id) ?? 0 : 0;
                const thumbnailSrc = file.thumbnailUrl || file.previewUrl || file.dataUrl;
                const isImage = file.type === 'image' && Boolean(thumbnailSrc);
                const isRenaming = renamingFileId === file.id;

                // Subtitle: short type/size summary shown over the hero.
                const subtitle = file.type === 'folder'
                  ? `Folder · ${childCount} item${childCount === 1 ? '' : 's'}`
                  : `${(file.name.split('.').pop() || file.type).toUpperCase()}${file.size ? ` · ${formatFileSize(file.size)}` : ''}`;

                // Stats row inside the detail panel.
                const stats: SplitCardStat[] = file.type === 'folder'
                  ? [
                      { label: 'Items', value: String(childCount) },
                      { label: 'Modified', value: formatRelativeDate(file.modifiedAt) },
                      { label: 'Type', value: 'Folder' },
                    ]
                  : [
                      { label: 'Size', value: file.size ? formatFileSize(file.size) : '—' },
                      { label: 'Modified', value: formatRelativeDate(file.modifiedAt) },
                      { label: 'Type', value: (file.name.split('.').pop() || file.type).toUpperCase() },
                    ];

                const description = file.type === 'folder'
                  ? `Located in ${file.path || 'this filesystem'}.`
                  : file.mimeType
                    ? `${file.mimeType} · added ${formatRelativeDate(file.createdAt)}.`
                    : `Added ${formatRelativeDate(file.createdAt)}.`;

                const handleOpen = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (file.type === 'folder') {
                    fileStore.navigateToFolder(file.id);
                  } else {
                    openFileWithApp(file, openWindow);
                  }
                };

                return (
                  <div
                    key={file.id}
                    className={cn(
                      'min-w-0',
                      isCut && 'opacity-50',
                      isDropTarget && 'ring-2 ring-brand-600/60 rounded-2xl',
                    )}
                  >
                    <SplitCard
                      selected={isSelected}
                      expanded={isProjectsView ? false : isSelected}
                      onClick={(e) => handleFileClick(file, e)}
                      onDoubleClick={(e) => handleFileDoubleClick(file, e)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, file)}
                      onDragOver={(e) => handleDragOver(e, file)}
                      onDrop={(e) => handleDrop(e, file)}
                      media={
                        isImage ? (
                          <img
                            src={thumbnailSrc}
                            alt={file.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover/hero:scale-[1.04] transition-transform duration-500"
                          />
                        ) : (
                          <Icon3D
                            type={resolveIcon3DType(file)}
                            size={120}
                            animate={isSelected}
                            className="transition-transform duration-500 group-hover/hero:scale-[1.06]"
                          />
                        )
                      }
                      title={
                        isRenaming ? (
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={finishRename}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') finishRename();
                              if (e.key === 'Escape') cancelRename();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="w-full bg-black/50 text-white border border-stroke-brand rounded px-1.5 py-0.5 text-[13px] font-semibold focus:outline-none"
                          />
                        ) : (
                          file.name
                        )
                      }
                      subtitle={!isRenaming ? subtitle : undefined}
                      action={
                        !isRenaming && (
                          <button
                            type="button"
                            onClick={handleOpen}
                            className="px-3 py-1.5 text-[11px] font-medium text-white bg-black/55 hover:bg-black/75 backdrop-blur-sm rounded-full border border-white/15 transition-colors"
                          >
                            {file.type === 'folder' ? 'Open' : 'View'}
                          </button>
                        )
                      }
                      stats={stats}
                      description={description}
                      detailActions={
                        <>
                          <button
                            type="button"
                            onClick={handleOpen}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-os-line-dark bg-os-ink-800 text-white/80 hover:bg-os-ink-700 hover:text-white transition-colors"
                          >
                            {file.type === 'folder' ? 'Open folder' : 'Open'}
                          </button>
                          {thumbnailSrc && file.type !== 'folder' && (
                            <a
                              href={thumbnailSrc}
                              download={file.name}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-os-line-dark bg-os-ink-800 text-white/80 hover:bg-os-ink-700 hover:text-white transition-colors"
                            >
                              Download
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(file.id);
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-os-line-dark bg-os-ink-800 text-white/80 hover:bg-os-ink-700 hover:text-white transition-colors"
                          >
                            Rename
                          </button>
                        </>
                      }
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col">
              {/* List header */}
              <div className="grid grid-cols-[40px_1fr_120px_100px_140px] gap-4 px-3 py-2 bg-os-ink-950/90 border-b border-os-line-dark text-xs font-semibold text-white/40 sticky top-0">
                <div />
                <div className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setSortBy('name')}>
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setSortBy('size')}>
                  Size {sortBy === 'size' && (sortOrder === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setSortBy('type')}>
                  Type {sortBy === 'type' && (sortOrder === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setSortBy('date')}>
                  Date Modified {sortBy === 'date' && (sortOrder === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                </div>
              </div>

              {displayFiles.map((file) => {
                const FileIcon = getFileIconComponent(file);
                const fileColor = getFileColorClass(file);
                const isSelected = fileStore.selectedFileIds.includes(file.id);
                const isCut = fileStore.clipboard.operation === 'cut' && fileStore.clipboard.fileIds.includes(file.id);
                const isDropTarget = dropTargetId === file.id;

                return (
                  <motion.button
                    key={file.id}
                    onClick={(e) => handleFileClick(file, e)}
                    onDoubleClick={(e) => handleFileDoubleClick(file, e)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, file)}
                    onDragOver={(e) => handleDragOver(e, file)}
                    onDrop={(e) => handleDrop(e, file)}
                    className={`grid grid-cols-[40px_1fr_120px_100px_140px] gap-4 py-2 text-left border-b border-os-line-dark transition-all ${
                      isSelected
                        ? 'bg-brand-600/25 pl-2 border-l-2 border-l-brand-400 pr-3'
                        : 'px-3 hover:bg-os-ink-900'
                    } ${isCut ? 'opacity-50' : ''} ${isDropTarget ? 'ring-2 ring-brand-600 bg-brand-600/30' : ''}`}
                  >
                    <div className="flex items-center justify-center">
                      {file.type === 'image' && (file.thumbnailUrl || file.previewUrl || file.dataUrl)
                        ? (
                          <MediaSurface className="w-6 h-6 rounded">
                            <img
                              src={file.thumbnailUrl || file.previewUrl || file.dataUrl}
                              alt={file.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          </MediaSurface>
                        )
                        : <FileIcon className={`w-6 h-6 ${fileColor}`} />
                      }
                    </div>
                    <div className="flex items-center min-w-0">
                      {renamingFileId === file.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={finishRename}
                          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') cancelRename(); }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="w-full bg-os-ink-800 text-white text-sm border border-stroke-brand rounded px-2 py-1 focus:outline-none"
                        />
                      ) : (
                        <span className="text-sm text-white truncate">{file.name}</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-white/40">{file.type === 'folder' ? '—' : formatFileSize(file.size)}</div>
                    <div className="flex items-center text-sm text-white/40 capitalize">{file.type}</div>
                    <div className="flex items-center text-sm text-white/40">
                      {new Date(file.modifiedAt || file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
        {isProjectsView && (
          <ProjectCaseStudyPanel project={panelProject} isAdmin={isAdmin} />
        )}
        </div>
      </div>

      {/* Dialogs */}
      <AnimatePresence>
        {showNewDialog && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001]"
            onClick={() => setShowNewDialog(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="max-w-sm w-full mx-4">
              <div className="bg-background-chrome rounded border border-os-line-dark shadow-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">
                  {showNewDialog === 'folder' ? 'New Folder' : 'New Text File'}
                </h2>
                <input
                  type="text"
                  placeholder={showNewDialog === 'folder' ? 'Folder name' : 'File name'}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') showNewDialog === 'folder' ? handleCreateFolder() : handleCreateFile(); }}
                  autoFocus
                  className="w-full px-3 py-2 bg-os-ink-800 text-white placeholder-white/25 border border-os-line-dark rounded mb-4 focus:outline-none focus:border-stroke-brand"
                />
                {showNewDialog === 'file' && (
                  <textarea
                    placeholder="File content (optional)"
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    className="w-full px-3 py-2 bg-os-ink-800 text-white placeholder-white/25 border border-os-line-dark rounded mb-4 focus:outline-none focus:border-stroke-brand resize-none h-24"
                  />
                )}
                <div className="flex gap-3">
                  <button onClick={() => showNewDialog === 'folder' ? handleCreateFolder() : handleCreateFile()} className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-800 text-white rounded transition-all">Create</button>
                  <button onClick={() => setShowNewDialog(null)} className="flex-1 px-4 py-2 bg-os-ink-800 hover:bg-os-ink-700 text-white rounded transition-all">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001]"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="flex-1 bg-background-chrome rounded border border-os-line-dark shadow-2xl overflow-hidden flex flex-col">
                <div className="shrink-0 flex items-center justify-between p-4">
                  <h2 className="text-lg font-semibold text-white">{previewFile.name}</h2>
                  <button onClick={() => setPreviewFile(null)} className="p-1 hover:bg-os-ink-800 rounded text-white transition-colors"><Icons.X className="w-5 h-5" /></button>
                </div>
                <div className="h-px bg-os-line-dark" />
                <div className="flex-1 overflow-auto p-4">
                  {previewFile.type === 'document' && <pre className="whitespace-pre-wrap font-mono text-sm text-white/60">{previewFile.content}</pre>}
                  {previewFile.type === 'image' && previewFile.dataUrl && <img src={previewFile.dataUrl} alt={previewFile.name} className="max-w-full h-auto rounded" />}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={getContextMenuItems()}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>

      <UploadProgressToast uploads={uploadProgress} onClose={() => setUploadProgress([])} />
    </AppShell>
  );
}
