import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useFileStore } from '../../store/fileStore';
import { useDesktopStore } from '../../store/desktopStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { FileItem, VISITOR_GALLERY_ID } from '../../types';
import { ContextMenu, ContextMenuItem } from '../ContextMenu';
import { SystemRow, SystemRowGroup, SystemRowDivider } from '../ui/SystemRow';
import { MediaSurface } from '../ui/surface';
import { uploadFile, UploadProgress as UploadProgressType } from '../../lib/uploadUtils';
import { UploadProgressToast } from '../UploadProgress';
import { getFileIcon, getFileColor, formatFileSize, getViewerType } from '../../lib/fileUtils';
import { getLocationContext, getPermissions, fileIsWritable } from '../../lib/filePermissions';
import { ContextMenuItemDef, sortAndSeparate } from '../../lib/contextMenuRegistry';
import { AuroraBackground } from '../aceternity/backgrounds/aurora-background';
import { cn } from '../../lib/utils';

// ---------------------------------------------------------------------------
// Sidebar location definitions
// ---------------------------------------------------------------------------

const SIDEBAR_LOCATIONS = [
  { id: 'desktop', label: 'Desktop', icon: Icons.Monitor, folderId: null as string | null },
  { id: 'folder-documents', label: 'Documents', icon: Icons.FileText, folderId: 'folder-documents' },
  { id: 'folder-downloads', label: 'Downloads', icon: Icons.Download, folderId: 'folder-downloads' },
  { id: 'folder-projects', label: 'Projects', icon: Icons.Briefcase, folderId: 'folder-projects' },
  { id: 'folder-cv', label: 'CV', icon: Icons.UserCheck, folderId: 'folder-cv' },
  { id: 'folder-images', label: 'Images', icon: Icons.Image, folderId: 'folder-images' },
  { id: VISITOR_GALLERY_ID, label: 'Visitor Gallery', icon: Icons.Users, folderId: VISITOR_GALLERY_ID },
  { id: 'folder-system', label: 'System', icon: Icons.HardDrive, folderId: 'folder-system' },
] as const;

const VISITOR_ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const isAllowedVisitorImage = (file: File) => VISITOR_ALLOWED_IMAGE_TYPES.has(file.type);

