import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useFileStore } from '../../store/fileStore';
import { useDesktopStore } from '../../store/desktopStore';
import { FileItem } from '../../types';
import { ContextMenu, ContextMenuItem } from '../ContextMenu';

export function FileExplorer() {
  const fileStore = useFileStore();
  const { openWindow } = useDesktopStore();
  const [showNewDialog, setShowNewDialog] = useState<'folder' | 'file' | null>(null);
  const [newName, setNewName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDraggingInternal, setIsDraggingInternal] = useState(false);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFiles = fileStore.getCurrentFolderFiles();
  const pathString = fileStore.getPathString();

  const getFileIcon = (file: FileItem) => {
    const iconMap: any = {
      folder: Icons.Folder,
      file: Icons.FileText,
      document: Icons.FileText,
      image: Icons.Image,
      video: Icons.Video,
    };
    return iconMap[file.type] || Icons.File;
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

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const currentFolderId = fileStore.currentPath[fileStore.currentPath.length - 1] || null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const fileType = file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
            ? 'video'
            : 'file';

        fileStore.addFile({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: fileType,
          parentId: currentFolderId,
          path: `${pathString}/${file.name}`,
          size: file.size,
          mimeType: file.type,
          dataUrl: dataUrl,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
        });
      };

      reader.readAsDataURL(file);
    }

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
    } else if (file.type === 'file' || file.mimeType === 'text/plain' || file.name.endsWith('.txt')) {
      // Open text files in Notepad
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
    } else if (file.type === 'document' || file.type === 'image') {
      setPreviewFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    if (!fileStore.selectedFileIds.includes(file.id)) {
      fileStore.setSelectedFiles([file.id]);
    }

    setIsDraggingInternal(true);
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

    setIsDraggingInternal(false);
    setDropTargetId(null);
  };

  const handleExternalFileDrop = (files: FileList, targetFile?: FileItem) => {
    const currentFolderId = targetFile?.type === 'folder'
      ? targetFile.id
      : fileStore.currentPath[fileStore.currentPath.length - 1] || null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const fileType = file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
            ? 'video'
            : 'file';

        fileStore.addFile({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: fileType,
          parentId: currentFolderId,
          path: `${pathString}/${file.name}`,
          size: file.size,
          mimeType: file.type,
          dataUrl: dataUrl,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
        });
      };

      reader.readAsDataURL(file);
    }
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="border-b border-gray-200 p-3 flex items-center gap-2 flex-wrap">
        <button onClick={() => fileStore.navigateUp()} className="p-1.5 hover:bg-gray-100 rounded" title="Back">
          <Icons.ChevronLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded" title="Forward">
          <Icons.ChevronRight className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded">
          <Icons.RefreshCw className="w-4 h-4" />
        </button>
        <div className="flex-1 bg-gray-50 px-3 py-1.5 rounded border border-gray-300 text-sm truncate">
          {pathString}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowNewDialog('folder')}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="New Folder"
          >
            <Icons.FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowNewDialog('file')}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="New File"
          >
            <Icons.FilePlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-gray-100 rounded"
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

      <div className="flex-1 flex overflow-hidden">
        <div
          className="flex-1 p-4 overflow-y-auto"
          onContextMenu={(e) => handleContextMenu(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDrop={(e) => handleDrop(e)}
          onDragLeave={handleDragLeave}
        >
          {currentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Icons.FolderOpen className="w-16 h-16 mb-4 opacity-50" />
              <p>This folder is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {currentFiles.map((file) => {
                const FileIcon = getFileIcon(file);
                const isSelected = fileStore.selectedFileIds.includes(file.id);
                const isCut = fileStore.clipboard.operation === 'cut' &&
                              fileStore.clipboard.fileIds.includes(file.id);
                const isDropTarget = dropTargetId === file.id;

                return (
                  <motion.button
                    key={file.id}
                    onClick={(e) => handleFileClick(file, e)}
                    onDoubleClick={(e) => handleFileDoubleClick(file, e)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file)}
                    onDragOver={(e) => handleDragOver(e, file)}
                    onDrop={(e) => handleDrop(e, file)}
                    whileHover={{ scale: 1.05 }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    } ${isCut ? 'opacity-50' : ''} ${isDropTarget ? 'ring-2 ring-blue-500 bg-blue-100' : ''}`}
                  >
                    {file.type === 'image' && file.dataUrl ? (
                      <img src={file.dataUrl} alt={file.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <FileIcon className={`w-12 h-12 ${
                        file.type === 'folder' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
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
                        className="text-xs text-center w-full bg-white border border-blue-500 rounded px-1"
                      />
                    ) : (
                      <span className="text-xs text-center line-clamp-2">{file.name}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {fileStore.selectedFileIds.length === 1 && (() => {
          const selectedFile = fileStore.getFileById(fileStore.selectedFileIds[0]);
          return selectedFile && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 border-l border-gray-200 p-4 bg-gray-50 overflow-y-auto"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icons.Info className="w-4 h-4" />
              Properties
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">Name</label>
                <p className="text-sm text-gray-900 break-words">{selectedFile.name}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Type</label>
                <p className="text-sm text-gray-900 capitalize">{selectedFile.type}</p>
              </div>

              {selectedFile.size && (
                <div>
                  <label className="text-xs font-semibold text-gray-600">Size</label>
                  <p className="text-sm text-gray-900">{formatFileSize(selectedFile.size)}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedFile.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Modified</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedFile.modifiedAt).toLocaleDateString()}
                </p>
              </div>

              {selectedFile.type === 'document' && selectedFile.content && (
                <div>
                  <label className="text-xs font-semibold text-gray-600">Preview</label>
                  <p className="text-xs text-gray-700 bg-white p-2 rounded max-h-24 overflow-y-auto">
                    {selectedFile.content.substring(0, 200)}
                    {selectedFile.content.length > 200 && '...'}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    if (selectedFile.type === 'document' || selectedFile.type === 'image') {
                      setPreviewFile(selectedFile);
                    }
                  }}
                  disabled={!['document', 'image'].includes(selectedFile.type)}
                  className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs rounded transition-all"
                >
                  Open
                </button>
                <button
                  onClick={() => handleDeleteMultiple()}
                  className="flex-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        );
        })()}
      </div>

      <AnimatePresence>
        {showNewDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001]"
            onClick={() => setShowNewDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"
            >
              <h2 className="text-lg font-semibold mb-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
              />

              {showNewDialog === 'file' && (
                <textarea
                  placeholder="File content (optional)"
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500 resize-none h-24"
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => (showNewDialog === 'folder' ? handleCreateFolder() : handleCreateFile())}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewDialog(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001]"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">{previewFile.name}</h2>
                <button onClick={() => setPreviewFile(null)} className="p-1 hover:bg-gray-100 rounded">
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {previewFile.type === 'document' && (
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                    {previewFile.content}
                  </pre>
                )}
                {previewFile.type === 'image' && previewFile.dataUrl && (
                  <img src={previewFile.dataUrl} alt={previewFile.name} className="max-w-full h-auto" />
                )}
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
    </div>
  );
}
