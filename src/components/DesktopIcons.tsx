import { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { App } from '../types';

const GRID_SIZE = 90; // Icon grid cell size (px)
const ICON_WIDTH = 80;
const ICON_HEIGHT = 90;

interface GridPosition {
  row: number;
  col: number;
}

export function DesktopIcons() {
  const { apps, openWindow, reorderApps } = useDesktopStore();
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || Icons.Square;
    return Icon;
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
  }, [draggingAppId, dragOffset, dragPosition, hoverIndex, containerHeight]);

  // Get apps in their display order (reordered if dragging)
  const displayApps = getReorderedApps();

  return (
    <div ref={containerRef} className="absolute inset-0 p-4 select-none">
      {displayApps.map((app, index) => {
        const Icon = getIcon(app.icon);
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
              zIndex: isDragging ? 1000 : 1,
              transition: isDragging ? 'none' : 'all 0.2s ease-out',
            }}
            onMouseDown={(e) => handleMouseDown(e, app.id, calculatedPos)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!isDragging) openWindow(app);
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg group ${
              isDragging ? 'bg-white/20' : 'hover:bg-white/10 active:bg-white/20'
            }`}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <Icon className="w-10 h-10 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-white text-xs text-center drop-shadow-lg line-clamp-2 px-1">
              {app.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
