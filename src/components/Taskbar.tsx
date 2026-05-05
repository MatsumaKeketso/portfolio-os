import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useAuthStore } from '../store/authStore';
import { App } from '../types';
import { Button } from './ui/button';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { ContextMenuItemDef, MenuGroup, sortAndSeparate } from '../lib/contextMenuRegistry';
import { CalendarPopup, type PopupAnchor } from './CalendarPopup';
import { VolumePopup } from './VolumePopup';
import { NotificationPanel } from './NotificationPanel';
import { useNotificationStore } from '../store/notificationStore';
import { StartMenu } from './StartMenu';
import { cn } from '../lib/utils';
import generativeStudioLogo from '../assets/png-color-symbol.png';

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
    bringToFront,
    updateApp,
    systemPreferences,
  } = useDesktopStore();
  const [time, setTime] = useState(new Date());
  const [appMenu, setAppMenu] = useState<AppButtonMenuState | null>(null);
  const [taskbarMenu, setTaskbarMenu] = useState<{ x: number; y: number } | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSystemTray, setShowSystemTray] = useState(false);
  const [volume, setVolume] = useState(75);
  const notificationCount = useNotificationStore((s) => s.notifications.length);
  const [startMenuAnchor, setStartMenuAnchor] = useState<PopupAnchor | null>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<PopupAnchor | null>(null);
  const [volumeAnchor, setVolumeAnchor] = useState<PopupAnchor | null>(null);
  const { isAuthenticated, isAdmin } = useAuthStore();

  const startBtnRef = useRef<HTMLButtonElement>(null);
  const volumeBtnRef = useRef<HTMLButtonElement>(null);
  const clockBtnRef = useRef<HTMLButtonElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const trayBtnRef = useRef<HTMLButtonElement>(null);

  const computeAnchor = (el: HTMLElement): PopupAnchor => {
    const rect = el.getBoundingClientRect();
    return {
      bottom: window.innerHeight - rect.top + 8,
      centerX: rect.left + rect.width / 2,
    };
  };

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

  const getTaskbarClasses = () => {
    const { taskbarPosition, taskbarSize } = systemPreferences;
    const isVert = taskbarPosition === 'left' || taskbarPosition === 'right';

    const posClass = {
      bottom: 'bottom-3 left-1/2 -translate-x-1/2',
      top: 'top-3 left-1/2 -translate-x-1/2',
      left: 'left-3 top-1/2 -translate-y-1/2',
      right: 'right-3 top-1/2 -translate-y-1/2',
    }[taskbarPosition];

    const dirClass = isVert ? 'flex-col' : 'flex-row';

    // Uniform padding on all sides — inner radius = 16px (rounded-2xl) − padding
    // small: p-1 (4px) → inner radius 12px
    // medium: p-1.5 (6px) → inner radius 10px  (matches rounded-[10px] on iconLg)
    // large: p-2 (8px) → inner radius 8px
    const paddingClass = { small: 'p-1', medium: 'p-1.5', large: 'p-2' }[taskbarSize];

    return `fixed ${posClass} ${dirClass} ${paddingClass} flex items-center z-[10000] rounded-2xl backdrop-blur-md bg-background-chrome/80 border border-white/[0.08] shadow-xl shadow-black/50`;
  };
  const isVertical = systemPreferences.taskbarPosition === 'left' || systemPreferences.taskbarPosition === 'right';

  const focusedWindowId = windows
    .filter(w => !w.isMinimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0]?.id ?? null;
  return (
    <>
    <div className={getTaskbarClasses()} onContextMenu={handleTaskbarContextMenu}>
      <div className={`flex items-center gap-1 ${isVertical ? 'flex-col' : 'flex-row'}`}>
        <div className="relative group">
          <Button
            ref={startBtnRef}
            onClick={() => {
              if (!isStartMenuOpen && startBtnRef.current) {
                setStartMenuAnchor(computeAnchor(startBtnRef.current));
              }
              toggleStartMenu();
            }}
            variant="ghost"
            size="iconLg"
            className={cn(
              "transition-all duration-200 p-[1px] rounded-[11px] bg-os-canvas border border-os-line-light shadow-sm",
              "hover:bg-os-canvas-raised hover:scale-[1.04] hover:border-stroke-brand",
              isStartMenuOpen && "border-stroke-brand bg-os-canvas-raised"
            )}
            data-active={isStartMenuOpen}
          >
            <div className="bg-os-canvas rounded-[10px] w-full h-full flex items-center justify-center">
              <img src={generativeStudioLogo} alt="Generative Studio" className="w-5 h-5 object-contain" />
              {isAuthenticated && (
                <span className={cn(
                  "absolute right-1.5 bottom-1.5 w-2 h-2 rounded-full border border-os-canvas",
                  isAdmin ? "bg-primary-500" : "bg-emerald-500"
                )} />
              )}
            </div>
          </Button>
        </div>
        <div className={isVertical ? 'h-px w-6 bg-white/[0.08] my-1' : 'w-px h-6 bg-white/[0.08] mx-1'} />
        {pinnedApps.map((app) => {
          const win = windows.find(w => w.appId === app.id);
          const hasWindow = !!win;
          const isFocused = win?.id === focusedWindowId;
          const iconClass = isFocused
            ? "w-5 h-5 text-white"
            : hasWindow ? "w-5 h-5 text-white/70" : "w-5 h-5 text-white/40";
          return (
            <Button
              key={app.id}
              onClick={() => {
                if (!win) {
                  openWindow(app);
                } else if (win.isMinimized) {
                  minimizeWindow(win.id);
                } else if (win.id === focusedWindowId) {
                  minimizeWindow(win.id);
                } else {
                  bringToFront(win.id);
                }
              }}
              onContextMenu={(e) =>
                handleAppButtonContextMenu(e, app.id, win?.id ?? null, win?.isMinimized ?? false)
              }
              variant="taskbar"
              size="iconLg"
              title={app.name}
            >
              {renderIcon(app.icon, app.customIcon, iconClass)}
              {isFocused && (
                <motion.div
                  layoutId="taskbar-focus-indicator"
                  className="absolute bottom-1 inset-x-0 mx-auto h-[2px] w-5 rounded-full bg-primary-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.5 }}
                />
              )}
              {hasWindow && !isFocused && (
                <div className="absolute bottom-1 inset-x-0 mx-auto h-[2px] w-2 rounded-full bg-white/30" />
              )}
            </Button>
          );
        })}

        {openApps.filter(w => !pinnedApps.some(app => app.id === w.appId)).map((win) => {
          const isFocused = win.id === focusedWindowId;
          const iconClass = isFocused ? "w-5 h-5 text-white" : "w-5 h-5 text-white/70";
          return (
            <Button
              key={win.id}
              onClick={() => {
                if (isFocused) {
                  minimizeWindow(win.id);
                } else {
                  bringToFront(win.id);
                }
              }}
              onContextMenu={(e) =>
                handleAppButtonContextMenu(e, win.appId, win.id, false)
              }
              variant="taskbar"
              size="iconLg"
              title={win.title}
            >
              {renderIcon(win.icon, win.customIcon, iconClass)}
              {isFocused ? (
                <motion.div
                  layoutId="taskbar-focus-indicator"
                  className="absolute bottom-1 inset-x-0 mx-auto h-[2px] w-5 rounded-full bg-primary-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.5 }}
                />
              ) : (
                <div className="absolute bottom-1 inset-x-0 mx-auto h-[2px] w-2 rounded-full bg-white/30" />
              )}
            </Button>
          );
        })}
      </div>

      <div className={isVertical ? 'h-px w-6 bg-white/[0.08] my-1' : 'w-px h-5 bg-white/[0.08] mx-2'} />
      <div className={`flex items-center gap-1 ${isVertical ? 'flex-col' : 'flex-row'}`}>
        {/* Notifications */}
        <button
          ref={notifBtnRef}
          onClick={() => {
            if (notifBtnRef.current) {
              const rect = notifBtnRef.current.getBoundingClientRect();
              setCalendarAnchor({ bottom: window.innerHeight - rect.top + 8, centerX: rect.left + rect.width / 2 });
            }
            setShowNotifications(v => !v);
            setShowCalendar(false);
            setShowVolume(false);
            setShowSystemTray(false);
          }}
          className="relative p-2 hover:bg-white/[0.08] rounded-[10px] transition-colors group"
          title="Notifications"
        >
          <Icons.Bell className={cn(
            'w-3.5 h-3.5 transition-colors',
            showNotifications ? 'text-white/70' : 'text-white/40 group-hover:text-white/70'
          )} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-400" />
          )}
        </button>
        {/* Volume */}
        <button
          ref={volumeBtnRef}
          onClick={() => {
            if (volumeBtnRef.current) setVolumeAnchor(computeAnchor(volumeBtnRef.current));
            setShowVolume(v => !v);
            setShowCalendar(false);
            setShowNotifications(false);
            setShowSystemTray(false);
          }}
          className="p-2 hover:bg-white/[0.08] rounded-[10px] transition-colors group"
          title="Volume"
        >
          {volume === 0
            ? <Icons.VolumeX className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
            : volume < 40
            ? <Icons.Volume1 className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
            : <Icons.Volume2 className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
          }
        </button>
        {/* Clock / Calendar toggle */}
        <button
          ref={clockBtnRef}
          onClick={() => {
            if (clockBtnRef.current) setCalendarAnchor(computeAnchor(clockBtnRef.current));
            setShowCalendar(v => !v);
            setShowVolume(false);
            setShowNotifications(false);
            setShowSystemTray(false);
          }}
          className={cn(
            "rounded-[10px] px-2 py-1.5 transition-all duration-200",
            "hover:bg-white/[0.08] text-white/80 hover:text-white",
            isVertical ? "text-center" : "text-right",
            showCalendar && "bg-white/[0.1] text-white"
          )}
        >
          <div className="font-medium tabular-nums text-xs leading-tight">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-[10px] opacity-50 tabular-nums leading-tight">
            {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </button>
        {/* System tray */}
        <button
          ref={trayBtnRef}
          onClick={() => {
            if (trayBtnRef.current) setCalendarAnchor(computeAnchor(trayBtnRef.current));
            setShowSystemTray(v => !v);
            setShowCalendar(false);
            setShowVolume(false);
            setShowNotifications(false);
          }}
          className={cn(
            "p-2 rounded-[10px] transition-colors group",
            showSystemTray ? "bg-white/[0.10]" : "hover:bg-white/[0.08]"
          )}
          title="System tray"
        >
          <Icons.ChevronUp className={cn(
            'w-3.5 h-3.5 transition-colors',
            showSystemTray ? 'text-white/70' : 'text-white/40 group-hover:text-white/70'
          )} />
        </button>
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

    <AnimatePresence>
      {showCalendar && calendarAnchor && (
        <CalendarPopup anchor={calendarAnchor} onClose={() => setShowCalendar(false)} />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showVolume && volumeAnchor && (
        <VolumePopup
          anchor={volumeAnchor}
          volume={volume}
          onChange={setVolume}
          onClose={() => setShowVolume(false)}
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showNotifications && calendarAnchor && (
        <NotificationPanel anchor={calendarAnchor} onClose={() => setShowNotifications(false)} />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showSystemTray && calendarAnchor && (
        <>
          <button
            className="fixed inset-0 z-[10008] cursor-default"
            aria-label="Close system tray"
            onClick={() => setShowSystemTray(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="fixed z-[10009] w-72 rounded-2xl border border-white/[0.10] bg-background-chrome/95 shadow-os-window backdrop-blur-xl p-2"
            style={{
              bottom: calendarAnchor.bottom,
              left: Math.min(Math.max(calendarAnchor.centerX - 144, 12), window.innerWidth - 300),
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Bluetooth', detail: 'Not connected', icon: Icons.Bluetooth },
                { label: 'Brightness', detail: 'Adaptive', icon: Icons.SunMedium },
                { label: 'NVIDIA', detail: 'GPU idle', icon: Icons.Cpu },
                { label: 'Steam', detail: 'Offline', icon: Icons.Gamepad2 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-3 transition-all hover:bg-white/[0.08] hover:border-white/[0.14] hover:-translate-y-0.5"
                  >
                    <Icon className="w-4 h-4 text-white/60 mb-3" />
                    <div className="text-xs font-medium text-white/80">{item.label}</div>
                    <div className="text-[10px] text-white/35">{item.detail}</div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => {
                window.dispatchEvent(new Event('genos:open-shortcuts'));
                setShowSystemTray(false);
              }}
              className="mt-2 w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-3 text-left transition-all hover:bg-white/[0.08] hover:border-white/[0.14] flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-500/15 border border-primary-500/25 flex items-center justify-center">
                <Icons.Keyboard className="w-4 h-4 text-primary-300" />
              </div>
              <div>
                <div className="text-xs font-medium text-white/85">Keyboard shortcuts</div>
                <div className="text-[10px] text-white/35">Press ? or open the guide</div>
              </div>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <StartMenu anchor={startMenuAnchor ?? undefined} />
    </>
  );
}
