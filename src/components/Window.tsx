import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useNotificationStore } from '../store/notificationStore';
import { WindowState } from '../types';
import { Button } from './ui/button';

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
  const [preMaximizeState, setPreMaximizeState] = useState<{ position: { x: number; y: number }; size: { width: number; height: number } } | null>(null);

  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    bringToFront
  } = useDesktopStore();

  const { addNotification } = useNotificationStore();

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
    const TASKBAR_HEIGHT = 48;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        const newX = e.clientX - dragOffset.x;
        const newY = Math.max(0, e.clientY - dragOffset.y);
        updateWindowPosition(window.id, { x: newX, y: newY });

        // Detect snap zones
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - TASKBAR_HEIGHT;

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
          const newWidth = Math.max(300, e.clientX - rect.left);
          const newHeight = Math.max(200, e.clientY - rect.top);
          updateWindowSize(window.id, { width: newWidth, height: newHeight });
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging && snapZone) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - TASKBAR_HEIGHT;

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

  if (window.isMinimized) return null;

  const windowStyle = window.isMaximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - 48px)' }
    : {
        left: `${window.position.x}px`,
        top: `${window.position.y}px`,
        width: `${window.size.width}px`,
        height: `${window.size.height}px`
      };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute flex flex-col"
      style={{
        ...windowStyle,
        zIndex: window.zIndex,
      }}
      onMouseDown={() => bringToFront(window.id)}
    >
      {/* Top gradient accent line - Netflix style */}
      <div className="w-full h-1 bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500 rounded-t shrink-0" />

      <div
        ref={windowRef}
        className="flex-1 bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-b border border-gray-700/50 border-t-0 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
      >
        {/* Window Header/Chrome */}
        <div
          ref={headerRef}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleTitlebarDoubleClick}
          className="flex items-center justify-between px-4 h-12 cursor-move select-none backdrop-blur-md bg-white/5 shrink-0"
        >
          <div className="flex items-center gap-2">
            {renderIcon(window.icon, window.customIcon, "w-4 h-4 text-primary-400")}
            <span className="text-sm font-medium text-white">
              {window.title}
            </span>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => minimizeWindow(window.id)}
              className="hover:bg-white/10 w-8 h-8"
            >
              <Icons.Minus className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => maximizeWindow(window.id)}
              className="hover:bg-white/10 w-8 h-8"
            >
              {window.isMaximized ? (
                <Icons.Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Icons.Square className="w-3.5 h-3.5" />
              )}
            </Button>

            <Button
              variant="ghostDanger"
              size="icon"
              onClick={() => closeWindow(window.id)}
              className="w-8 h-8"
            >
              <Icons.X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent shrink-0" />

        {/* Window Body */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>

        {/* Resize Handle */}
        {!window.isMaximized && (
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group"
          >
            <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-primary-400/30 group-hover:border-primary-400/60 transition-colors" />
          </div>
        )}
      </div>

      {/* Snap Zone Indicators */}
      {isDragging && snapZone && (
        <div className="fixed inset-0 pointer-events-none z-[9996]">
          {snapZone === 'left' && (
            <div className="absolute left-0 top-0 bottom-12 w-1/2 bg-primary-500/20 border-4 border-primary-400 border-dashed animate-pulse" />
          )}
          {snapZone === 'right' && (
            <div className="absolute right-0 top-0 bottom-12 w-1/2 bg-primary-500/20 border-4 border-primary-400 border-dashed animate-pulse" />
          )}
          {snapZone === 'top' && (
            <div className="absolute left-0 right-0 top-0 bottom-12 bg-primary-500/20 border-4 border-primary-400 border-dashed animate-pulse" />
          )}
        </div>
      )}
    </motion.div>
  );
}
