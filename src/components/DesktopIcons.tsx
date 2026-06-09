import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useFileStore } from '../store/fileStore';
import { useDesktopContrast } from '../hooks/useDesktopContrast';
import { App } from '../types';
import { AppIcon } from '../lib/AppIcon';
import { getFileIcon } from '../lib/fileUtils';
import { openFileWithApp } from '../lib/fileRouter';
import { DesktopWidgets } from './DesktopWidgets';

interface GridPosition {
  row: number;
  col: number;
}

interface DesktopIconsProps {
  iconSize: 'small' | 'medium' | 'large';
  sortBy: 'name' | 'type' | 'date';
}

export function DesktopIcons({ iconSize = 'medium', sortBy = 'name' }: DesktopIconsProps) {
  // Dynamic sizes based on iconSize prop
  const SIZES = {
    small: { grid: 70, width: 60, height: 70, icon: 8, text: 'text-[10px]', label: 'truncate leading-tight' },
    medium: { grid: 90, width: 80, height: 90, icon: 10, text: 'text-[11px]', label: 'truncate leading-tight' },
    large: { grid: 114, width: 104, height: 114, icon: 12, text: 'text-xs', label: 'line-clamp-2 leading-snug' },
  };

  const GRID_SIZE = SIZES[iconSize].grid;
  const ICON_WIDTH = SIZES[iconSize].width;
  const ICON_HEIGHT = SIZES[iconSize].height;
  const DRAG_THRESHOLD = 5; // pixels to move before starting drag

  const { apps, openWindow, reorderApps } = useDesktopStore();
  const { files, navigateToFolder } = useFileStore();
  const contrastMode = useDesktopContrast();
  const desktopFiles = useMemo(() => files.filter((f) => f.parentId === 'folder-desktop'), [files]);
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoveredApp, setHoveredApp] = useState<App | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  // Track mouse down state for drag threshold
  const [mouseDownState, setMouseDownState] = useState<{
    appId: string;
    startX: number;
    startY: number;
    currentPos: { x: number; y: number };
  } | null>(null);

  const renderIcon = (app: App, className: string) => (
    <AppIcon icon={app.icon} customIcon={app.customIcon} className={className} />
  );

  // Update container height
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  // Calculate grid dimensions
  const getGridDimensions = () => {
    const maxRows = Math.floor((containerHeight - 32 - 48) / GRID_SIZE); // Subtract padding and taskbar
    return { maxRows };
  };

  // Convert index to grid position (column-first layout like Windows)
  const indexToGridPosition = (index: number): GridPosition => {
    const { maxRows } = getGridDimensions();
    const row = index % maxRows;
    const col = Math.floor(index / maxRows);
    return { row, col };
  };

  // Convert grid position to pixel position
  const gridToPixels = (gridPos: GridPosition): { x: number; y: number } => {
    return {
      x: gridPos.col * GRID_SIZE + 16,
      y: gridPos.row * GRID_SIZE + 16,
    };
  };

  // Convert pixel position to index
  const pixelsToIndex = (x: number, y: number): number => {
    const { maxRows } = getGridDimensions();
    const col = Math.max(0, Math.floor((x - 16) / GRID_SIZE));
    const row = Math.max(0, Math.floor((y - 16) / GRID_SIZE));
    return col * maxRows + row;
  };

  // Get reordered apps list based on drag
  const getReorderedApps = (): App[] => {
    const desktopApps = apps.filter(app => app.pinnedToDesktop);

    if (draggingAppId === null || hoverIndex === null) {
      return desktopApps;
    }

    const draggedApp = desktopApps.find(app => app.id === draggingAppId);
    if (!draggedApp) return desktopApps;

    const otherApps = desktopApps.filter(app => app.id !== draggingAppId);

    // Insert at hover index
    const reordered = [...otherApps];
    const targetIndex = Math.min(hoverIndex, reordered.length);
    reordered.splice(targetIndex, 0, draggedApp);

    return reordered;
  };

  const handleMouseDown = (e: React.MouseEvent, appId: string, currentPos: { x: number; y: number }) => {
    // Don't prevent default yet - let double-click work
    setMouseDownState({
      appId,
      startX: e.clientX,
      startY: e.clientY,
      currentPos,
    });
  };

  useEffect(() => {
    if (!mouseDownState && !draggingAppId) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Check if we should start dragging (threshold check)
      if (mouseDownState && !draggingAppId) {
        const deltaX = Math.abs(e.clientX - mouseDownState.startX);
        const deltaY = Math.abs(e.clientY - mouseDownState.startY);

        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          // Start dragging
          setDraggingAppId(mouseDownState.appId);
          setDragOffset({
            x: e.clientX - mouseDownState.currentPos.x,
            y: e.clientY - mouseDownState.currentPos.y,
          });
          setDragPosition(mouseDownState.currentPos);
          setHoverIndex(null);
          setMouseDownState(null);
        }
      } else if (draggingAppId) {
        // Continue dragging
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setDragPosition({ x: newX, y: newY });

        // Calculate hover index
        const index = pixelsToIndex(newX + ICON_WIDTH / 2, newY + ICON_HEIGHT / 2);
        setHoverIndex(index);
      }
    };

    const handleMouseUp = () => {
      if (draggingAppId && hoverIndex !== null) {
        // Get the reordered apps and update the store
        const reordered = getReorderedApps();
        reorderApps(reordered);
      }
      setDraggingAppId(null);
      setHoverIndex(null);
      setMouseDownState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseDownState, draggingAppId, dragOffset, dragPosition, hoverIndex, containerHeight]);

  // Sort apps based on sortBy prop
  const sortApps = (appsToSort: App[]): App[] => {
    const sorted = [...appsToSort];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'type':
        return sorted.sort((a, b) => a.type.localeCompare(b.type));
      case 'date':
        // Assuming apps are added chronologically, maintain original order
        return sorted;
      default:
        return sorted;
    }
  };

  // Get apps in their display order (reordered if dragging, then sorted)
  const reorderedApps = getReorderedApps();
  const displayApps = draggingAppId ? reorderedApps : sortApps(reorderedApps);
  const iconCount = displayApps.length + desktopFiles.length;
  const occupiedIconColumns = Math.ceil(iconCount / Math.max(1, getGridDimensions().maxRows));
  const viewportWidth = typeof globalThis.window === 'undefined' ? 1280 : globalThis.window.innerWidth;
  const hoverContentLeft = Math.min(
    Math.max(112, occupiedIconColumns * GRID_SIZE + 40),
    Math.max(112, viewportWidth * 0.34),
  );
  const previewEase = [0.16, 1, 0.3, 1] as const;
  const previewStageVariants: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.985 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: previewEase,
        delayChildren: 0.04,
        staggerChildren: 0.055,
      },
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.99,
      transition: {
        duration: 0.28,
        ease: previewEase,
        staggerChildren: 0.035,
        staggerDirection: -1,
      },
    },
  };
  const previewItemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: previewEase } },
    exit: { opacity: 0, y: 8, transition: { duration: 0.16, ease: previewEase } },
  };

  const handleIconHover = (app: App, position: { x: number; y: number }) => {
    if (!draggingAppId) {
      setHoveredApp(app);
      setHoverPosition(position);
      setHoveredFileId(null);
    }
  };

  const handleIconLeave = () => {
    setHoveredApp(null);
    setHoverPosition(null);
  };

  const handleFileIconHover = (fileId: string) => {
    if (!draggingAppId) {
      setHoveredFileId(fileId);
      setHoveredApp(null);
      setHoverPosition(null);
    }
  };

  const handleFileIconLeave = () => {
    setHoveredFileId(null);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 p-4 select-none">
      <DesktopWidgets />
      {/* Desktop icon preview */}
      <AnimatePresence>
        {hoveredApp && hoverPosition && (() => {
          const previewMedia = hoveredApp.media?.[0];
          const mediaItems = hoveredApp.media || [];
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 pointer-events-none"
              style={{ zIndex: 65 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/18 via-background-chrome/28 to-brand-600/18" />
              <div className="absolute inset-0 bg-black/46" />
              <motion.div
                initial={{ opacity: 0, x: -90 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -150 }}
                transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -left-[18vw] -top-[26vh] h-[118vh] w-[86vw] rounded-br-[48vw] rounded-tr-[42vw] bg-background-chrome/90 shadow-[40px_0_120px_rgba(0,0,0,0.48)] [mask-image:radial-gradient(ellipse_at_0%_0%,black_0%,black_62%,transparent_100%)]"
              />
              <motion.div
                initial={{ opacity: 0, x: -70 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -120 }}
                transition={{ duration: 0.4, delay: 0.035, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -left-[12vw] -top-[18vh] h-[102vh] w-[70vw] rounded-br-[40vw] rounded-tr-[36vw] bg-gradient-to-br from-black/54 via-black/18 to-transparent"
              />
              <motion.div
                initial={{ opacity: 0, x: -90 }}
                animate={{ opacity: 0.16, x: 0 }}
                exit={{ opacity: 0, x: -150 }}
                transition={{ duration: 0.46, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -left-[18vw] -top-[26vh] h-[118vh] w-[86vw] rounded-br-[48vw] rounded-tr-[42vw] opacity-[0.16] mix-blend-screen [mask-image:radial-gradient(ellipse_at_0%_0%,black_0%,black_64%,transparent_100%)]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0), radial-gradient(circle at 11px 17px, rgba(255,255,255,0.22) 1px, transparent 0)',
                  backgroundSize: '18px 18px, 23px 23px',
                }}
              />

              <AnimatePresence mode="wait">
              <motion.div
                key={hoveredApp.id}
                variants={previewStageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-[4vw] top-[10vh] grid max-h-[78vh] grid-cols-[minmax(280px,0.95fr)_minmax(340px,1.05fr)] gap-8"
                style={{ left: hoverContentLeft }}
              >
                <div className="relative space-y-6 self-center p-2">
                  <motion.div variants={previewItemVariants} className="relative inline-flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-600/30 to-brand-600/20 blur-xl" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-os-line-dark bg-os-ink-900/70">
                      {renderIcon(hoveredApp, "w-12 h-12 text-white drop-shadow-2xl")}
                    </div>
                  </motion.div>

                  <motion.div variants={previewItemVariants} className="space-y-3">
                    <h1 className="max-w-3xl text-6xl font-bold leading-tight tracking-normal text-white">
                      {hoveredApp.name}
                    </h1>
                    <p className="text-xl font-medium text-fg-brand">
                      {hoveredApp.type === 'component'
                        ? 'Built-in Application'
                        : hoveredApp.type === 'iframe'
                          ? 'Web Application'
                          : 'Static Application'}
                    </p>
                    <p className="max-w-2xl text-base leading-relaxed text-white/62">
                      {hoveredApp.description || 'No description available.'}
                    </p>
                  </motion.div>

                  <motion.div variants={previewItemVariants} className="flex flex-wrap gap-3 pt-1">
                    {hoveredApp.pinnedToTaskbar && (
                      <span className="flex items-center gap-2 rounded-full border border-brand-600/30 bg-brand-600/15 px-3 py-1.5 text-sm font-medium text-fg-brand">
                        <Icons.Pin className="w-4 h-4" />
                        Pinned to Taskbar
                      </span>
                    )}
                    {hoveredApp.pinnedToDesktop && (
                      <span className="flex items-center gap-2 rounded-full border border-os-line-dark bg-os-ink-900/70 px-3 py-1.5 text-sm font-medium text-white/65">
                        <Icons.Monitor className="w-4 h-4" />
                        Pinned to Desktop
                      </span>
                    )}
                    {mediaItems.length > 0 && (
                      <span className="flex items-center gap-2 rounded-full border border-os-line-dark bg-os-ink-900/70 px-3 py-1.5 text-sm font-medium text-white/65">
                        <Icons.Images className="w-4 h-4" />
                        {mediaItems.length} media {mediaItems.length === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </motion.div>

                  {hoveredApp.url && (
                    <motion.div variants={previewItemVariants} className="flex max-w-xl items-center gap-2 text-sm text-white/42">
                      <Icons.Link className="w-4 h-4 shrink-0 text-fg-brand" />
                      <span className="truncate">{hoveredApp.url}</span>
                    </motion.div>
                  )}
                </div>

                <motion.div variants={previewItemVariants} className="self-center overflow-hidden rounded-2xl border border-os-line-dark bg-background-chrome shadow-2xl shadow-black/60">
                  <div className="relative aspect-video bg-background-chrome-raised">
                    {previewMedia ? (
                      previewMedia.type === 'video' ? (
                        <video src={previewMedia.url} muted autoPlay loop playsInline className="h-full w-full object-cover" />
                      ) : (
                        <img src={previewMedia.url} alt={previewMedia.name || hoveredApp.name} className="h-full w-full object-cover" />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-os-line-dark bg-os-ink-900/70">
                          {renderIcon(hoveredApp, "w-14 h-14 text-white/70")}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background-chrome to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white/90">{previewMedia?.name || hoveredApp.name}</p>
                        <p className="text-xs text-white/40">{previewMedia ? `${previewMedia.type} preview` : 'Application preview'}</p>
                      </div>
                      {previewMedia && (
                        <span className="flex items-center gap-1.5 rounded-md border border-os-line-dark bg-background-chrome/80 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/60">
                          {previewMedia.type === 'video' ? <Icons.Video className="w-3 h-3" /> : <Icons.Image className="w-3 h-3" />}
                          {previewMedia.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {mediaItems.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 border-t border-os-line-dark p-3">
                      {mediaItems.slice(0, 4).map((item) => (
                        <div key={item.id} className="relative overflow-hidden rounded-lg border border-os-line-dark bg-os-ink-900/70">
                          {item.type === 'video' ? (
                            <video src={item.url} muted playsInline className="aspect-video w-full object-cover" />
                          ) : (
                            <img src={item.url} alt={item.name || hoveredApp.name} className="aspect-video w-full object-cover" />
                          )}
                          <div className="absolute left-1.5 top-1.5 rounded bg-black/60 p-1 text-white/80">
                            {item.type === 'video' ? <Icons.Video className="w-3 h-3" /> : <Icons.Image className="w-3 h-3" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
              </AnimatePresence>
            </motion.div>
          )
        })()}
      </AnimatePresence>
      {desktopFiles.map((file, fileIndex) => {
        const index = displayApps.length + fileIndex;
        const gridPos = indexToGridPosition(index);
        const position = gridToPixels(gridPos);
        const FileIconComp = getFileIcon(file.name, file.type, file.mimeType);
        const thumbnailSrc = file.thumbnailUrl || file.previewUrl || file.dataUrl;
        const isThisFileHovered = hoveredFileId === file.id;
        const isFileOtherHovered = (hoveredApp !== null) || (hoveredFileId !== null && hoveredFileId !== file.id);

        return (
          <motion.button
            key={file.id}
            style={{
              position: 'absolute',
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${ICON_WIDTH}px`,
              height: `${ICON_HEIGHT}px`,
              cursor: 'pointer',
              zIndex: isThisFileHovered ? 80 : isFileOtherHovered ? 8 : 10,
              transition: 'all 0.2s ease-out',
            }}
            animate={{
              opacity: isFileOtherHovered ? 0.3 : 1,
              scale: isThisFileHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => handleFileIconHover(file.id)}
            onMouseLeave={handleFileIconLeave}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (file.type === 'folder') {
                const feApp = apps.find((a) => a.component === 'FileExplorer');
                if (feApp) { navigateToFolder(file.id); openWindow(feApp); }
                return;
              }
              openFileWithApp(file, openWindow);
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
              contrastMode === 'light'
                ? 'hover:bg-black/[0.07] active:bg-black/[0.12]'
                : 'hover:bg-os-ink-800/60 active:bg-os-ink-800'
            }`}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: `${SIZES[iconSize].icon * 4 + 8}px`, height: `${SIZES[iconSize].icon * 4 + 8}px` }}
            >
              <div
                className={`${contrastMode === 'light' ? 'text-gray-950 drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'text-white drop-shadow-lg'}`}
                style={{ width: `${SIZES[iconSize].icon * 4}px`, height: `${SIZES[iconSize].icon * 4}px` }}
              >
                {file.type === 'image' && thumbnailSrc ? (
                  <img
                    src={thumbnailSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <FileIconComp className="w-full h-full" />
                )}
              </div>
            </div>
            <span className={`${SIZES[iconSize].text} ${SIZES[iconSize].label} block w-full text-center px-1 ${
              contrastMode === 'light' ? 'text-gray-950 drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'text-white drop-shadow-lg'
            }`}>
              {file.name}
            </span>
          </motion.button>
        );
      })}
      {displayApps.map((app, index) => {
        const isDragging = draggingAppId === app.id;
        const isHovered = hoveredApp?.id === app.id;
        const isOtherHovered = (hoveredApp && hoveredApp.id !== app.id) || hoveredFileId !== null;

        // Calculate position based on index
        const gridPos = indexToGridPosition(index);
        const calculatedPos = gridToPixels(gridPos);

        // Use drag position if dragging, otherwise use calculated position
        const position = isDragging ? dragPosition : calculatedPos;

        return (
          <motion.button
            key={app.id}
            style={{
              position: 'absolute',
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${ICON_WIDTH}px`,
              height: `${ICON_HEIGHT}px`,
              cursor: isDragging ? 'grabbing' : 'pointer',
              zIndex: isHovered ? 80 : isDragging ? 1000 : isOtherHovered ? 8 : 10,
              transition: isDragging ? 'none' : 'all 0.2s ease-out',
            }}
            animate={{
              opacity: isOtherHovered ? 0.3 : 1,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => handleMouseDown(e, app.id, calculatedPos)}
            onMouseEnter={() => handleIconHover(app, position)}
            onMouseLeave={handleIconLeave}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!isDragging) openWindow(app);
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg group ${
              isDragging || isHovered
                ? contrastMode === 'light' ? 'bg-black/[0.12]' : 'bg-os-ink-800/70'
                : contrastMode === 'light'
                  ? 'hover:bg-black/[0.07] active:bg-black/[0.12]'
                  : 'hover:bg-os-ink-800/60 active:bg-os-ink-800'
            }`}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: `${SIZES[iconSize].icon * 4 + 8}px`,
                height: `${SIZES[iconSize].icon * 4 + 8}px`,
              }}
            >
              <div
                className={`transition-transform ${isHovered ? 'scale-110' : 'group-hover:scale-110'} ${
                  contrastMode === 'light' ? 'text-gray-950 drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'text-white drop-shadow-lg'
                }`}
                style={{
                  width: `${SIZES[iconSize].icon * 4}px`,
                  height: `${SIZES[iconSize].icon * 4}px`,
                }}
              >
                {renderIcon(app, "w-full h-full")}
              </div>
            </div>
            <span className={`${SIZES[iconSize].text} ${SIZES[iconSize].label} block w-full text-center px-1 transition-all ${isHovered ? 'font-bold' : ''} ${
              contrastMode === 'light' ? 'text-gray-950 drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'text-white drop-shadow-lg'
            }`}>
              {app.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
