import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { WindowState } from '../types';
import { BorderGlow } from './aceternity/ui/border-glow';
import { useTheme } from '../theme';
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
  const { theme } = useTheme();

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

  const Icon = getIcon(window.icon);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        const newX = e.clientX - dragOffset.x;
        const newY = Math.max(0, e.clientY - dragOffset.y);
        updateWindowPosition(window.id, { x: newX, y: newY });
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
  }, [isDragging, isResizing, dragOffset, window.id, window.isMaximized, updateWindowPosition, updateWindowSize]);

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

  // Get window config from theme
  const windowConfig = theme.components.Window;

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: Number(theme.transitions.duration.normal.replace('ms', '')) / 1000 }}
      className={`absolute flex flex-col overflow-hidden ${windowConfig.borderRadius} ${windowConfig.shadow} ${windowConfig.backdrop}`}
      style={{
        ...windowStyle,
        zIndex: window.zIndex,
        backgroundColor: theme.palette.glass.dark,
        borderWidth: windowConfig.border.width,
        borderColor: theme.palette.glass.border.dark,
      }}
      onMouseDown={() => bringToFront(window.id)}
    >
      {/* Border Glow Effect */}
      {windowConfig.glow.enabled && (
        <BorderGlow
          glowColor={windowConfig.glow.color}
          glowSize={windowConfig.glow.size}
          borderRadius={theme.borderRadius.lg}
          className="absolute inset-0 pointer-events-none"
        />
      )}

      {/* Window Header/Chrome */}
      <div
        ref={headerRef}
        onMouseDown={handleMouseDown}
        className={`flex items-center justify-between px-3 cursor-move select-none ${windowConfig.chrome.background} ${windowConfig.chrome.border}`}
        style={{ height: windowConfig.chrome.height }}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: theme.palette.text.primary }} />
          <span className="text-sm font-medium" style={{ color: theme.palette.text.primary }}>
            {window.title}
          </span>
        </div>

        {/* Window Control Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => minimizeWindow(window.id)}
            className="hover:bg-white/10"
          >
            <Icons.Minus className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => maximizeWindow(window.id)}
            className="hover:bg-white/10"
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
          >
            <Icons.X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Window Body */}
      <div
        className={`flex-1 overflow-hidden relative ${windowConfig.body.background}`}
      >
        {children}
      </div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        >
          <Icons.GripHorizontal className="w-3 h-3 text-gray-600 absolute bottom-0.5 right-0.5 rotate-45" />
        </div>
      )}
    </motion.div>
  );
}
