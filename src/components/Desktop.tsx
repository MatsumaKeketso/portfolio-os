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
import { ContextMenuItemDef, sortAndSeparate } from '../lib/contextMenuRegistry';

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

import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';

export function Desktop() {
  const {
    setStartMenuOpen,
    toggleAdminMode,
    setAdminMode,
    isAdminMode,
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
  const { isAuthenticated, isAdmin, checkSession } = useAuthStore();
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

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProfile();
    fetchFileSystem();
    fetchApps();
    fetchBackgrounds();
  }, [isAuthenticated, fetchProfile, fetchFileSystem, fetchApps, fetchBackgrounds]);

  useEffect(() => {
    if (!isAdmin) setAdminMode(false);
  }, [isAdmin, setAdminMode]);

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
        if (isAdmin) {
          toggleAdminMode();
        } else if (isAuthenticated) {
          addNotification({
            type: 'info',
            title: 'Guest session',
            message: 'Only admin@os.com can open the Admin Panel.',
            duration: 4000,
          });
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
  }, [isAuthenticated, isAdmin, toggleAdminMode, setStartMenuOpen, addNotification]);

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

  const getDesktopMenuDefs = (): ContextMenuItemDef[] => [
    // organize: view options
    {
      id: 'view-large',
      label: 'Large icons',
      icon: Icons.LayoutGrid,
      group: 'organize',
      shortcut: systemPreferences.iconSize === 'large' ? '✓' : undefined,
      action: () => setIconSize('large'),
    },
    {
      id: 'view-medium',
      label: 'Medium icons',
      icon: Icons.Grid2X2,
      group: 'organize',
      shortcut: systemPreferences.iconSize === 'medium' ? '✓' : undefined,
      action: () => setIconSize('medium'),
    },
    {
      id: 'view-small',
      label: 'Small icons',
      icon: Icons.LayoutList,
      group: 'organize',
      shortcut: systemPreferences.iconSize === 'small' ? '✓' : undefined,
      action: () => setIconSize('small'),
    },
    { id: 'div-view-sort', label: '', divider: true, group: 'organize', action: () => {} },
    // organize: sort options
    {
      id: 'sort-name',
      label: 'Sort by Name',
      icon: Icons.SortAsc,
      group: 'organize',
      shortcut: sortBy === 'name' ? '✓' : undefined,
      action: () => setSortBy('name'),
    },
    {
      id: 'sort-type',
      label: 'Sort by Type',
      icon: Icons.Layers,
      group: 'organize',
      shortcut: sortBy === 'type' ? '✓' : undefined,
      action: () => setSortBy('type'),
    },
    {
      id: 'sort-date',
      label: 'Sort by Date',
      icon: Icons.Calendar,
      group: 'organize',
      shortcut: sortBy === 'date' ? '✓' : undefined,
      action: () => setSortBy('date'),
    },
    // system: desktop controls
    {
      id: 'toggle-timeline',
      label: showTimeline ? 'Hide Timeline' : 'Show Timeline',
      icon: Icons.PanelRight,
      group: 'system',
      action: () => setShowTimeline(!showTimeline),
    },
    {
      id: 'refresh',
      label: 'Refresh Desktop',
      icon: Icons.RotateCw,
      group: 'system',
      action: () => window.location.reload(),
    },
    {
      id: 'change-bg',
      label: 'Change Background',
      icon: Icons.Image,
      group: 'system',
      action: () => setShowBackgroundSelector(true),
    },
    {
      id: 'admin',
      label: isAdmin ? 'Admin Panel' : isAuthenticated ? 'Guest Session' : 'Sign In',
      icon: Icons.Settings,
      group: 'system',
      action: () => {
        if (isAdmin) toggleAdminMode();
        else if (isAuthenticated) {
          addNotification({
            type: 'info',
            title: 'Guest session',
            message: 'Only admin@os.com can open the Admin Panel.',
            duration: 4000,
          });
        } else setShowLoginModal(true);
      },
    },
  ];

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(isAdmin);
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

      if (!isAdmin) {
        addNotification({
          type: 'warning',
          title: 'Desktop upload blocked',
          message: 'Visitors can upload images only inside Visitor Gallery.',
          duration: 5000,
        });
        return;
      }

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
              folder: 'desktop-uploads',
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
  }, [fileStore, isAdmin, addNotification]);

  const isGradient = selectedBackground?.url?.startsWith('linear-gradient') || false;

  return (
    <div
      className="fixed inset-0 overflow-hidden desktop-drop-zone"
      onContextMenu={handleDesktopContextMenu}
    >
      <div className="absolute inset-0 overflow-hidden bg-[#1e3a8a]">
        {selectedBackground?.url && (
          isGradient ? (
            <div
              className="absolute inset-0"
              style={{ background: selectedBackground.url }}
            />
          ) : (
            <img
              src={selectedBackground.url}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          )
        )}
      </div>

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


        {isAdmin && isAdminMode && (
          <div
            className="fixed left-3 right-3 top-3 bottom-[76px] z-[9000] pointer-events-auto overflow-hidden rounded-2xl border border-stroke-primary bg-background-chrome shadow-os-window"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
          >
            <AdminPanel />
          </div>
        )}

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
              items={toContextMenuItems(getDesktopMenuDefs())}
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
              className="fixed inset-0 bg-black/60 z-[15000] flex items-center justify-center p-4"
              onClick={() => setShowBackgroundSelector(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[80vh] flex flex-col bg-os-ink-950 rounded-lg border border-white/[0.08] shadow-os-window overflow-hidden"
              >
                <div className="shrink-0 px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                      <Icons.Image className="w-4 h-4" />
                      Change Background
                    </h2>
                    <p className="text-white/40 text-xs mt-0.5">Select a background for your desktop</p>
                  </div>
                  <button
                    onClick={() => setShowBackgroundSelector(false)}
                    className="p-1.5 hover:bg-white/[0.08] rounded transition-colors"
                  >
                    <Icons.X className="w-4 h-4 text-white/60" />
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                          className={`relative rounded overflow-hidden border-2 transition-all ${isSelected
                            ? 'border-white/60 scale-105'
                            : 'border-white/[0.08] hover:border-white/[0.20]'
                            }`}
                        >
                          <div
                            className="w-full h-28 bg-cover bg-center"
                            style={{
                              background: isBgGradient ? bg.url : 'transparent',
                              backgroundImage: !isBgGradient ? `url(${bg.url})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          />
                          <div className="bg-os-ink-900 p-2.5 border-t border-white/[0.08]">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white text-xs font-medium truncate">{bg.name}</h3>
                              {isSelected && <Icons.Check className="w-3.5 h-3.5 text-white/60 flex-shrink-0 ml-2" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
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
