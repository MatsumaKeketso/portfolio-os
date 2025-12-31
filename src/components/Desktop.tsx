import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useFileStore } from '../store/fileStore';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { DesktopIcons } from './DesktopIcons';
import { WindowManager } from './WindowManager';
import { AdminPanel } from './AdminPanel';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

export function Desktop() {
  const {
    setStartMenuOpen,
    toggleAdminMode,
    setAdminMode,
    getSelectedBackground,
    backgrounds,
    selectedBackgroundId,
    setSelectedBackground
  } = useDesktopStore();
  const fileStore = useFileStore();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const selectedBackground = getSelectedBackground();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') {
      setAdminMode(true);
    }
  }, [setAdminMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        toggleAdminMode();
      }

      if (e.key === 'Escape') {
        setStartMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleAdminMode, setStartMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.start-menu') && !target.closest('.taskbar')) {
        setStartMenuOpen(false);
      }
      // Close context menu on any click
      if (!target.closest('.desktop-context-menu')) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setStartMenuOpen]);

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Prevent default context menu if not clicking on specific interactive elements
    const isInteractiveElement =
      target.closest('.window') ||
      target.closest('.taskbar') ||
      target.closest('.start-menu') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('a');

    if (!isInteractiveElement) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('desktop-drop-zone')) {
        setIsDraggingOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);

      const files = e.dataTransfer?.files;
      if (!files) return;

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
            parentId: null,
            path: `/${file.name}`,
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

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [fileStore]);

  const isGradient = selectedBackground?.url?.startsWith('linear-gradient') || false;

  return (
    <div
      className="fixed inset-0 overflow-hidden desktop-drop-zone"
      style={{
        background: isGradient ? selectedBackground?.url : '#1e3a8a',
        backgroundImage: !isGradient && selectedBackground?.url ? `url(${selectedBackground.url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onContextMenu={handleDesktopContextMenu}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 bg-primary-500/20 border-4 border-primary-400 border-dashed flex items-center justify-center z-[9997] pointer-events-none">
          <div className="text-white text-2xl font-bold drop-shadow-lg">Drop files to upload</div>
        </div>
      )}

      <div className="relative h-full flex flex-col" onContextMenu={handleDesktopContextMenu}>
        <div className="flex-1 relative desktop-area">
          <DesktopIcons />
          <WindowManager />
        </div>

        <div className="taskbar">
          <Taskbar />
        </div>

        <div className="start-menu">
          <StartMenu />
        </div>

        <AdminPanel />

        <KeyboardShortcutsHelp />

        {/* Desktop Context Menu */}
        <AnimatePresence>
          {contextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="desktop-context-menu fixed bg-gray-900/70 backdrop-blur-md rounded shadow-2xl border-b border-white/10 py-2 min-w-[200px] z-[10000]"
              style={{
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
              }}
            >
              <button
                onClick={() => {
                  setShowBackgroundSelector(true);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-primary-600 transition-colors flex items-center gap-3"
              >
                <Icons.Image className="w-4 h-4" />
                Change Background
              </button>
              <button
                onClick={() => {
                  toggleAdminMode();
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-primary-600 transition-colors flex items-center gap-3"
              >
                <Icons.Settings className="w-4 h-4" />
                Settings
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background Selector Modal */}
        <AnimatePresence>
          {showBackgroundSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[15000] flex items-center justify-center p-4"
              onClick={() => setShowBackgroundSelector(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[80vh] flex flex-col"
              >
                {/* Top gradient accent line */}
                <div className="w-full h-1 bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500 rounded-t" />

                <div className="flex-1 bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-b border border-gray-700/50 border-t-0 shadow-2xl overflow-hidden flex flex-col">
                  <div className="shrink-0 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Icons.Image className="w-6 h-6" />
                        Change Background
                      </h2>
                      <p className="text-primary-100 text-sm mt-1">Select a background for your desktop</p>
                    </div>
                    <button
                      onClick={() => setShowBackgroundSelector(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-all"
                    >
                      <Icons.X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Gradient divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {backgrounds.map((bg) => {
                      const isSelected = selectedBackgroundId === bg.id;
                      const isBgGradient = bg.url.startsWith('linear-gradient');

                      return (
                        <button
                          key={bg.id}
                          onClick={() => {
                            setSelectedBackground(bg.id);
                            setShowBackgroundSelector(false);
                          }}
                          className={`relative rounded overflow-hidden border-4 transition-all group ${
                            isSelected
                              ? 'border-primary-500 shadow-lg shadow-primary-500/50 scale-105'
                              : 'border-gray-700 hover:border-gray-500 hover:scale-102'
                          }`}
                        >
                          <div
                            className="w-full h-32 bg-cover bg-center"
                            style={{
                              background: isBgGradient ? bg.url : 'transparent',
                              backgroundImage: !isBgGradient ? `url(${bg.url})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          />

                          <div className="bg-gray-900/80 backdrop-blur-sm p-3 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-semibold text-sm truncate">
                                {bg.name}
                              </h3>
                              {isSelected && (
                                <Icons.Check className="w-5 h-5 text-primary-400 flex-shrink-0 ml-2" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
