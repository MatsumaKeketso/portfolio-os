import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { App } from '../types';
import { Button } from './ui/button';
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

type AppButtonMenuState = {
  x: number;
  y: number;
  appId: string;
  windowId: string | null;
  windowMinimized: boolean;
};

export function Taskbar() {
  const {
    apps,
    windows,
    isStartMenuOpen,
    toggleStartMenu,
    openWindow,
    minimizeWindow,
    closeWindow,
    updateApp,
    systemPreferences,
  } = useDesktopStore();
  const [time, setTime] = useState(new Date());
  const [appMenu, setAppMenu] = useState<AppButtonMenuState | null>(null);
  const [taskbarMenu, setTaskbarMenu] = useState<{ x: number; y: number } | null>(null);

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

  const handleAppButtonContextMenu = (
    e: React.MouseEvent,
    appId: string,
    windowId: string | null,
    windowMinimized: boolean,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setAppMenu({ x: e.clientX, y: e.clientY, appId, windowId, windowMinimized });
  };

  const handleTaskbarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setTaskbarMenu({ x: e.clientX, y: e.clientY });
  };

  const getAppButtonMenuDefs = ({ appId, windowId, windowMinimized }: AppButtonMenuState): ContextMenuItemDef[] => {
    const app: App | undefined = apps.find((a) => a.id === appId);
    const items: ContextMenuItemDef[] = [];

    if (!windowId) {
      items.push({ id: 'open', label: 'Open', icon: Icons.ExternalLink, group: 'primary', action: () => app && openWindow(app) });
    } else if (windowMinimized) {
      items.push({ id: 'restore', label: 'Restore', icon: Icons.Square, group: 'primary', action: () => minimizeWindow(windowId) });
    } else {
      items.push({ id: 'minimize', label: 'Minimize', icon: Icons.Minus, group: 'primary', action: () => minimizeWindow(windowId) });
    }

    if (app) {
      items.push({
        id: 'pin-taskbar',
        label: app.pinnedToTaskbar ? 'Unpin from Taskbar' : 'Pin to Taskbar',
        icon: app.pinnedToTaskbar ? Icons.PinOff : Icons.Pin,
        group: 'organize',
        action: () => updateApp(appId, { pinnedToTaskbar: !app.pinnedToTaskbar }),
      });
    }

    if (windowId) {
      items.push({
        id: 'close-window',
        label: 'Close window',
        icon: Icons.X,
        group: 'danger' as MenuGroup,
        danger: true,
        action: () => closeWindow(windowId),
      });
    }

    return items;
  };

  const getTaskbarMenuDefs = (): ContextMenuItemDef[] => {
    const taskManagerApp = apps.find((a) => a.component === 'TaskManager');
    const settingsApp = apps.find((a) => a.component === 'Settings');

    return [
      {
        id: 'show-desktop',
        label: 'Show Desktop',
        icon: Icons.Monitor,
        group: 'primary',
        action: () => windows.filter((w) => !w.isMinimized).forEach((w) => minimizeWindow(w.id)),
      },
      ...(taskManagerApp
        ? [{ id: 'task-manager', label: 'Task Manager', icon: Icons.Activity, group: 'system' as MenuGroup, action: () => openWindow(taskManagerApp) }]
        : []),
      ...(settingsApp
        ? [{ id: 'taskbar-settings', label: 'Taskbar Settings', icon: Icons.Settings2, group: 'system' as MenuGroup, action: () => openWindow(settingsApp) }]
        : []),
    ];
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
    return `fixed ${positionClasses[taskbarPosition]} ${sizeClass} ${borderClasses[taskbarPosition]} bg-[#141414] border-white/[0.08] flex items-center justify-between px-2 z-[10000]`;
  };
  const isVertical = systemPreferences.taskbarPosition === 'left' || systemPreferences.taskbarPosition === 'right';
  return (
    <>
    <div className={getTaskbarClasses()} onContextMenu={handleTaskbarContextMenu}>
      <div className={`flex items-center gap-1 ${isVertical ? 'flex-col' : 'flex-row'}`}>
        <Button
          onClick={toggleStartMenu}
          variant="taskbar"
          size="iconLg"
          data-active={isStartMenuOpen}
        >
          <Icons.Grid3x3 className="w-5 h-5" />
        </Button>
        <div className={isVertical ? 'h-px w-6 bg-white/[0.08] my-1' : 'w-px h-6 bg-white/[0.08] mx-1'} />
        {pinnedApps.map((app) => {
          const win = windows.find(w => w.appId === app.id);
          const isOpen = !!win;
          return (
            <Button
              key={app.id}
              onClick={() => {
                if (win) {
                  minimizeWindow(win.id);
                } else {
                  openWindow(app);
                }
              }}
              onContextMenu={(e) =>
                handleAppButtonContextMenu(e, app.id, win?.id ?? null, win?.isMinimized ?? false)
              }
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
              onContextMenu={(e) =>
                handleAppButtonContextMenu(e, window.appId, window.id, false)
              }
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
        <div className={`flex items-center gap-2 text-white/40 text-xs ${isVertical ? 'flex-col' : 'flex-row'}`}>
          <Icons.Wifi className="w-3.5 h-3.5" />
          <Icons.Volume2 className="w-3.5 h-3.5" />
        </div>
        <div className={`text-xs ${isVertical ? 'text-center' : 'text-right'}`}>
          <div className="font-medium text-white/80">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-[10px] text-white/40">{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>
      </div>
    </div>

    {/* App button context menu */}
    <AnimatePresence>
      {appMenu && (
        <ContextMenu
          x={appMenu.x}
          y={appMenu.y}
          items={toContextMenuItems(getAppButtonMenuDefs(appMenu))}
          onClose={() => setAppMenu(null)}
        />
      )}
    </AnimatePresence>

    {/* Taskbar background context menu */}
    <AnimatePresence>
      {taskbarMenu && (
        <ContextMenu
          x={taskbarMenu.x}
          y={taskbarMenu.y}
          items={toContextMenuItems(getTaskbarMenuDefs())}
          onClose={() => setTaskbarMenu(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
