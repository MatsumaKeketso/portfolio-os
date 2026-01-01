import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { App } from '../types';

interface GridPosition {
  row: number;
  col: number;
}

interface DesktopIconsProps {
  iconSize: 'small' | 'medium' | 'large';
  sortBy: 'name' | 'type' | 'date';
  taskbarPosition: 'top' | 'bottom' | 'left' | 'right';
  taskbarSize: 'small' | 'medium' | 'large';
}

export function DesktopIcons({
  iconSize = 'medium',
  sortBy = 'name',
  taskbarPosition = 'bottom',
  taskbarSize = 'medium'
}: DesktopIconsProps) {
  // Dynamic sizes based on iconSize prop
  const SIZES = {
    small: { grid: 70, width: 60, height: 70, icon: 8, text: 'text-[10px]' },
    medium: { grid: 90, width: 80, height: 90, icon: 10, text: 'text-xs' },
    large: { grid: 110, width: 100, height: 110, icon: 12, text: 'text-sm' },
  };

  const GRID_SIZE = SIZES[iconSize].grid;
  const ICON_WIDTH = SIZES[iconSize].width;
  const ICON_HEIGHT = SIZES[iconSize].height;
  const { apps, openWindow, reorderApps } = useDesktopStore();
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoveredApp, setHoveredApp] = useState<App | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

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

  // Calculate taskbar offset
  const getTaskbarOffset = () => {
    const sizeMap = {
      small: { horizontal: 40, vertical: 48 },
      medium: { horizontal: 48, vertical: 64 },
      large: { horizontal: 64, vertical: 80 },
    };

    const isVertical = taskbarPosition === 'left' || taskbarPosition === 'right';
    return isVertical ? sizeMap[taskbarSize].vertical : sizeMap[taskbarSize].horizontal;
  };

  const taskbarOffset = getTaskbarOffset();

  // Calculate grid dimensions accounting for taskbar
  const getGridDimensions = () => {
    const isVertical = taskbarPosition === 'left' || taskbarPosition === 'right';
    const padding = 32;

    if (isVertical) {
      // Vertical taskbar - reduce available width
      const availableHeight = containerHeight - padding;
      const maxRows = Math.floor(availableHeight / GRID_SIZE);
      return { maxRows };
    } else {
      // Horizontal taskbar - reduce available height
      const availableHeight = containerHeight - padding - taskbarOffset;
      const maxRows = Math.floor(availableHeight / GRID_SIZE);
      return { maxRows };
    }
  };

  // Convert index to grid position (column-first layout like Windows)
  const indexToGridPosition = (index: number): GridPosition => {
    const { maxRows } = getGridDimensions();
    const row = index % maxRows;
    const col = Math.floor(index / maxRows);
    return { row, col };
  };

  // Convert grid position to pixel position accounting for taskbar
  const gridToPixels = (gridPos: GridPosition): { x: number; y: number } => {
    const basePadding = 16;
    let x = gridPos.col * GRID_SIZE + basePadding;
    let y = gridPos.row * GRID_SIZE + basePadding;

    // Adjust starting position based on taskbar position
    if (taskbarPosition === 'left') {
      x += taskbarOffset;
    } else if (taskbarPosition === 'top') {
      y += taskbarOffset;
    }

    return { x, y };
  };

  // Convert pixel position to index accounting for taskbar
  const pixelsToIndex = (x: number, y: number): number => {
    const { maxRows } = getGridDimensions();
    const basePadding = 16;

    // Adjust for taskbar offset
    let adjustedX = x - basePadding;
    let adjustedY = y - basePadding;

    if (taskbarPosition === 'left') {
      adjustedX -= taskbarOffset;
    } else if (taskbarPosition === 'top') {
      adjustedY -= taskbarOffset;
    }

    const col = Math.max(0, Math.floor(adjustedX / GRID_SIZE));
    const row = Math.max(0, Math.floor(adjustedY / GRID_SIZE));
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

    const currentIndex = desktopApps.findIndex(app => app.id === draggingAppId);
    const otherApps = desktopApps.filter(app => app.id !== draggingAppId);

    // Insert at hover index
    const reordered = [...otherApps];
    const targetIndex = Math.min(hoverIndex, reordered.length);
    reordered.splice(targetIndex, 0, draggedApp);

    return reordered;
  };

  const handleMouseDown = (e: React.MouseEvent, appId: string, currentPos: { x: number; y: number }) => {
    e.preventDefault();
    setDraggingAppId(appId);
    setDragOffset({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    });
    setDragPosition(currentPos);
    setHoverIndex(null);
  };

  useEffect(() => {
    if (!draggingAppId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setDragPosition({ x: newX, y: newY });

      // Calculate hover index
      const index = pixelsToIndex(newX + ICON_WIDTH / 2, newY + ICON_HEIGHT / 2);
      setHoverIndex(index);
    };

    const handleMouseUp = () => {
      if (draggingAppId && hoverIndex !== null) {
        // Get the reordered apps and update the store
        const reordered = getReorderedApps();
        reorderApps(reordered);
      }
      setDraggingAppId(null);
      setHoverIndex(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingAppId, dragOffset, dragPosition, hoverIndex, containerHeight, taskbarPosition, taskbarSize, taskbarOffset]);

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

  // Smart positioning for hover card to avoid screen edges
  const getSmartCardPosition = (iconPos: { x: number; y: number }) => {
    const CARD_WIDTH = 340;
    const CARD_HEIGHT = 400; // Approximate card height
    const CARD_MARGIN = 24; // Spacing from icon
    const SCREEN_PADDING = 16; // Min distance from screen edge

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let cardX = iconPos.x + ICON_WIDTH + CARD_MARGIN; // Default: right of icon
    let cardY = iconPos.y - 20; // Default: slightly above icon

    // Horizontal positioning
    const spaceOnRight = viewportWidth - (iconPos.x + ICON_WIDTH);
    const spaceOnLeft = iconPos.x;

    if (spaceOnRight < CARD_WIDTH + CARD_MARGIN + SCREEN_PADDING) {
      // Not enough space on right, try left
      if (spaceOnLeft > CARD_WIDTH + CARD_MARGIN + SCREEN_PADDING) {
        cardX = iconPos.x - CARD_WIDTH - CARD_MARGIN;
      } else {
        // Not enough space on either side, center it
        cardX = Math.max(SCREEN_PADDING, Math.min(
          viewportWidth - CARD_WIDTH - SCREEN_PADDING,
          iconPos.x + ICON_WIDTH / 2 - CARD_WIDTH / 2
        ));
      }
    }

    // Vertical positioning
    const spaceBelow = viewportHeight - iconPos.y - 48; // 48 = taskbar height
    const spaceAbove = iconPos.y;

    if (cardY + CARD_HEIGHT > viewportHeight - 48 - SCREEN_PADDING) {
      // Card would overflow bottom, try to adjust
      if (spaceAbove > CARD_HEIGHT + SCREEN_PADDING) {
        // Show above icon if there's space
        cardY = iconPos.y - CARD_HEIGHT + ICON_HEIGHT;
      } else {
        // Not enough space above or below, align to bottom
        cardY = viewportHeight - 48 - CARD_HEIGHT - SCREEN_PADDING;
      }
    }

    // Ensure card never goes above screen
    cardY = Math.max(SCREEN_PADDING, cardY);

    return { x: cardX, y: cardY };
  };

  return (
    <div ref={containerRef} className="absolute inset-0 p-4 select-none">
      {/* No overlay - just reduce opacity of other icons */}

      {/* Netflix-Style Preview Card */}
      <AnimatePresence>
        {hoveredApp && hoverPosition && (() => {
          const smartPos = getSmartCardPosition(hoverPosition);
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-20 pointer-events-none"
              style={{
                left: `${smartPos.x}px`,
                top: `${smartPos.y}px`,
              }}
            >
            {/* Netflix-style card */}
            <div className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 w-[340px]">
              {/* Top gradient accent - Updated to primary/tertiary colors */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500" />

              {/* Card content */}
              <div className="p-6">
                {/* Logo/Icon at top */}
                <div className="flex justify-center mb-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-tertiary-500/30 blur-2xl" />
                    {renderIcon(hoveredApp, "relative w-16 h-16 text-white drop-shadow-2xl")}
                  </div>
                </div>

                {/* App name - Netflix style */}
                <h3 className="text-white text-2xl font-bold text-center mb-3 tracking-tight">
                  {hoveredApp.name}
                </h3>

                {/* Description */}
                <p className="text-gray-300 text-sm text-center leading-relaxed mb-5 min-h-[40px]">
                  {hoveredApp.description || 'No description available'}
                </p>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4" />

                {/* Details section */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-gray-400 text-xs">
                    <Icons.Layers className="w-4 h-4 text-primary-400" />
                    <span>{hoveredApp.type === 'component' ? 'Built-in Application' : hoveredApp.type === 'iframe' ? 'Web Application' : 'Static Application'}</span>
                  </div>

                  {hoveredApp.url && (
                    <div className="flex items-center gap-2.5 text-gray-400 text-xs">
                      <Icons.Link className="w-4 h-4 text-tertiary-400" />
                      <span className="truncate">{hoveredApp.url}</span>
                    </div>
                  )}

                  {/* Badges */}
                  {(hoveredApp.pinnedToTaskbar || hoveredApp.pinnedToDesktop) && (
                    <div className="flex gap-2 pt-2">
                      {hoveredApp.pinnedToTaskbar && (
                        <span className="px-2.5 py-1 bg-primary-500/15 text-primary-300 border border-primary-500/30 rounded-full text-xs font-medium flex items-center gap-1.5">
                          <Icons.Pin className="w-3 h-3" />
                          Taskbar
                        </span>
                      )}
                      {hoveredApp.pinnedToDesktop && (
                        <span className="px-2.5 py-1 bg-tertiary-500/15 text-tertiary-300 border border-tertiary-500/30 rounded-full text-xs font-medium flex items-center gap-1.5">
                          <Icons.Monitor className="w-3 h-3" />
                          Desktop
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Call to action */}
                <div className="mt-5 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                    <Icons.MousePointerClick className="w-4 h-4" />
                    <span>Double-click to open</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          );
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
              isDragging ? 'bg-white/20' : isHovered ? 'bg-white/20' : 'hover:bg-white/10 active:bg-white/20'
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
                className={`text-white drop-shadow-lg transition-transform ${
                  isHovered ? 'scale-110' : 'group-hover:scale-110'
                }`}
                style={{
                  width: `${SIZES[iconSize].icon * 4}px`,
                  height: `${SIZES[iconSize].icon * 4}px`,
                }}
              >
                {renderIcon(app, "w-full h-full")}
              </div>
            </div>
            <span className={`text-white ${SIZES[iconSize].text} text-center drop-shadow-lg line-clamp-2 px-1 transition-all ${
              isHovered ? 'font-bold' : ''
            }`}>
              {app.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
