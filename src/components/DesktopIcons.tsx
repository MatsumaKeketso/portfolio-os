import { useState, useEffect, useRef } from 'react';
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
      {/* Simple Tooltip - Performance Optimized */}
      {hoveredApp && hoverPosition && !draggingAppId && (
        <div
          className="fixed z-50 pointer-events-none transition-opacity duration-200"
          style={{
            left: `${hoverPosition.x + ICON_WIDTH + 8}px`,
            top: `${hoverPosition.y}px`,
          }}
        >
          <div className="bg-gray-900/95 border border-gray-700 rounded-lg shadow-xl p-3 max-w-xs">
            <div className="flex items-center gap-2 mb-1.5">
              {renderIcon(hoveredApp, "w-5 h-5 text-primary-400 flex-shrink-0")}
              <p className="font-semibold text-white text-sm">{hoveredApp.name}</p>
            </div>
            {hoveredApp.description && (
              <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                {hoveredApp.description}
              </p>
            )}
          </div>
        </div>
      )}
      {displayApps.map((app, index) => {
        const isDragging = draggingAppId === app.id;

        // Calculate position based on index
        const gridPos = indexToGridPosition(index);
        const calculatedPos = gridToPixels(gridPos);

        // Use drag position if dragging, otherwise use calculated position
        const position = isDragging ? dragPosition : calculatedPos;

        return (
          <button
            key={app.id}
            style={{
              position: 'absolute',
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${ICON_WIDTH}px`,
              height: `${ICON_HEIGHT}px`,
              cursor: isDragging ? 'grabbing' : 'pointer',
              zIndex: isDragging ? 1000 : 10,
              transition: isDragging ? 'none' : 'all 0.15s ease-out',
            }}
            onMouseDown={(e) => handleMouseDown(e, app.id, calculatedPos)}
            onMouseEnter={() => handleIconHover(app, position)}
            onMouseLeave={handleIconLeave}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!isDragging) openWindow(app);
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg group ${isDragging ? 'bg-white/20' : 'hover:bg-white/10 active:bg-white/15'
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
                className="text-white drop-shadow-lg group-hover:scale-105 transition-transform duration-150"
                style={{
                  width: `${SIZES[iconSize].icon * 4}px`,
                  height: `${SIZES[iconSize].icon * 4}px`,
                }}
              >
                {renderIcon(app, "w-full h-full")}
              </div>
            </div>
            <span className={`text-white ${SIZES[iconSize].text} text-center drop-shadow-lg line-clamp-2 px-1`}>
              {app.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
