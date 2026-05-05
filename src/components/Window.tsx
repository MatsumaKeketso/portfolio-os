import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { WindowState } from '../types';
import { cn } from '../lib/utils';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { ContextMenuItemDef, MenuGroup, sortAndSeparate } from '../lib/contextMenuRegistry';

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

interface WindowProps {
  window: WindowState;
  children?: React.ReactNode;
}

export function Window({ window, children }: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapZone, setSnapZone] = useState<'left' | 'right' | 'top' | null>(null);
  const [_preMaximizeState, setPreMaximizeState] = useState<{ position: { x: number; y: number }; size: { width: number; height: number } } | null>(null);
  const [titleBarMenu, setTitleBarMenu] = useState<{ x: number; y: number } | null>(null);

  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    bringToFront
  } = useDesktopStore();

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || Icons.Square;
    return Icon;
  };

  // Render icon - either custom image or lucide icon
  const renderIcon = (iconName: string, customIcon: string | undefined, className: string) => {
    if (customIcon) {
      return (
        <img
          src={customIcon}
          alt=""
          className={className}
          style={{ objectFit: 'contain' }}
        />
      );
    }
    const Icon = getIcon(iconName);
    return <Icon className={className} />;
  };

  useEffect(() => {
    const SNAP_THRESHOLD = 20; // pixels from edge to trigger snap
    const TASKBAR_HEIGHT = 72; // floating island: 12px bottom gap + 48px height + 12px clearance

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        const newX = e.clientX - dragOffset.x;
        const newY = Math.max(0, e.clientY - dragOffset.y);
        updateWindowPosition(window.id, { x: newX, y: newY });

        // Detect snap zones
        const screenWidth = globalThis.window.innerWidth;

        if (e.clientX <= SNAP_THRESHOLD) {
          setSnapZone('left');
        } else if (e.clientX >= screenWidth - SNAP_THRESHOLD) {
          setSnapZone('right');
        } else if (e.clientY <= SNAP_THRESHOLD) {
          setSnapZone('top');
        } else {
          setSnapZone(null);
        }
      }

      if (isResizing && !window.isMaximized) {
        const rect = windowRef.current?.getBoundingClientRect();
        if (rect) {
          const minW = window.minSize?.width ?? 300;
          const minH = window.minSize?.height ?? 200;
          const newWidth = Math.max(minW, e.clientX - rect.left);
          const newHeight = Math.max(minH, e.clientY - rect.top);
          updateWindowSize(window.id, { width: newWidth, height: newHeight });
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging && snapZone) {
        const screenWidth = globalThis.window.innerWidth;
        const screenHeight = globalThis.window.innerHeight - TASKBAR_HEIGHT;

        // Save current state before snapping
        if (!window.isMaximized) {
          setPreMaximizeState({
            position: window.position,
            size: window.size
          });
        }

        // Apply snap
        if (snapZone === 'top') {
          // Maximize
          maximizeWindow(window.id);
        } else if (snapZone === 'left') {
          // Snap to left half
          updateWindowPosition(window.id, { x: 0, y: 0 });
          updateWindowSize(window.id, { width: screenWidth / 2, height: screenHeight });
        } else if (snapZone === 'right') {
          // Snap to right half
          updateWindowPosition(window.id, { x: screenWidth / 2, y: 0 });
          updateWindowSize(window.id, { width: screenWidth / 2, height: screenHeight });
        }

        setSnapZone(null);
      }

      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, snapZone, window.id, window.isMaximized, window.position, window.size, updateWindowPosition, updateWindowSize, maximizeWindow]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === headerRef.current || headerRef.current?.contains(e.target as Node)) {
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        setIsDragging(true);
        bringToFront(window.id);
      }
    }
  };

  const handleTitlebarDoubleClick = () => {
    maximizeWindow(window.id);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    bringToFront(window.id);
  };

  const handleTitleBarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTitleBarMenu({ x: e.clientX, y: e.clientY });
  };

  const getTitleBarMenuDefs = (): ContextMenuItemDef[] => [
    ...(window.isMaximized
      ? [{
          id: 'restore',
          label: 'Restore',
          icon: Icons.Minimize2,
          group: 'primary' as MenuGroup,
          action: () => maximizeWindow(window.id),
        }]
      : []),
    {
      id: 'minimize',
      label: 'Minimize',
      icon: Icons.Minus,
      group: 'primary',
      action: () => minimizeWindow(window.id),
    },
    ...(!window.isMaximized
      ? [{
          id: 'maximize',
          label: 'Maximize',
          icon: Icons.Square,
          group: 'primary' as MenuGroup,
          action: () => maximizeWindow(window.id),
        }]
      : []),
    {
      id: 'close',
      label: 'Close',
      icon: Icons.X,
      group: 'danger' as MenuGroup,
      danger: true,
      shortcut: 'Alt+F4',
      action: () => closeWindow(window.id),
    },
  ];

  if (window.isMinimized) return null;

  const windowStyle = window.isMaximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - 72px)' }
    : {
      left: `${window.position.x}px`,
      top: `${window.position.y}px`,
      width: `${window.size.width}px`,
      height: `${window.size.height}px`
    };

  const surfaceMode = window.surfaceMode ?? 'utilityDark';
  const isContent = surfaceMode === 'content';

  // Window body background based on surface mode
  const bodyBg = {
    content: 'bg-os-canvas',
    utilityDark: 'bg-background-chrome',
    immersive: 'bg-black',
    iframe: 'bg-white',
    glass: 'bg-background-chrome',
  }[surfaceMode];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 16 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute flex flex-col rounded-lg overflow-hidden"
      style={{
        ...windowStyle,
        zIndex: window.zIndex,
        boxShadow: '0 24px 60px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.28)',
      }}
      onMouseDown={() => bringToFront(window.id)}
    >
      <div
        ref={windowRef}
        className="flex-1 flex flex-col overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Title bar — always dark OS chrome */}
        <div
          ref={headerRef}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleTitlebarDoubleClick}
          onContextMenu={handleTitleBarContextMenu}
          className="flex items-center justify-between px-3 py-0 h-10 cursor-move select-none shrink-0 bg-os-ink-950"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {renderIcon(window.icon, window.customIcon, 'w-[14px] h-[14px] text-white/40 flex-shrink-0')}
            <span className="text-[13px] font-medium text-white/70 truncate leading-none">
              {window.title}
            </span>
          </div>

          {/* Window controls */}
          <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
            <button
              onClick={() => minimizeWindow(window.id)}
              className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:bg-white/[0.08] hover:text-white/80 transition-colors"
            >
              <Icons.Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => maximizeWindow(window.id)}
              className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:bg-white/[0.08] hover:text-white/80 transition-colors"
            >
              {window.isMaximized
                ? <Icons.Minimize2 className="w-3 h-3" />
                : <Icons.Square className="w-3 h-3" />}
            </button>
            <button
              onClick={() => closeWindow(window.id)}
              className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <Icons.X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Window body */}
        <div className={cn('flex-1 overflow-hidden relative', bodyBg)}>
          {children}
        </div>

        {/* Resize handle */}
        {!window.isMaximized && (
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group z-10"
          >
            <div className={cn(
              'absolute bottom-1 right-1 w-2.5 h-2.5 border-r-2 border-b-2 transition-colors',
              isContent ? 'border-black/20 group-hover:border-black/40' : 'border-white/[0.16] group-hover:border-white/[0.32]',
            )} />
          </div>
        )}
      </div>

      {/* Title bar context menu */}
      <AnimatePresence>
        {titleBarMenu && (
          <ContextMenu
            x={titleBarMenu.x}
            y={titleBarMenu.y}
            items={toContextMenuItems(getTitleBarMenuDefs())}
            onClose={() => setTitleBarMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Snap zone indicators */}
      {isDragging && snapZone && (
        <div className="fixed inset-0 pointer-events-none z-[9996]">
          {snapZone === 'left' && (
            <div className="absolute left-0 top-0 bottom-[72px] w-1/2 bg-white/[0.06] border-2 border-white/[0.16] border-dashed" />
          )}
          {snapZone === 'right' && (
            <div className="absolute right-0 top-0 bottom-[72px] w-1/2 bg-white/[0.06] border-2 border-white/[0.16] border-dashed" />
          )}
          {snapZone === 'top' && (
            <div className="absolute left-0 right-0 top-0 bottom-[72px] bg-white/[0.06] border-2 border-white/[0.16] border-dashed" />
          )}
        </div>
      )}
    </motion.div>
  );
}
