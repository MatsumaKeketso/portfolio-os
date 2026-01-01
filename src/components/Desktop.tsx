import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useFileStore } from '../store/fileStore';
import { useAuthStore } from '../store/authStore';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { DesktopIcons } from './DesktopIcons';
import { WindowManager } from './WindowManager';
import { AdminPanel } from './AdminPanel';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { LoginModal } from './LoginModal';
import { WelcomeScreen } from './WelcomeScreen';
import { NotificationContainer } from './NotificationContainer';

export function Desktop() {
  const {
    setStartMenuOpen,
    toggleAdminMode,
    getSelectedBackground,
    backgrounds,
    selectedBackgroundId,
    setSelectedBackground,
    systemPreferences,
    setIconSize,
  } = useDesktopStore();
  const fileStore = useFileStore();
  const { isAuthenticated, checkSession } = useAuthStore();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const selectedBackground = getSelectedBackground();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'date'>('name');

  useEffect(() => {
    // Check authentication session on mount
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (isAuthenticated) {
          toggleAdminMode();
        } else {
          setShowLoginModal(true);
        }
      }

      if (e.key === 'Escape') {
        setStartMenuOpen(false);
        setShowLoginModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, toggleAdminMode, setStartMenuOpen]);

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
          <DesktopIcons iconSize={systemPreferences.iconSize} sortBy={sortBy} />
          <WindowManager />
        </div>

        <div className="taskbar">
          <Taskbar />
        </div>

        <div className="start-menu">
          <StartMenu />
        </div>

        {isAuthenticated && <AdminPanel />}

        <KeyboardShortcutsHelp />

        <PWAInstallPrompt />

        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

        <WelcomeScreen />

        <NotificationContainer />

        {/* Desktop Context Menu */}
        <AnimatePresence>
          {contextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="desktop-context-menu fixed bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-gray-700/50 py-2 min-w-[220px] z-[10002]"
              style={{
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
              }}
            >
              {/* View Options */}
              <div className="px-2 py-1">
                <div className="text-gray-400 text-xs font-semibold px-2 py-1">View</div>
                <div className="space-y-0.5">
                  {(['large', 'medium', 'small'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setIconSize(size);
                        setContextMenu(null);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm rounded transition-colors flex items-center justify-between ${
                        systemPreferences.iconSize === size
                          ? 'text-primary-300 bg-primary-500/20'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="capitalize">{size} icons</span>
                      {systemPreferences.iconSize === size && <Icons.Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-700 my-2" />

              {/* Sort Options */}
              <div className="px-2 py-1">
                <div className="text-gray-400 text-xs font-semibold px-2 py-1">Sort by</div>
                <div className="space-y-0.5">
                  {[
                    { value: 'name' as const, label: 'Name', icon: Icons.SortAsc },
                    { value: 'type' as const, label: 'Type', icon: Icons.Layers },
                    { value: 'date' as const, label: 'Date Added', icon: Icons.Calendar },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setContextMenu(null);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm rounded transition-colors flex items-center gap-2 ${
                        sortBy === option.value
                          ? 'text-primary-300 bg-primary-500/20'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <option.icon className="w-3.5 h-3.5" />
                      {option.label}
                      {sortBy === option.value && <Icons.Check className="w-3 h-3 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-700 my-2" />

              {/* Actions */}
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3 rounded mx-1"
              >
                <Icons.RotateCw className="w-4 h-4" />
                Refresh Desktop
              </button>

              <button
                onClick={() => {
                  setShowBackgroundSelector(true);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3 rounded mx-1"
              >
                <Icons.Image className="w-4 h-4" />
                Change Background
              </button>

              <div className="h-px bg-gray-700 my-2" />

              <button
                onClick={() => {
                  if (isAuthenticated) {
                    toggleAdminMode();
                  } else {
                    setShowLoginModal(true);
                  }
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-primary-600 transition-colors flex items-center gap-3 rounded mx-1"
              >
                <Icons.Settings className="w-4 h-4" />
                {isAuthenticated ? 'Admin Panel' : 'Admin Login'}
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
