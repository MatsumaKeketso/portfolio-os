import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { WindowState } from '../types';

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

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="absolute bg-gray-900/95 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl border border-gray-700/50 flex flex-col"
      style={{
        ...windowStyle,
        zIndex: window.zIndex,
      }}
      onMouseDown={() => bringToFront(window.id)}
    >
      <div
        ref={headerRef}
        onMouseDown={handleMouseDown}
        className="h-10 bg-gray-800/80 border-b border-gray-700/50 flex items-center justify-between px-3 cursor-move select-none"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">{window.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => minimizeWindow(window.id)}
            className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-all"
          >
            <Icons.Minus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => maximizeWindow(window.id)}
            className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-all"
          >
            {window.isMaximized ? (
              <Icons.Minimize2 className="w-3.5 h-3.5 text-white" />
            ) : (
              <Icons.Square className="w-3.5 h-3.5 text-white" />
            )}
          </button>
          <button
            onClick={() => closeWindow(window.id)}
            className="w-8 h-8 rounded hover:bg-red-500 flex items-center justify-center transition-all"
          >
            <Icons.X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white relative">
        {children}
      </div>

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
