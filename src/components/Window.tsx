import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { WindowState } from '../types';
import { AppIcon } from '../lib/AppIcon';
import { cn } from '../lib/utils';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { ContextMenuItemDef, ContextPermission, MenuGroup, resolveAndSort } from '../lib/contextMenuRegistry';
import { useAuthStore } from '../store/authStore';
import { WindowHeaderStrip } from './TaskbarStrip';
import { WindowEdgeGlow } from './WindowEdgeGlow';
import { Typography } from './ui/Typography';

const toContextMenuItems = (defs: ContextMenuItemDef[], permissions: ContextPermission[]): ContextMenuItem[] =>
  resolveAndSort(defs, permissions).map((item) => ({
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
  const { isAuthenticated, isAdmin } = useAuthStore();
  const menuPermissions: ContextPermission[] = [
    'visitor',
    ...(isAuthenticated ? ['owner' as ContextPermission] : []),
    ...(isAdmin ? ['admin' as ContextPermission] : []),
  ];
  const outerWindowRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<{
    origin: { x: number; y: number };
    latest: { x: number; y: number };
  } | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapZone, setSnapZone] = useState<'left' | 'right' | 'top' | null>(null);
  const [_preMaximizeState, setPreMaximizeState] = useState<{ position: { x: number; y: number }; size: { width: number; height: number } } | null>(null);
  const [titleBarMenu, setTitleBarMenu] = useState<{ x: number; y: number } | null>(null);
  const [taskbarBounds, setTaskbarBounds] = useState<{
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  } | null>(null);
  const [viewportSize, setViewportSize] = useState({
    width: typeof globalThis.window === 'undefined' ? 0 : globalThis.window.innerWidth,
    height: typeof globalThis.window === 'undefined' ? 0 : globalThis.window.innerHeight,
  });

  const {
    apps,
    windows,
    systemPreferences,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    bringToFront
  } = useDesktopStore();

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: globalThis.window.innerWidth,
        height: globalThis.window.innerHeight,
      });
    };
    updateViewportSize();
    globalThis.window.addEventListener('resize', updateViewportSize);
    return () => globalThis.window.removeEventListener('resize', updateViewportSize);
  }, []);

  useEffect(() => {
    if (!window.isMaximized) return;
    const taskbar = document.getElementById('genos-taskbar');
    if (!taskbar) return;

    const updateBounds = () => {
      const rect = taskbar.getBoundingClientRect();
      setTaskbarBounds({
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });
    };

    updateBounds();
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(taskbar);
    globalThis.window.addEventListener('resize', updateBounds);

    return () => {
      resizeObserver.disconnect();
      globalThis.window.removeEventListener('resize', updateBounds);
    };
  }, [window.isMaximized]);

  const renderIcon = (iconName: string, customIcon: string | undefined, className: string) => (
    <AppIcon icon={iconName} customIcon={customIcon} className={className} />
  );

  useEffect(() => {
    const SNAP_THRESHOLD = 20; // pixels from edge to trigger snap
    const TASKBAR_HEIGHT = 56; // floating island clearance for snapped windows

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        const newX = e.clientX - dragOffset.x;
        const newY = Math.max(0, e.clientY - dragOffset.y);
        dragPreviewRef.current = {
          origin: dragPreviewRef.current?.origin ?? window.position,
          latest: { x: newX, y: newY },
        };

        const deltaX = newX - dragPreviewRef.current.origin.x;
        const deltaY = newY - dragPreviewRef.current.origin.y;
        if (outerWindowRef.current) {
          outerWindowRef.current.style.translate = `${deltaX}px ${deltaY}px`;
        }

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
      const dragPreview = dragPreviewRef.current;
      if (outerWindowRef.current) {
        outerWindowRef.current.style.translate = '';
        outerWindowRef.current.style.willChange = '';
      }
      dragPreviewRef.current = null;

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
      } else if (isDragging && dragPreview) {
        updateWindowPosition(window.id, dragPreview.latest);
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
        dragPreviewRef.current = {
          origin: window.position,
          latest: window.position,
        };
        if (outerWindowRef.current) {
          outerWindowRef.current.style.willChange = 'translate';
        }
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

  const focusedWindowId = windows
    .filter((item) => !item.isMinimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0]?.id ?? null;
  const isFocusedWindow = focusedWindowId === window.id;
  const openTaskbarWindowCount = windows.filter((w) => !w.isMinimized && !apps.some((app) => app.id === w.appId && app.pinnedToTaskbar)).length;
  const taskbarIconCount = apps.filter((app) => app.pinnedToTaskbar).length + openTaskbarWindowCount;
  const estimatedTaskbarWidth = Math.max(260, 154 + taskbarIconCount * 44);
  const isBottomTaskbar = systemPreferences.taskbarPosition === 'bottom';
  const showTaskbarCutout = window.isMaximized && isBottomTaskbar;
  const viewportWidth = viewportSize.width || 1;
  const viewportHeight = viewportSize.height || 1;
  const taskbarGap = 8;
  const taskbarRadius = 16;
  const cutoutRadius = taskbarRadius + taskbarGap;
  const fallbackCutoutWidth = estimatedTaskbarWidth + taskbarGap * 2;
  const fallbackCutoutHeight = 52 + 12 + taskbarGap;
  const cutoutLeft = Math.max(
    0,
    taskbarBounds ? Math.floor(taskbarBounds.left - taskbarGap) : viewportWidth / 2 - fallbackCutoutWidth / 2,
  );
  const cutoutRight = Math.min(
    viewportWidth,
    taskbarBounds ? Math.ceil(taskbarBounds.right + taskbarGap) : viewportWidth / 2 + fallbackCutoutWidth / 2,
  );
  const cutoutTop = Math.max(
    0,
    taskbarBounds ? Math.floor(taskbarBounds.top - taskbarGap) : viewportHeight - fallbackCutoutHeight,
  );
  const taskbarCutoutWidth = cutoutRight - cutoutLeft;
  const cutoutHeight = viewportHeight - cutoutTop;
  const cutoutStrokeInset = 0.5;
  const cutoutStrokeLeft = cutoutStrokeInset;
  const cutoutStrokeRight = Math.max(cutoutStrokeInset, viewportWidth - cutoutStrokeInset);
  const cutoutStrokeTop = cutoutStrokeInset;
  const cutoutStrokeBottom = Math.max(cutoutStrokeInset, viewportHeight - cutoutStrokeInset);
  const cutoutStrokeStartX = Math.min(cutoutStrokeRight, cutoutRight + cutoutRadius);
  const cutoutStrokeEndX = Math.max(cutoutStrokeLeft, cutoutLeft - cutoutRadius);
  const roundedCutoutPath = [
    `M 0 0`,
    `H ${viewportWidth}`,
    `V ${viewportHeight}`,
    `H ${cutoutRight + cutoutRadius}`,
    `Q ${cutoutRight} ${viewportHeight} ${cutoutRight} ${viewportHeight - cutoutRadius}`,
    `V ${cutoutTop + cutoutRadius}`,
    `Q ${cutoutRight} ${cutoutTop} ${cutoutRight - cutoutRadius} ${cutoutTop}`,
    `H ${cutoutLeft + cutoutRadius}`,
    `Q ${cutoutLeft} ${cutoutTop} ${cutoutLeft} ${cutoutTop + cutoutRadius}`,
    `V ${viewportHeight - cutoutRadius}`,
    `Q ${cutoutLeft} ${viewportHeight} ${cutoutLeft - cutoutRadius} ${viewportHeight}`,
    `H 0`,
    `Z`,
  ].join(' ');
  const roundedCutoutBorderPath = [
    `M ${cutoutStrokeLeft} ${cutoutStrokeTop}`,
    `H ${cutoutStrokeRight}`,
    `V ${cutoutStrokeBottom}`,
    `H ${cutoutStrokeStartX}`,
    `Q ${cutoutRight} ${cutoutStrokeBottom} ${cutoutRight} ${viewportHeight - cutoutRadius}`,
    `V ${cutoutTop + cutoutRadius}`,
    `Q ${cutoutRight} ${cutoutTop} ${cutoutRight - cutoutRadius} ${cutoutTop}`,
    `H ${cutoutLeft + cutoutRadius}`,
    `Q ${cutoutLeft} ${cutoutTop} ${cutoutLeft} ${cutoutTop + cutoutRadius}`,
    `V ${viewportHeight - cutoutRadius}`,
    `Q ${cutoutLeft} ${cutoutStrokeBottom} ${cutoutStrokeEndX} ${cutoutStrokeBottom}`,
    `H ${cutoutStrokeLeft}`,
    `Z`,
  ].join(' ');
  const isCenteredReadingWindow = window.appId === 'cv';
  const readingWindowWidth = Math.min(980, Math.max(320, viewportWidth - 32));
  const readingWindowHeight = Math.max(520, viewportHeight - 96);

  const windowStyle = window.isMaximized
    ? isCenteredReadingWindow
      ? {
        left: `${Math.max(16, (viewportWidth - readingWindowWidth) / 2)}px`,
        top: '12px',
        width: `${readingWindowWidth}px`,
        height: `${readingWindowHeight}px`,
      }
      : {
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        clipPath: showTaskbarCutout
          ? `path("${roundedCutoutPath}")`
          : undefined,
      }
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
      ref={outerWindowRef}
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 16 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'absolute flex flex-col overflow-hidden bg-background-chrome shadow-os-window',
        // Persistent border — visible only when the window is focused. The
        // transparent fallback keeps the 1px border box so the cursor-reactive
        // glow ring stays anchored at the same inset across focus changes.
        // Brighter than the os-line-dark token so the line actually reads.
        showTaskbarCutout && !isCenteredReadingWindow
          ? 'border border-transparent'
          : isFocusedWindow
            ? 'border border-os-line-dark-hover'
            : 'border border-transparent',
        window.isMaximized && !isCenteredReadingWindow ? 'rounded-none' : 'rounded-lg',
      )}
      style={{
        ...windowStyle,
        zIndex: window.zIndex,
        ['--window-cutout-bottom' as string]: showTaskbarCutout && !isCenteredReadingWindow ? `${cutoutHeight}px` : '0px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.28)',
      }}
      onMouseDown={() => bringToFront(window.id)}
      data-os-window="true"
    >
      <WindowEdgeGlow
        active={isFocusedWindow}
        rounded={!window.isMaximized || isCenteredReadingWindow}
        cutout={
          showTaskbarCutout && !isCenteredReadingWindow
            ? {
                path: roundedCutoutBorderPath,
                viewportWidth,
                viewportHeight,
                left: cutoutLeft,
                right: cutoutRight,
                top: cutoutTop,
              }
            : undefined
        }
      />
      <div
        ref={windowRef}
        className="flex-1 flex flex-col overflow-hidden bg-background-chrome"
      >
        {/* Title bar — always dark OS chrome */}
        <div
          ref={headerRef}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleTitlebarDoubleClick}
          onContextMenu={handleTitleBarContextMenu}
          className="relative flex items-center justify-between overflow-visible px-3 py-0 h-10 cursor-move select-none shrink-0 bg-background-chrome border-b border-os-line-dark"
        >
          <WindowHeaderStrip active={isFocusedWindow} />
          <div className="relative z-10 flex items-center gap-2 min-w-0">
            {renderIcon(window.icon, window.customIcon, 'w-[14px] h-[14px] text-white/40 flex-shrink-0')}
            <Typography as="span" variant="windowTitle" tone="inverseMuted" truncate>
              {window.title}
            </Typography>
          </div>

          {/* Window controls */}
          <div className="relative z-10 flex items-center gap-0.5 flex-shrink-0 ml-2">
            <button
              onClick={() => minimizeWindow(window.id)}
              className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:bg-os-ink-800 hover:text-white/80 transition-colors"
            >
              <Icons.Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => maximizeWindow(window.id)}
              className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:bg-os-ink-800 hover:text-white/80 transition-colors"
            >
              {window.isMaximized
                ? <Icons.Minimize2 className="w-3 h-3" />
                : <Icons.Square className="w-3 h-3" />}
            </button>
            <button
              onClick={() => closeWindow(window.id)}
              className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:bg-error-subtle hover:text-fg-error transition-colors"
            >
              <Icons.X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Window body */}
        <div className={cn('flex-1 overflow-hidden relative', bodyBg)}>
          {surfaceMode !== 'iframe' && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0"
              animate={shouldReduceMotion
                ? { opacity: isFocusedWindow ? 0.16 : 0.05 }
                : {
                    opacity: isFocusedWindow ? 0.24 : 0.07,
                    backgroundPosition: isFocusedWindow
                      ? ['18% 8%', '82% 92%', '18% 8%']
                      : '50% 50%',
                  }}
              transition={shouldReduceMotion
                ? { duration: 0.2 }
                : {
                    opacity: { duration: 0.24 },
                    backgroundPosition: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
                  }}
              style={{
                backgroundImage: isFocusedWindow
                  ? 'radial-gradient(circle at 20% 12%, rgba(var(--color-primary), 0.36), transparent 34%), radial-gradient(circle at 86% 86%, rgba(var(--color-tertiary), 0.24), transparent 38%)'
                  : 'radial-gradient(circle at 50% 50%, rgba(var(--color-primary), 0.18), transparent 44%)',
                backgroundSize: '145% 145%',
              }}
            />
          )}
          <div className="relative z-10 h-full">
            {children}
          </div>
        </div>

        {showTaskbarCutout && !isCenteredReadingWindow && (
          <div
            className="pointer-events-none fixed bottom-0 z-[1] bg-os-ink-950/20 shadow-[0_-18px_50px_rgba(0,0,0,0.30)]"
            style={{
              left: `${cutoutLeft}px`,
              width: `${taskbarCutoutWidth}px`,
              height: `${cutoutHeight}px`,
              borderTopLeftRadius: `${cutoutRadius}px`,
              borderTopRightRadius: `${cutoutRadius}px`,
              borderBottomLeftRadius: `${cutoutRadius}px`,
              borderBottomRightRadius: `${cutoutRadius}px`,
            }}
          />
        )}

        {/* Resize handle */}
        {!window.isMaximized && (
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group z-10"
          >
            <div className={cn(
              'absolute bottom-1 right-1 w-2.5 h-2.5 border-r-2 border-b-2 transition-colors',
              isContent ? 'border-black/20 group-hover:border-black/40' : 'border-os-line-dark-hover group-hover:border-stroke-brand',
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
            items={toContextMenuItems(getTitleBarMenuDefs(), menuPermissions)}
            onClose={() => setTitleBarMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Snap zone indicators */}
      {isDragging && snapZone && (
        <div className="fixed inset-0 pointer-events-none z-[9996]">
          {snapZone === 'left' && (
            <div className="absolute left-0 top-0 bottom-14 w-1/2 bg-os-ink-950/20 border-2 border-os-line-dark-hover border-dashed" />
          )}
          {snapZone === 'right' && (
            <div className="absolute right-0 top-0 bottom-14 w-1/2 bg-os-ink-950/20 border-2 border-os-line-dark-hover border-dashed" />
          )}
          {snapZone === 'top' && (
            <div className="absolute left-0 right-0 top-0 bottom-14 bg-os-ink-950/20 border-2 border-os-line-dark-hover border-dashed" />
          )}
        </div>
      )}
    </motion.div>
  );
}
