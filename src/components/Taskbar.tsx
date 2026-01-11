import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { Button } from './ui/button';

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

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className={getTaskbarClasses()}>
      <div className={`flex items-center gap-1 ${isVertical ? 'flex-col' : 'flex-row'}`}>
        <Button
          onClick={toggleStartMenu}
          variant="taskbar"
          size="iconLg"
          data-active={isStartMenuOpen}
        >
          <Icons.Grid3x3 className="w-5 h-5" />
        </Button>

        <div className={isVertical ? 'h-px w-6 bg-gray-700 my-1' : 'w-px h-6 bg-gray-700 mx-1'} />

        {pinnedApps.map((app) => {
          const isOpen = windows.some(w => w.appId === app.id);

          return (
            <Button
              key={app.id}
              onClick={() => {
                const window = windows.find(w => w.appId === app.id);
                if (window) {
                  minimizeWindow(window.id);
                } else {
                  openWindow(app);
                }
              }}
              variant="taskbar"
              size="iconLg"
              data-active={isOpen}
              title={app.name}
            >
              {renderIcon(app.icon, app.customIcon, "w-5 h-5 text-white")}
              {isOpen && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
              )}
            </Button>
          );
        })}

        {openApps.filter(w => !pinnedApps.some(app => app.id === w.appId)).map((window) => {
          return (
            <Button
              key={window.id}
              onClick={() => minimizeWindow(window.id)}
              variant="taskbar"
              size="iconLg"
              data-active={true}
              title={window.title}
            >
              {renderIcon(window.icon, window.customIcon, "w-5 h-5 text-white")}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
            </Button>
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
