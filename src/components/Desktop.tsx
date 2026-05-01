import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useFileStore } from '../store/fileStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { uploadFile, UploadProgress as UploadProgressType } from '../lib/uploadUtils';
import { UploadProgressToast } from './UploadProgress';
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
import { Timeline } from './Timeline';
import { ContextMenu, ContextMenuItem } from './ContextMenu';

import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';

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
    windows,
    fetchApps,
    fetchBackgrounds,
  } = useDesktopStore();
  const fileStore = useFileStore();
  const { isAuthenticated, checkSession } = useAuthStore();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const selectedBackground = getSelectedBackground();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'date'>('name');
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType[]>([]);

  // Auto-hide timeline when a window is maximized
  const hasMaximizedWindow = windows.some(w => w.isMaximized && !w.isMinimized);

  const { fetchProfile } = useUserStore();
  const { fetchFileSystem } = useFileStore();
  const { fetchTheme } = useThemeStore();

  useEffect(() => {
    // Check authentication session on mount
    checkSession();
    // Fetch profile data from Supabase
    fetchProfile();
    // Fetch file system
    fetchFileSystem();
    // Fetch apps from Supabase
    fetchApps();
    // Fetch backgrounds from Supabase
    fetchBackgrounds();
    // Fetch theme from Supabase
    fetchTheme();
  }, [checkSession, fetchProfile, fetchFileSystem, fetchApps, fetchBackgrounds, fetchTheme]);

  /* Global Error Handling */
  const { error: userError } = useUserStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (userError) {
      addNotification({
        type: 'error',
        title: 'System Error',
        message: userError,
        duration: 5000,
      });
      // Optionally clear error after showing? 
      // useUserStore.setState({ error: null }); 
      // Better to let user dismiss or have it persist until next action.
    }
  }, [userError, addNotification]);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setStartMenuOpen]);

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
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

  const getDesktopMenuItems = (): ContextMenuItem[] => [
    {
      label: 'Large icons',
      icon: Icons.LayoutGrid,
      shortcut: systemPreferences.iconSize === 'large' ? '✓' : undefined,
      onClick: () => setIconSize('large'),
    },
    {
      label: 'Medium icons',
      icon: Icons.Grid2X2,
      shortcut: systemPreferences.iconSize === 'medium' ? '✓' : undefined,
      onClick: () => setIconSize('medium'),
    },
    {
      label: 'Small icons',
      icon: Icons.LayoutList,
      shortcut: systemPreferences.iconSize === 'small' ? '✓' : undefined,
      onClick: () => setIconSize('small'),
    },
    { label: '', divider: true, onClick: () => {} },
    {
      label: 'Sort by Name',
      icon: Icons.SortAsc,
      shortcut: sortBy === 'name' ? '✓' : undefined,
      onClick: () => setSortBy('name'),
    },
    {
      label: 'Sort by Type',
      icon: Icons.Layers,
      shortcut: sortBy === 'type' ? '✓' : undefined,
      onClick: () => setSortBy('type'),
    },
    {
      label: 'Sort by Date',
      icon: Icons.Calendar,
      shortcut: sortBy === 'date' ? '✓' : undefined,
      onClick: () => setSortBy('date'),
    },
    { label: '', divider: true, onClick: () => {} },
    {
      label: showTimeline ? 'Hide Timeline' : 'Show Timeline',
      icon: Icons.PanelRight,
      onClick: () => setShowTimeline(!showTimeline),
    },
    {
      label: 'Refresh Desktop',
      icon: Icons.RotateCw,
      onClick: () => window.location.reload(),
    },
    {
      label: 'Change Background',
      icon: Icons.Image,
      onClick: () => setShowBackgroundSelector(true),
    },
    { label: '', divider: true, onClick: () => {} },
    {
      label: isAuthenticated ? 'Admin Panel' : 'Admin Login',
      icon: Icons.Settings,
      onClick: () => {
        if (isAuthenticated) toggleAdminMode();
        else setShowLoginModal(true);
      },
    },
  ];

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

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);

      const files = e.dataTransfer?.files;
      if (!files) return;

      const fileArray = Array.from(files);
      setUploadProgress([]);

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileType = file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
            ? 'video'
            : 'file';

        let dataUrl = '';

        // Upload media files to Supabase
        if (fileType === 'image' || fileType === 'video') {
          try {
            const result = await uploadFile(file, {
              maxSizeMB: 100,
              allowedTypes: ['image/*', 'video/*'],
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
            } else {
              console.error('Upload error:', result.error);
            }
          } catch (error) {
            console.error('Upload exception:', error);
          }
        }

        // Fallback to base64 if upload fails
        if (!dataUrl && (fileType === 'image' || fileType === 'video')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            addFileToStore(base64);
          };
          reader.readAsDataURL(file);
          continue;
        }

        addFileToStore(dataUrl);

        function addFileToStore(urlOrContent: string) {
          fileStore.addFile({
            id: `file-${Date.now()}-${i}`,
            name: file.name,
            type: fileType,
            parentId: null,
            path: `/${file.name}`,
            size: file.size,
            mimeType: file.type,
            dataUrl: urlOrContent,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
          });
        }
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
        <div className="absolute inset-0 bg-primary-500/20 border-1 border-primary-400 border-dashed flex items-center justify-center z-[9997] pointer-events-none">
          <div className="text-white text-2xl font-bold drop-shadow-lg">Drop files to upload</div>
        </div>
      )}

      <div className="relative h-full flex flex-col" onContextMenu={handleDesktopContextMenu}>
        <div className="flex-1 relative desktop-area flex gap-4 pr-4">
          {/* Left side: Desktop Icons and Windows */}
          <div className="flex-1 relative">
            <DesktopIcons iconSize={systemPreferences.iconSize} sortBy={sortBy} />
            <WindowManager />
          </div>

          {/* Right side: Timeline - Hidden when window is maximized */}
          {!hasMaximizedWindow && showTimeline && (
            <div
              className={`flex-shrink-0 relative transition-all duration-300 ease-in-out ${isTimelineExpanded ? 'w-[80%]' : 'w-[400px]'
                }`}
              style={{ zIndex: 1 }}
            >
              <Timeline
                isExpanded={isTimelineExpanded}
                onToggleExpand={() => setIsTimelineExpanded(!isTimelineExpanded)}
              />
            </div>
          )}
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
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              items={getDesktopMenuItems()}
              onClose={() => setContextMenu(null)}
            />
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
                            className={`relative rounded overflow-hidden border-4 transition-all group ${isSelected
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

        {/* Upload Progress Toast */}
        <UploadProgressToast
          uploads={uploadProgress}
          onClose={() => setUploadProgress([])}
        />
      </div>
    </div>
  );
}