const toContextMenuItems = (defs: ContextMenuItemDef[]): ContextMenuItem[] =>
  sortAndSeparate(defs).map((item) => ({
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
  const { isAuthenticated } = useAuthStore();
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

  // ---------------------------------------------------------------------------
  // Permissions — derived from current path + auth state
  // ---------------------------------------------------------------------------

  const locationContext = useMemo(
    () => getLocationContext(fileStore.currentPath, fileStore.files),
    [fileStore.currentPath, fileStore.files],
  );

  const permissions = useMemo(
    () => getPermissions(locationContext, isAuthenticated),
    [locationContext, isAuthenticated],
  );

  const currentFiles = fileStore.getCurrentFolderFiles();
  const pathString = fileStore.getPathString();

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

  const filteredAndSortedFiles = () => {
    let files = [...currentFiles];
    if (searchQuery.trim()) {
      files = files.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
  };

  const displayFiles = filteredAndSortedFiles();

  const getIconSizeClasses = () => {
    switch (iconSize) {
      case 'small': return 'w-8 h-8';
      case 'medium': return 'w-12 h-12';
      case 'large': return 'w-16 h-16';
    }
  };

  const getGridColumns = () => {
    switch (iconSize) {
      case 'small': return 'grid-cols-6';
      case 'medium': return 'grid-cols-4';
      case 'large': return 'grid-cols-3';
    }
  };

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
          : 'file';

      let dataUrl = '';

      if (fileType === 'image' || fileType === 'video') {
        try {
          const result = await uploadFile(file, {
            maxSizeMB: 100,
            allowedTypes: locationContext === 'visitorGallery'
              ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
              : ['image/*', 'video/*'],
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
          }
        } catch (err) {
          console.error('Upload exception:', err);
        }
      }

      if (!dataUrl && (fileType === 'image' || fileType === 'video')) {
        const reader = new FileReader();
        reader.onload = (event) => createFileItem(event.target?.result as string);
        reader.readAsDataURL(file);
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
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isVisitorOwned: !isAuthenticated,
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

    const viewerType = getViewerType(file.name, file.mimeType);
    if (viewerType === 'notepad' || file.name.endsWith('.txt')) {
      openWindow(
        { id: 'notepad', name: 'Notepad', icon: 'file-text', type: 'component', component: 'Notepad', defaultSize: { width: 600, height: 400 }, description: 'Simple text editor' },
        { fileId: file.id, content: file.content || '', title: file.name },
      );
      return;
    }
    openWindow(
      { id: 'file-viewer', name: 'File Viewer', icon: 'file', type: 'component', component: 'FileViewer', defaultSize: { width: 800, height: 600 }, description: 'Universal file viewer' },
      { file, title: file.name, fileId: file.id },
    );
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

      const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
      let dataUrl = '';

      if (fileType === 'image' || fileType === 'video') {
        try {
          const result = await uploadFile(file, {
            maxSizeMB: 100,
            allowedTypes: locationContext === 'visitorGallery'
              ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
              : ['image/*', 'video/*'],
            onProgress: (progress) => {
              setUploadProgress((prev) => {
                const existing = prev.findIndex((p) => p.fileName === progress.fileName);
                if (existing >= 0) { const u = [...prev]; u[existing] = progress; return u; }
                return [...prev, progress];
              });
            },
          });
          if (result.url && !result.error) dataUrl = result.url;
        } catch (err) { console.error('Upload exception:', err); }
      }

      if (!dataUrl && (fileType === 'image' || fileType === 'video')) {
        const reader = new FileReader();
        reader.onload = (event) => createFile(event.target?.result as string);
        reader.readAsDataURL(file);
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
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isVisitorOwned: !isAuthenticated,
        });
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Rename
  // ---------------------------------------------------------------------------

  const startRename = (fileId: string) => {
    const file = fileStore.getFileById(fileId);
    if (file && fileIsWritable(file, isAuthenticated)) {
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
    const allWritable = selectedFiles.every((f) => fileIsWritable(f, isAuthenticated));

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

    if (selectedCount > 0 && permissions.canDelete && allWritable) {
      items.push({ id: 'delete', label: 'Delete', icon: Icons.Trash2, danger: true, action: handleDeleteMultiple, shortcut: 'Del', group: 'danger' });
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
          const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;
          fileStore.selectAll(currentFolderId);
        },
        shortcut: 'Ctrl+A',
        group: 'system',
      });
    }

    return toContextMenuItems(items);
  };

  const handleDeleteMultiple = () => {
    fileStore.selectedFileIds.forEach((id) => fileStore.removeFile(id));
    fileStore.clearSelection();
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full h-full bg-[#111111]/95 backdrop-blur-md flex flex-col border-b border-white/[0.08] overflow-hidden relative">
      <AuroraBackground className="absolute inset-0 opacity-[0.2] pointer-events-none" colors={['#00d9ff', '#0066ff', '#00d9ff']} />
      
      <div className="relative z-10 flex flex-col h-full w-full">
      {/* Navigation Bar */}
      <div className="border-b border-white/[0.08] p-3 flex items-center gap-2 flex-wrap">
        <button onClick={() => fileStore.navigateUp()} className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors" title="Back">
          <Icons.ChevronLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors" title="Forward">
          <Icons.ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => window.location.reload()} className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors" title="Refresh">
          <Icons.RefreshCw className="w-4 h-4" />
        </button>

        {/* Breadcrumb */}
        <div className="flex-1 bg-white/[0.06] px-3 py-1.5 rounded border border-white/[0.08] text-sm text-white flex items-center gap-1 overflow-x-auto">
          <button onClick={() => fileStore.navigateTo([])} className="hover:text-primary-400 transition-colors flex items-center gap-1 whitespace-nowrap">
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
                  className="hover:text-primary-400 transition-colors whitespace-nowrap"
                >
                  {folder.name}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1">
          {permissions.canCreateFolder && (
            <button onClick={() => setShowNewDialog('folder')} className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors" title="New Folder">
              <Icons.FolderPlus className="w-4 h-4" />
            </button>
          )}
          {permissions.canCreateFile && (
            <button onClick={() => setShowNewDialog('file')} className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors" title="New File">
              <Icons.FilePlus className="w-4 h-4" />
            </button>
          )}
          {permissions.canUpload && (
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors" title="Upload">
              <Icons.Upload className="w-4 h-4" />
            </button>
          )}
          <input ref={fileInputRef} type="file" multiple accept={permissions.allowedUploadTypes} onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-white/[0.08] p-2 flex items-center gap-2">
        {/* View Mode */}
        <div className="flex items-center gap-1 bg-white/[0.06] rounded p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Icons.Grid3x3 className="w-3 h-3" /> Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Icons.List className="w-3 h-3" /> List
          </button>
        </div>

        <div className="h-6 w-px bg-white/[0.08] mx-1" />

        {/* Sort */}
        <div className="flex items-center gap-1">
          <Icons.ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-2 py-1 text-xs bg-white/[0.06] text-white rounded border border-white/[0.08] focus:outline-none focus:border-primary-500"
          >
            <option value="name">Name</option>
            <option value="date">Date Modified</option>
            <option value="size">Size</option>
            <option value="type">Type</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 hover:bg-white/[0.08] rounded text-white transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? <Icons.ArrowUp className="w-3.5 h-3.5" /> : <Icons.ArrowDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {viewMode === 'grid' && (
          <>
            <div className="h-6 w-px bg-white/[0.08] mx-1" />
            <div className="flex items-center gap-1 bg-white/[0.06] rounded p-1">
              {(['small', 'medium', 'large'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setIconSize(s)}
                  className={`px-2 py-1 text-xs rounded transition-all ${iconSize === s ? 'bg-primary-600 text-white' : 'text-white/40 hover:text-white'}`}
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
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.06] rounded text-[11px] text-white/40">
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
            className="pl-7 pr-3 py-1 text-xs bg-white/[0.08] text-white rounded border border-white/[0.08] focus:outline-none focus:border-primary-500 w-48"
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

        {/* Sidebar Floating Container with Beam Border */}
        <div className="w-[188px] flex-shrink-0 p-[1px] bg-gradient-to-br from-[#00d9ff] via-[#0066ff] to-[#00d9ff] rounded-xl shadow-2xl overflow-hidden">
          <div className="flex-1 h-full w-full bg-black/50 rounded-[11px] flex flex-col overflow-hidden relative">
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
                        className="absolute left-0 top-1 bottom-1 w-[3px] bg-primary-400 rounded-r-full shadow-[0_0_12px_rgba(0,217,255,0.8)] z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <SystemRow
                      icon={<Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary-400" : "text-white/40")} />}
                      label={loc.label}
                      context="chrome"
                      selected={isActive}
                      accentRail={false}
                      className={cn(
                        "transition-all duration-200",
                        isActive ? "bg-white/[0.06] text-white" : "hover:bg-white/[0.04] text-white/60"
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
                      ? isAuthenticated ? 'System folder: full access.' : 'System folder: read-only.'
                      : 'Open location for full access.'}
                </p>
              </div>
            </div>

            {/* SideNav Footer Card */}
            <div className="p-2 mt-auto">
              <div className="p-[1px] bg-gradient-to-br from-[#00d9ff] via-[#0066ff] to-[#00d9ff] rounded-lg">
                <div className="bg-white px-3 py-2 rounded-[7px] flex flex-col gap-1 shadow-inner relative overflow-hidden group/footer">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00d9ff] to-transparent animate-shimmer" />
                  <div className="text-[10px] font-bold text-black/40 uppercase tracking-tight">System Status</div>
                  <div className="text-[11px] font-bold text-black flex items-center justify-between">
                    <span>Latest Update</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                  </div>
                  <div className="text-[9px] text-black/60 font-medium">Visual Design v2.4</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content area Floating Container */}
        <div
          className="flex-1 overflow-y-auto bg-transparent rounded-xl relative group/content"
          onContextMenu={(e) => handleContextMenu(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDrop={(e) => handleDrop(e)}
          onDragLeave={handleDragLeave}
        >
          {displayFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40">
              <Icons.FolderOpen className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-white/50">
                {searchQuery ? 'No files match your search' : 'This folder is empty'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="flex flex-wrap gap-10 p-10 overflow-y-auto content-start">
              {displayFiles.map((file) => {
                const FileIcon = getFileIconComponent(file);
                const fileColor = getFileColorClass(file);
                const isSelected = fileStore.selectedFileIds.includes(file.id);
                const isCut = fileStore.clipboard.operation === 'cut' && fileStore.clipboard.fileIds.includes(file.id);
                const isDropTarget = dropTargetId === file.id;
                const childCount = file.type === 'folder' ? fileStore.files.filter(f => f.parentId === file.id).length : 0;
                
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
                    whileHover={{ y: -5 }}
                    className={cn(
                      "relative flex flex-col items-center gap-4 group/file w-40",
                      isCut ? 'opacity-50' : ''
                    )}
                  >
                    {/* Item Container */}
                    <div className={cn(
                      "relative w-full aspect-[4/3] rounded-3xl transition-all duration-300 flex items-center justify-center overflow-hidden",
                      isSelected 
                        ? "bg-primary-500/20 ring-2 ring-primary-500/50 shadow-[0_0_30px_rgba(0,217,255,0.2)]" 
                        : "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15]",
                      isDropTarget && "ring-4 ring-primary-500/50 bg-primary-500/30"
                    )}>
                      {file.type === 'image' && file.dataUrl ? (
                        <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover group-hover/file:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="relative flex flex-col items-center justify-center gap-2">
                          <FileIcon className={cn(
                            "w-12 h-12 transition-all duration-300",
                            fileColor,
                            file.type === 'folder' ? "drop-shadow-[0_0_12px_rgba(0,217,255,0.3)]" : ""
                          )} />
                          {file.type === 'folder' && childCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-primary-500 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full shadow-lg border border-white/20">
                              {childCount}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Selection Glow */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary-500/10 pointer-events-none animate-pulse" />
                      )}
                    </div>

                    {/* Label Area */}
                    <div className="flex flex-col items-center gap-1 w-full overflow-hidden">
                      {renamingFileId === file.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={finishRename}
                          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') cancelRename(); }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="text-xs text-center w-full bg-white/[0.08] text-white border border-primary-500 rounded-lg px-2 py-1 focus:outline-none"
                        />
                      ) : (
                        <>
                          <span className={cn(
                            "text-sm font-semibold text-center line-clamp-1 transition-colors px-2",
                            isSelected ? "text-primary-400" : "text-white/90 group-hover/file:text-white"
                          )}>
                            {file.name}
                          </span>
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">
                            {file.type === 'folder' ? `${childCount} items` : file.type}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col">
              {/* List header */}
              <div className="grid grid-cols-[40px_1fr_120px_100px_140px] gap-4 px-3 py-2 bg-black/40 backdrop-blur-sm border-b border-white/[0.08] text-xs font-semibold text-white/40 sticky top-0">
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
                    className={`grid grid-cols-[40px_1fr_120px_100px_140px] gap-4 px-3 py-2 text-left border-b border-white/[0.04] transition-all ${
                      isSelected ? 'bg-primary-500/20 border-primary-500' : 'hover:bg-white/[0.08]'
                    } ${isCut ? 'opacity-50' : ''} ${isDropTarget ? 'ring-2 ring-primary-500 bg-primary-500/30' : ''}`}
                  >
                    <div className="flex items-center justify-center">
                      {file.type === 'image' && file.dataUrl
                        ? <MediaSurface className="w-6 h-6 rounded"><img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" /></MediaSurface>
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
                          className="w-full bg-white/[0.08] text-white text-sm border border-primary-500 rounded px-2 py-1 focus:outline-none"
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
              <div className="bg-black/80 backdrop-blur-md rounded border border-white/[0.08] shadow-2xl p-6">
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
                  className="w-full px-3 py-2 bg-white/[0.08] text-white placeholder-white/25 border border-white/[0.08] rounded mb-4 focus:outline-none focus:border-primary-500"
                />
                {showNewDialog === 'file' && (
                  <textarea
                    placeholder="File content (optional)"
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.08] text-white placeholder-white/25 border border-white/[0.08] rounded mb-4 focus:outline-none focus:border-primary-500 resize-none h-24"
                  />
                )}
                <div className="flex gap-3">
                  <button onClick={() => showNewDialog === 'folder' ? handleCreateFolder() : handleCreateFile()} className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-all">Create</button>
                  <button onClick={() => setShowNewDialog(null)} className="flex-1 px-4 py-2 bg-white/[0.08] hover:bg-white/[0.14] text-white rounded transition-all">Cancel</button>
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
              <div className="flex-1 bg-black/80 backdrop-blur-md rounded border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col">
                <div className="shrink-0 flex items-center justify-between p-4">
                  <h2 className="text-lg font-semibold text-white">{previewFile.name}</h2>
                  <button onClick={() => setPreviewFile(null)} className="p-1 hover:bg-white/[0.08] rounded text-white transition-colors"><Icons.X className="w-5 h-5" /></button>
                </div>
                <div className="h-px bg-white/[0.08]" />
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
      </div>
    </div>
  );
}
