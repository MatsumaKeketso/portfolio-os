import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';

export function Taskbar() {
  const {
    apps,
    windows,
    isStartMenuOpen,
    toggleStartMenu,
    openWindow,
    minimizeWindow,
    systemPreferences,
  } = useDesktopStore();
  const [time, setTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-hide taskbar functionality
  useEffect(() => {
    if (!systemPreferences.autoHideTaskbar) {
      setIsVisible(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { taskbarPosition } = systemPreferences;
      const threshold = 5; // pixels from edge to trigger show

      if (taskbarPosition === 'bottom' && e.clientY >= window.innerHeight - threshold) {
        setIsVisible(true);
      } else if (taskbarPosition === 'top' && e.clientY <= threshold) {
        setIsVisible(true);
      } else if (taskbarPosition === 'left' && e.clientX <= threshold) {
        setIsVisible(true);
      } else if (taskbarPosition === 'right' && e.clientX >= window.innerWidth - threshold) {
        setIsVisible(true);
      } else {
        // Only hide if mouse is far from taskbar area
        const hideThreshold = 100;
        if (
          (taskbarPosition === 'bottom' && e.clientY < window.innerHeight - hideThreshold) ||
          (taskbarPosition === 'top' && e.clientY > hideThreshold) ||
          (taskbarPosition === 'left' && e.clientX > hideThreshold) ||
          (taskbarPosition === 'right' && e.clientX < window.innerWidth - hideThreshold)
        ) {
          setIsVisible(false);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [systemPreferences.autoHideTaskbar, systemPreferences.taskbarPosition]);

  const pinnedApps = apps.filter(app => app.pinnedToTaskbar);
  const openApps = windows.filter(w => !w.isMinimized);

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

  // Calculate taskbar classes based on system preferences
  const getTaskbarClasses = () => {
    const { taskbarPosition, taskbarSize } = systemPreferences;

    // Position classes
    const positionClasses = {
      top: 'top-0 left-0 right-0 flex-row',
      bottom: 'bottom-0 left-0 right-0 flex-row',
      left: 'left-0 top-0 bottom-0 flex-col',
      right: 'right-0 top-0 bottom-0 flex-col',
    };

    // Size classes
    const sizeClasses = {
      horizontal: {
        small: 'h-10',
        medium: 'h-12',
        large: 'h-16',
      },
      vertical: {
        small: 'w-12',
        medium: 'w-16',
        large: 'w-20',
      },
    };

    const isVertical = taskbarPosition === 'left' || taskbarPosition === 'right';
    const sizeClass = isVertical ? sizeClasses.vertical[taskbarSize] : sizeClasses.horizontal[taskbarSize];

    // Border classes
    const borderClasses = {
      top: 'border-b',
      bottom: 'border-t',
      left: 'border-r',
      right: 'border-l',
    };

    return `fixed ${positionClasses[taskbarPosition]} ${sizeClass} ${borderClasses[taskbarPosition]} bg-gray-900/70 backdrop-blur-md border-white/10 flex items-center justify-between px-2 z-[10000]`;
  };

  const isVertical = systemPreferences.taskbarPosition === 'left' || systemPreferences.taskbarPosition === 'right';

  // Calculate transform for auto-hide
  const getAutoHideTransform = () => {
    if (!systemPreferences.autoHideTaskbar || isVisible) return 'none';

    const { taskbarPosition } = systemPreferences;
    if (taskbarPosition === 'bottom') return 'translateY(100%)';
    if (taskbarPosition === 'top') return 'translateY(-100%)';
    if (taskbarPosition === 'left') return 'translateX(-100%)';
    if (taskbarPosition === 'right') return 'translateX(100%)';
    return 'none';
  };

  return (
    <div
      className={getTaskbarClasses()}
      style={{
        transform: getAutoHideTransform(),
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <div className={`flex items-center gap-1 ${isVertical ? 'flex-col' : 'flex-row'}`}>
        <button
          onClick={toggleStartMenu}
          className={`w-10 h-10 rounded flex items-center justify-center transition-all ${isStartMenuOpen ? 'bg-primary-600' : 'hover:bg-white/10'
            }`}
        >
          <Icons.Grid3x3 className="w-5 h-5 text-white" />
        </button>

        <div className={isVertical ? 'h-px w-6 bg-gray-700 my-1' : 'w-px h-6 bg-gray-700 mx-1'} />

        {pinnedApps.map((app) => {
          const isOpen = windows.some(w => w.appId === app.id);

          return (
            <button
              key={app.id}
              onClick={() => {
                const window = windows.find(w => w.appId === app.id);
                if (window) {
                  minimizeWindow(window.id);
                } else {
                  openWindow(app);
                }
              }}
              className={`w-10 h-10 rounded flex items-center justify-center transition-all relative ${isOpen ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              title={app.name}
            >
              {renderIcon(app.icon, app.customIcon, "w-5 h-5 text-white")}
              {isOpen && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}

        {openApps.filter(w => !pinnedApps.some(app => app.id === w.appId)).map((window) => {
          return (
            <button
              key={window.id}
              onClick={() => minimizeWindow(window.id)}
              className="w-10 h-10 rounded flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all relative"
              title={window.title}
            >
              {renderIcon(window.icon, window.customIcon, "w-5 h-5 text-white")}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
            </button>
          );
        })}
      </div>

      <div className={`flex items-center gap-3 ${isVertical ? 'flex-col' : 'flex-row'}`}>
        <div className={`flex items-center gap-2 text-white text-xs ${isVertical ? 'flex-col' : 'flex-row'}`}>
          <Icons.Wifi className="w-4 h-4" />
          <Icons.Volume2 className="w-4 h-4" />
        </div>
        <div className={`text-white text-xs ${isVertical ? 'text-center' : 'text-right'}`}>
          <div className="font-medium">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-[10px] opacity-70">{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>
      </div>
    </div>
  );
}
