import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useFileStore } from '../../store/fileStore';
import { useDesktopStore } from '../../store/desktopStore';
import { FileItem } from '../../types';
import { ContextMenu, ContextMenuItem } from '../ContextMenu';
import { useNotificationStore } from '../../store/notificationStore';
import { uploadFileWithFallback, UploadProgress as UploadProgressType } from '../../lib/uploadUtils';
import { UploadProgressToast } from '../UploadProgress';
import { getFileIcon, getFileColor, formatFileSize, getViewerType } from '../../lib/fileUtils';

export function FileExplorer() {
  const fileStore = useFileStore();
  const { openWindow } = useDesktopStore();
  const { addNotification } = useNotificationStore();
  const [showNewDialog, setShowNewDialog] = useState<'folder' | 'file' | null>(null);
  const [newName, setNewName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType[]>([]);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New view options
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [searchQuery, setSearchQuery] = useState('');

  const currentFiles = fileStore.getCurrentFolderFiles();
  const pathString = fileStore.getPathString();

  const getFileIconComponent = (file: FileItem) => {
    return getFileIcon(file.name, file.type, file.mimeType);
  };

  const getFileColorClass = (file: FileItem) => {
    return getFileColor(file.name, file.type, file.mimeType);
  };

  // Filter and sort files
  const displayFiles = useMemo(() => {
    let files = [...currentFiles];

    // Filter by search query
    if (searchQuery.trim()) {
      files = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort files
    files.sort((a, b) => {
      // Always put folders first
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = (a.modifiedAt || a.createdAt) - (b.modifiedAt || b.createdAt);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return files;
  }, [currentFiles, searchQuery, sortBy, sortOrder]);

  // Icon size classes
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

  const handleCreateFolder = () => {
    if (!newName.trim()) return;

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
    if (!newName.trim()) return;

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

  const processFiles = async (files: FileList | File[], targetFolderId?: string | null) => {
    const destFolderId = targetFolderId !== undefined
      ? targetFolderId
      : (fileStore.currentPath[fileStore.currentPath.length - 1] || null);

    const fileArray = Array.from(files);
    setUploadProgress([]);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'file';

      try {
        const result = await uploadFileWithFallback(file, {
          maxSizeMB: 100,
          allowedTypes: ['image/*', 'video/*', 'application/pdf', 'text/*'],
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

        if (result.url) {
          fileStore.addFile({
            id: `file-${Date.now()}-${i}`,
            name: file.name,
            type: fileType,
            parentId: destFolderId,
            path: `${pathString}/${file.name}`,
            size: file.size,
            mimeType: file.type,
            dataUrl: result.url,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
          });
          successCount++;
        } else {
          errorCount++;
          console.error('File processing failed:', result.error);
        }
      } catch (err) {
        errorCount++;
        console.error('Upload exception:', err);
      }
    }

    if (successCount > 0) {
      addNotification({
        type: 'success',
        title: 'Upload Complete',
        message: `Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}.`,
      });
    }

    if (errorCount > 0) {
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: `Failed to upload ${errorCount} file${errorCount > 1 ? 's' : ''}.`,
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    await processFiles(files);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleFolderDouble = (file: FileItem) => {
    if (file.type === 'folder') {
      fileStore.navigateToFolder(file.id);
    }
  };

  // Multi-select click handlers
  const handleFileClick = (file: FileItem, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      if (fileStore.selectedFileIds.includes(file.id)) {
        fileStore.removeFromSelection(file.id);
      } else {
        fileStore.addToSelection(file.id);
      }
    } else if (e.shiftKey) {
      // Range selection
      if (fileStore.lastSelectedFileId) {
        fileStore.selectRange(fileStore.lastSelectedFileId, file.id);
      } else {
        fileStore.setSelectedFiles([file.id]);
      }
    } else {
      // Single selection
      fileStore.setSelectedFiles([file.id]);
    }
  };

  const handleFileDoubleClick = (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.type === 'folder') {
      handleFolderDouble(file);
      return;
    }

    // Get the appropriate viewer type for this file
    const viewerType = getViewerType(file.name, file.mimeType);

    // Handle text files that should open in Notepad (editable)
    if (viewerType === 'notepad' || file.name.endsWith('.txt')) {
      openWindow(
        {
          id: 'notepad',
          name: 'Notepad',
          icon: 'file-text',
          type: 'component',
          component: 'Notepad',
          defaultSize: { width: 600, height: 400 },
          description: 'Simple text editor',
        },
        {
          fileId: file.id,
          content: file.content || '',
          title: file.name,
        }
      );
      return;
    }

    // Open all other previewable files in FileViewer
    openWindow(
      {
        id: 'file-viewer',
        name: 'File Viewer',
        icon: 'file',
        type: 'component',
        component: 'FileViewer',
        defaultSize: { width: 800, height: 600 },
        description: 'Universal file viewer',
      },
      {
        file: file,
        title: file.name,
        fileId: file.id,
      }
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    if (!fileStore.selectedFileIds.includes(file.id)) {
      fileStore.setSelectedFiles([file.id]);
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-fileexplorer-file',
      JSON.stringify(fileStore.selectedFileIds));
  };

  const handleDragOver = (e: React.DragEvent, targetFile?: FileItem) => {
    e.preventDefault();

    const isInternalDrag = e.dataTransfer.types.includes('application/x-fileexplorer-file');

    if (isInternalDrag) {
      if (targetFile?.type === 'folder') {
        setDropTargetId(targetFile.id);
        e.dataTransfer.dropEffect = 'move';
      } else if (!targetFile) {
        setDropTargetId('__current__');
        e.dataTransfer.dropEffect = 'move';
      }
    } else {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFile?: FileItem) => {
    e.preventDefault();
    e.stopPropagation();

    const isInternalDrag = e.dataTransfer.types.includes('application/x-fileexplorer-file');

    if (isInternalDrag) {
      const fileIds = JSON.parse(e.dataTransfer.getData('application/x-fileexplorer-file'));
      const targetFolderId = targetFile?.type === 'folder'
        ? targetFile.id
        : fileStore.currentPath[fileStore.currentPath.length - 1] || null;

      fileStore.moveFiles(fileIds, targetFolderId);
    } else {
      // External file upload - handle via existing upload logic
      const files = e.dataTransfer.files;
      if (files) {
        handleExternalFileDrop(files, targetFile);
      }
    }
    setDropTargetId(null);
  };

  const handleExternalFileDrop = async (files: FileList, targetFile?: FileItem) => {
    const targetFolderId = targetFile?.type === 'folder'
      ? targetFile.id
      : (fileStore.currentPath[fileStore.currentPath.length - 1] || null);

    await processFiles(files, targetFolderId);
  };

  // Rename handlers
  const startRename = (fileId: string) => {
    const file = fileStore.getFileById(fileId);
    if (file) {
      setRenamingFileId(fileId);
      setRenameValue(file.name);
    }
  };

  const finishRename = () => {
    if (renamingFileId && renameValue.trim()) {
      fileStore.renameFile(renamingFileId, renameValue.trim());
    }
    setRenamingFileId(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setRenamingFileId(null);
    setRenameValue('');
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, file?: FileItem) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent desktop context menu from opening

    if (file && !fileStore.selectedFileIds.includes(file.id)) {
      fileStore.setSelectedFiles([file.id]);
    }

    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const getContextMenuItems = (): ContextMenuItem[] => {
    const selectedCount = fileStore.selectedFileIds.length;
    const hasClipboard = fileStore.clipboard.fileIds.length > 0;

    const items: ContextMenuItem[] = [];

    if (selectedCount > 0) {
      items.push(
        {
          label: 'Cut',
          icon: Icons.Scissors,
          onClick: () => fileStore.cutFiles(fileStore.selectedFileIds),
          shortcut: 'Ctrl+X'
        },
        {
          label: 'Copy',
          icon: Icons.Copy,
          onClick: () => fileStore.copyFiles(fileStore.selectedFileIds),
          shortcut: 'Ctrl+C'
        }
      );
    }

    if (hasClipboard) {
      items.push({
        label: 'Paste',
        icon: Icons.Clipboard,
        onClick: () => {
          const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;
          fileStore.pasteFiles(currentFolderId);
        },
        shortcut: 'Ctrl+V'
      });
    }

    if (selectedCount === 1) {
      items.push(
        { divider: true } as ContextMenuItem,
        {
          label: 'Rename',
          icon: Icons.Edit,
          onClick: () => startRename(fileStore.selectedFileIds[0]),
          shortcut: 'F2'
        }
      );
    }

    if (selectedCount > 0) {
      items.push(
        {
          label: 'Duplicate',
          icon: Icons.CopyPlus,
          onClick: () => fileStore.duplicateFiles(fileStore.selectedFileIds)
        },
        {
          label: 'Delete',
          icon: Icons.Trash2,
          onClick: () => handleDeleteMultiple(),
          shortcut: 'Del'
        }
      );
    }

    if (selectedCount === 0) {
      items.push(
        {
          label: 'New Folder',
          icon: Icons.FolderPlus,
          onClick: () => setShowNewDialog('folder')
        },
        {
          label: 'New File',
          icon: Icons.FilePlus,
          onClick: () => setShowNewDialog('file')
        },
        { divider: true } as ContextMenuItem,
        {
          label: 'Select All',
          icon: Icons.CheckSquare,
          onClick: () => {
            const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;
            fileStore.selectAll(currentFolderId);
          },
          shortcut: 'Ctrl+A'
        }
      );
    }

    return items;
  };

  const handleDeleteMultiple = () => {
    fileStore.selectedFileIds.forEach(fileId => {
      fileStore.removeFile(fileId);
    });
    fileStore.clearSelection();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (renamingFileId) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        if (fileStore.selectedFileIds.length > 0) {
          fileStore.copyFiles(fileStore.selectedFileIds);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        if (fileStore.selectedFileIds.length > 0) {
          fileStore.cutFiles(fileStore.selectedFileIds);
        }
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
        if (fileStore.selectedFileIds.length === 1) {
          startRename(fileStore.selectedFileIds[0]);
        }
      } else if (e.key === 'Delete') {
        e.preventDefault();
        if (fileStore.selectedFileIds.length > 0) {
          handleDeleteMultiple();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        fileStore.clearSelection();
        setContextMenu(null);
        setRenamingFileId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fileStore.selectedFileIds, renamingFileId]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl flex flex-col border-b border-white/10">
      {/* Navigation Bar */}
      <div className="border-b border-white/10 p-3 flex items-center gap-2 flex-wrap backdrop-blur-sm bg-white/5">
        <button onClick={() => fileStore.navigateUp()} className="p-1.5 hover:bg-white/10 rounded text-white transition-colors" title="Back">
          <Icons.ChevronLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-white/10 rounded text-white transition-colors" title="Forward">
          <Icons.ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => window.location.reload()}
          className="p-1.5 hover:bg-white/10 rounded text-white transition-colors"
          title="Refresh"
        >
          <Icons.RefreshCw className="w-4 h-4" />
        </button>

        {/* Breadcrumb Path */}
        <div className="flex-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-sm text-white flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => fileStore.navigateTo([])}
            className="hover:text-primary-400 hover:bg-white/10 px-2 py-0.5 rounded transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Icons.Monitor className="w-3.5 h-3.5" />
            <span className="font-medium">OS</span>
          </button>
          {fileStore.currentPath.map((folderId, index) => {
            const folder = fileStore.getFileById(folderId);
            if (!folder) return null;
            return (
              <div key={folderId} className="flex items-center gap-1">
                <Icons.ChevronRight className="w-3.5 h-3.5 text-white/30" />
                <button
                  onClick={() => fileStore.navigateTo(fileStore.currentPath.slice(0, index + 1))}
                  className="hover:text-primary-400 hover:bg-white/10 px-2 py-0.5 rounded transition-all whitespace-nowrap"
                >
                  {folder.name}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setShowNewDialog('folder')}
            className="p-1.5 hover:bg-white/10 rounded text-white transition-colors"
            title="New Folder"
          >
            <Icons.FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowNewDialog('file')}
            className="p-1.5 hover:bg-white/10 rounded text-white transition-colors"
            title="New File"
          >
            <Icons.FilePlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-white/10 rounded text-white transition-colors"
            title="Upload"
          >
            <Icons.Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-white/10 p-2 flex items-center gap-2 backdrop-blur-sm bg-white/5">
        {/* View Mode */}
        <div className="flex items-center gap-1 bg-gray-800 rounded p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            title="Grid View"
          >
            <Icons.Grid3x3 className="w-3 h-3" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            title="List View"
          >
            <Icons.List className="w-3 h-3" />
            List
          </button>
        </div>

        <div className="h-6 w-px bg-gray-600 mx-1" />

        {/* Sort Options */}
        <div className="flex items-center gap-1">
          <Icons.ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 py-1 text-xs bg-gray-800 text-white rounded border border-gray-600 focus:outline-none focus:border-primary-500"
          >
            <option value="name">Name</option>
            <option value="date">Date Modified</option>
            <option value="size">Size</option>
            <option value="type">Type</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 hover:bg-white/10 rounded text-white transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? (
              <Icons.ArrowUp className="w-3.5 h-3.5" />
            ) : (
              <Icons.ArrowDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {viewMode === 'grid' && (
          <>
            <div className="h-6 w-px bg-gray-600 mx-1" />

            {/* Icon Size */}
            <div className="flex items-center gap-1 bg-gray-800 rounded p-1">
              <button
                onClick={() => setIconSize('small')}
                className={`px-2 py-1 text-xs rounded transition-all ${iconSize === 'small' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                title="Small Icons"
              >
                S
              </button>
              <button
                onClick={() => setIconSize('medium')}
                className={`px-2 py-1 text-xs rounded transition-all ${iconSize === 'medium' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                title="Medium Icons"
              >
                M
              </button>
              <button
                onClick={() => setIconSize('large')}
                className={`px-2 py-1 text-xs rounded transition-all ${iconSize === 'large' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                title="Large Icons"
              >
                L
              </button>
            </div>
          </>
        )}

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 pr-3 py-1 text-xs bg-gray-800 text-white rounded border border-gray-600 focus:outline-none focus:border-primary-500 w-48"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Icons.X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* File Count */}
        <span className="text-xs text-gray-400">
          {displayFiles.length} {displayFiles.length === 1 ? 'item' : 'items'}
          {fileStore.selectedFileIds.length > 0 && ` (${fileStore.selectedFileIds.length} selected)`}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className="flex-1 p-4 overflow-y-auto"
          onContextMenu={(e) => handleContextMenu(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDrop={(e) => handleDrop(e)}
          onDragLeave={handleDragLeave}
        >
          {displayFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Icons.FolderOpen className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-white/50">
                {searchQuery ? 'No files match your search' : 'This folder is empty'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className={`grid ${getGridColumns()} gap-4`}>
              {displayFiles.map((file) => {
                const FileIcon = getFileIconComponent(file);
                const fileColor = getFileColorClass(file);
                const isSelected = fileStore.selectedFileIds.includes(file.id);
                const isCut = fileStore.clipboard.operation === 'cut' &&
                  fileStore.clipboard.fileIds.includes(file.id);
                const isDropTarget = dropTargetId === file.id;

                return (
                  <motion.button
                    key={file.id}
                    layout
                    onClick={(e) => handleFileClick(file, e)}
                    onDoubleClick={(e) => handleFileDoubleClick(file, e)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, file)}
                    onDragOver={(e: any) => handleDragOver(e, file)}
                    onDrop={(e: any) => handleDrop(e, file)}
                    whileHover={{ scale: 1.05 }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg backdrop-blur-sm transition-all ${isSelected
                      ? 'bg-primary-500/20 border-2 border-primary-500'
                      : 'hover:bg-white/10 border-2 border-transparent'
                      } ${isCut ? 'opacity-50' : ''} ${isDropTarget ? 'ring-2 ring-primary-500 bg-primary-500/30' : ''}`}
                  >
                    {file.type === 'image' && file.dataUrl ? (
                      <img src={file.dataUrl} alt={file.name} className={`${getIconSizeClasses()} object-cover rounded`} />
                    ) : (
                      <FileIcon className={`${getIconSizeClasses()} ${fileColor}`} />
                    )}
                    {renamingFileId === file.id ? (
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
                        className="text-xs text-center w-full bg-gray-700/70 text-white border border-primary-500 rounded px-1 focus:outline-none"
                      />
                    ) : (
                      <span
                        className="text-xs text-center line-clamp-2 text-white break-words w-full px-1"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col">
              {/* List View Header */}
              <div className="grid grid-cols-[40px_1fr_120px_100px_140px] gap-4 px-3 py-2 bg-white/5 backdrop-blur-md border-b border-white/10 text-xs font-semibold text-gray-400 sticky top-0">
                <div></div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setSortBy('name')}>
                  Name
                  {sortBy === 'name' && (sortOrder === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setSortBy('size')}>
                  Size
                  {sortBy === 'size' && (sortOrder === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setSortBy('type')}>
                  Type
                  {sortBy === 'type' && (sortOrder === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setSortBy('date')}>
                  Date Modified
                  {sortBy === 'date' && (sortOrder === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                </div>
              </div>

              {/* List View Items */}
              {displayFiles.map((file) => {
                const FileIcon = getFileIconComponent(file);
                const fileColor = getFileColorClass(file);
                const isSelected = fileStore.selectedFileIds.includes(file.id);
                const isCut = fileStore.clipboard.operation === 'cut' &&
                  fileStore.clipboard.fileIds.includes(file.id);
                const isDropTarget = dropTargetId === file.id;

                return (
                  <motion.button
                    key={file.id}
                    layout
                    onClick={(e) => handleFileClick(file, e)}
                    onDoubleClick={(e) => handleFileDoubleClick(file, e)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, file)}
                    onDragOver={(e: any) => handleDragOver(e, file)}
                    onDrop={(e: any) => handleDrop(e, file)}
                    className={`grid grid-cols-[40px_1fr_120px_100px_140px] gap-4 px-3 py-2 text-left border-b border-white/5 transition-all ${isSelected
                      ? 'bg-primary-500/20 border-primary-500'
                      : 'hover:bg-white/10'
                      } ${isCut ? 'opacity-50' : ''} ${isDropTarget ? 'ring-2 ring-primary-500 bg-primary-500/30' : ''}`}
                  >
                    <div className="flex items-center justify-center">
                      {file.type === 'image' && file.dataUrl ? (
                        <img src={file.dataUrl} alt={file.name} className="w-6 h-6 object-cover rounded" />
                      ) : (
                        <FileIcon className={`w-6 h-6 ${fileColor}`} />
                      )}
                    </div>

                    <div className="flex items-center min-w-0">
                      {renamingFileId === file.id ? (
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
                          className="w-full bg-gray-700/70 text-white text-sm border border-primary-500 rounded px-2 py-1 focus:outline-none"
                        />
                      ) : (
                        <span className="text-sm text-white truncate" title={file.name}>{file.name}</span>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      {file.type === 'folder' ? '—' : formatFileSize(file.size)}
                    </div>

                    <div className="flex items-center text-sm text-gray-400 capitalize">
                      {file.type}
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      {new Date(file.modifiedAt || file.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>


      </div>

      <AnimatePresence>
        {showNewDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[15000]"
            onClick={() => setShowNewDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-sm w-full mx-4"
            >
              {/* Top gradient accent line */}
              <div className="w-full h-1 bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500 rounded-t" />

              <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-b border border-gray-700/50 border-t-0 shadow-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">
                  {showNewDialog === 'folder' ? 'New Folder' : 'New Text File'}
                </h2>

                <input
                  type="text"
                  placeholder={showNewDialog === 'folder' ? 'Folder name' : 'File name'}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      showNewDialog === 'folder' ? handleCreateFolder() : handleCreateFile();
                    }
                  }}
                  autoFocus
                  className="w-full px-3 py-2 bg-gray-700/40 text-white placeholder-gray-400 border border-gray-600/50 rounded mb-4 focus:outline-none focus:border-primary-500"
                />

                {showNewDialog === 'file' && (
                  <textarea
                    placeholder="File content (optional)"
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/40 text-white placeholder-gray-400 border border-gray-600/50 rounded mb-4 focus:outline-none focus:border-primary-500 resize-none h-24"
                  />
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => (showNewDialog === 'folder' ? handleCreateFolder() : handleCreateFile())}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-all"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewDialog(null)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-all"
                  >
                    Cancel
                  </button>
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

      {/* Upload Progress Toast */}
      <UploadProgressToast
        uploads={uploadProgress}
        onClose={() => setUploadProgress([])}
      />
    </div>
  );
}
