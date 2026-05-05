import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useDesktopContrast } from '../hooks/useDesktopContrast';
import { App } from '../types';

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
  const contrastMode = useDesktopContrast();
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoveredApp, setHoveredApp] = useState<App | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  // Track mouse down state for drag threshold
  const [mouseDownState, setMouseDownState] = useState<{
    appId: string;
    startX: number;
    startY: number;
    currentPos: { x: number; y: number };
  } | null>(null);

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || Icons.Square;
    return Icon;
  };

  // Render icon - either custom image or lucide icon
  const renderIcon = (app: App, className: string) => {
    if (app.customIcon) {
      return (
        <img
          src={app.customIcon}
          alt={app.name}
          className={className}
          style={{ objectFit: 'contain' }}
        />
      );
    }
    const Icon = getIcon(app.icon);
    return <Icon className={className} />;
  };

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

  const handleIconHover = (app: App, position: { x: number; y: number }) => {
    if (!draggingAppId) {
      setHoveredApp(app);
      setHoverPosition(position);
    }
  };

  const handleIconLeave = () => {
    setHoveredApp(null);
    setHoverPosition(null);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 p-4 select-none">
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
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 pointer-events-none"
              style={{ zIndex: 5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/18 via-background-chrome/28 to-secondary-500/18" />
              <div className="absolute inset-0 bg-black/58" />
              <div className="absolute inset-y-0 left-0 w-[68vw] bg-gradient-to-r from-background-chrome/96 via-background-chrome/78 to-transparent backdrop-blur-2xl [mask-image:linear-gradient(to_right,black_0%,black_68%,transparent_100%)]" />
              <div className="absolute inset-y-0 left-0 w-[54vw] bg-gradient-to-r from-black/50 via-black/18 to-transparent" />

              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-[8vw] right-[8vw] top-[10vh] grid max-h-[78vh] grid-cols-[minmax(320px,0.95fr)_minmax(380px,1.05fr)] gap-8"
              >
                <div className="relative space-y-6 self-center p-2">
                  <div className="relative inline-flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/30 to-secondary-500/20 blur-xl" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.06]">
                      {renderIcon(hoveredApp, "w-12 h-12 text-white drop-shadow-2xl")}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h1 className="max-w-3xl text-6xl font-bold leading-tight tracking-normal text-white">
                      {hoveredApp.name}
                    </h1>
                    <p className="text-xl font-medium text-primary-300">
                      {hoveredApp.type === 'component'
                        ? 'Built-in Application'
                        : hoveredApp.type === 'iframe'
                          ? 'Web Application'
                          : 'Static Application'}
                    </p>
                    <p className="max-w-2xl text-base leading-relaxed text-white/62">
                      {hoveredApp.description || 'No description available.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    {hoveredApp.pinnedToTaskbar && (
                      <span className="flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/15 px-3 py-1.5 text-sm font-medium text-primary-200">
                        <Icons.Pin className="w-4 h-4" />
                        Pinned to Taskbar
                      </span>
                    )}
                    {hoveredApp.pinnedToDesktop && (
                      <span className="flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 text-sm font-medium text-white/65">
                        <Icons.Monitor className="w-4 h-4" />
                        Pinned to Desktop
                      </span>
                    )}
                    {mediaItems.length > 0 && (
                      <span className="flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 text-sm font-medium text-white/65">
                        <Icons.Images className="w-4 h-4" />
                        {mediaItems.length} media {mediaItems.length === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>

                  {hoveredApp.url && (
                    <div className="flex max-w-xl items-center gap-2 text-sm text-white/42">
                      <Icons.Link className="w-4 h-4 shrink-0 text-primary-300" />
                      <span className="truncate">{hoveredApp.url}</span>
                    </div>
                  )}
                </div>

                <div className="self-center overflow-hidden rounded-2xl border border-white/[0.10] bg-background-chrome shadow-2xl shadow-black/60">
                  <div className="relative aspect-video bg-background-chrome-raised">
                    {previewMedia ? (
                      previewMedia.type === 'video' ? (
                        <video src={previewMedia.url} muted autoPlay loop playsInline className="h-full w-full object-cover" />
                      ) : (
                        <img src={previewMedia.url} alt={previewMedia.name || hoveredApp.name} className="h-full w-full object-cover" />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.05]">
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
                        <span className="flex items-center gap-1.5 rounded-md border border-white/[0.10] bg-background-chrome/80 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/60">
                          {previewMedia.type === 'video' ? <Icons.Video className="w-3 h-3" /> : <Icons.Image className="w-3 h-3" />}
                          {previewMedia.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {mediaItems.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 border-t border-white/[0.06] p-3">
                      {mediaItems.slice(0, 4).map((item) => (
                        <div key={item.id} className="relative overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.04]">
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
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
      {displayApps.map((app, index) => {
        const isDragging = draggingAppId === app.id;
        const isHovered = hoveredApp?.id === app.id;
        const isOtherHovered = hoveredApp && hoveredApp.id !== app.id;

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
              zIndex: isHovered ? 30 : isDragging ? 1000 : isOtherHovered ? 5 : 10,
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
                ? contrastMode === 'light' ? 'bg-black/[0.12]' : 'bg-white/[0.16]'
                : contrastMode === 'light'
                  ? 'hover:bg-black/[0.07] active:bg-black/[0.12]'
                  : 'hover:bg-white/[0.08] active:bg-white/[0.16]'
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
