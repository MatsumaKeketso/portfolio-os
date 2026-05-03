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
    small: { grid: 70, width: 60, height: 70, icon: 8, text: 'text-[10px]' },
    medium: { grid: 90, width: 80, height: 90, icon: 10, text: 'text-xs' },
    large: { grid: 110, width: 100, height: 110, icon: 12, text: 'text-sm' },
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

  // Smart positioning for text content next to icon
  const getSmartContentPosition = (iconPos: { x: number; y: number }) => {
    const CONTENT_WIDTH = 600;
    const CONTENT_HEIGHT = 400; // Approximate height of content
    const CONTENT_MARGIN = 24;
    const SCREEN_PADDING = 16;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let contentX = iconPos.x + ICON_WIDTH + CONTENT_MARGIN; // Default: right of icon
    let contentY = iconPos.y;

    // Horizontal positioning
    const spaceOnRight = viewportWidth - (iconPos.x + ICON_WIDTH);

    if (spaceOnRight < CONTENT_WIDTH + CONTENT_MARGIN + SCREEN_PADDING) {
      // Not enough space on right, try left
      const spaceOnLeft = iconPos.x;
      if (spaceOnLeft > CONTENT_WIDTH + CONTENT_MARGIN + SCREEN_PADDING) {
        contentX = iconPos.x - CONTENT_WIDTH - CONTENT_MARGIN;
      } else {
        // Not enough space on either side, center it
        contentX = Math.max(SCREEN_PADDING, Math.min(
          viewportWidth - CONTENT_WIDTH - SCREEN_PADDING,
          iconPos.x + ICON_WIDTH / 2 - CONTENT_WIDTH / 2
        ));
      }
    }

    // Vertical positioning - ensure content doesn't overflow bottom or top
    const spaceBelow = viewportHeight - iconPos.y;

    if (spaceBelow < CONTENT_HEIGHT + SCREEN_PADDING) {
      // Not enough space below, try to align to bottom of viewport
      // 48 avoids section showing behind taskbar 
      // const taskbarHeight = theme.components.Taskbar.height;
      const taskbarHeight = 48;
      contentY = Math.max(SCREEN_PADDING, (viewportHeight - CONTENT_HEIGHT - SCREEN_PADDING) - taskbarHeight);
    }

    // If content would overflow the top, clamp it
    if (contentY < SCREEN_PADDING) {
      contentY = SCREEN_PADDING;
    }

    return { x: contentX, y: contentY };
  };



  return (
    <div ref={containerRef} className="absolute inset-0 p-4 select-none">
      {/* Netflix-Style Full-Screen Preview - Behind Desktop Icons */}
      <AnimatePresence>
        {hoveredApp && hoverPosition && (() => {
          const smartPos = getSmartContentPosition(hoverPosition);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 pointer-events-none"
              style={{ zIndex: 5 }}
            >
              {/* Gradient Background with Theme Colors */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-tertiary-500/20 to-secondary-500/20" />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/70" />

              {/* Content Area - Positioned Next to Icon */}
              <div
                className="absolute"
                style={{
                  left: `${smartPos.x}px`,
                  top: `${smartPos.y}px`,
                  maxWidth: '600px'
                }}
              >
                <div className="space-y-6 p-8">
                  {/* App Icon with Glow */}
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/40 to-tertiary-500/40" />
                    {renderIcon(hoveredApp, "relative w-20 h-20 text-white drop-shadow-2xl")}
                  </div>

                  {/* App Name - Large Netflix Style */}
                  <h1 className="text-6xl font-bold text-white tracking-tight leading-tight">
                    {hoveredApp.name}
                  </h1>

                  {/* App Type as Tagline */}
                  <p className="text-xl text-primary-400 font-medium">
                    {hoveredApp.type === 'component'
                      ? 'Built-in Application'
                      : hoveredApp.type === 'iframe'
                        ? 'Web Application'
                        : 'Static Application'}
                  </p>

                  {/* Description - Supports Long Text */}
                  <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    <p className="text-base text-white/60 leading-relaxed">
                      {hoveredApp.description || 'No description available'}
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {hoveredApp.pinnedToTaskbar && (
                      <span className="px-3 py-1.5 bg-primary-500/20 text-primary-300 border border-primary-500/40 rounded-full text-sm font-medium flex items-center gap-2">
                        <Icons.Pin className="w-4 h-4" />
                        Pinned to Taskbar
                      </span>
                    )}
                    {hoveredApp.pinnedToDesktop && (
                      <span className="px-3 py-1.5 bg-tertiary-500/20 text-tertiary-300 border border-tertiary-500/40 rounded-full text-sm font-medium flex items-center gap-2">
                        <Icons.Monitor className="w-4 h-4" />
                        Pinned to Desktop
                      </span>
                    )}
                  </div>

                  {/* URL if available */}
                  {hoveredApp.url && (
                    <div className="flex items-center gap-2 text-white/40 text-sm pt-2">
                      <Icons.Link className="w-4 h-4 text-secondary-400" />
                      <span className="truncate max-w-lg">{hoveredApp.url}</span>
                    </div>
                  )}
                </div>
              </div>
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
            <span className={`${SIZES[iconSize].text} text-center line-clamp-2 px-1 transition-all ${isHovered ? 'font-bold' : ''} ${
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
