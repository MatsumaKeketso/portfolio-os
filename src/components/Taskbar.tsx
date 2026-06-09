import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useAuthStore } from '../store/authStore';
import { App } from '../types';
import { AppIcon } from '../lib/AppIcon';
import { Button } from './ui/button';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { ContextMenuItemDef, ContextPermission, MenuGroup, resolveAndSort } from '../lib/contextMenuRegistry';
import { CalendarPopup, type PopupAnchor } from './CalendarPopup';
import { VolumePopup } from './VolumePopup';
import { NotificationPanel } from './NotificationPanel';
import { useNotificationStore } from '../store/notificationStore';
import { StartMenu } from './StartMenu';
import { TaskbarStrip } from './TaskbarStrip';
import { cn } from '../lib/utils';
import { Typography } from './ui/Typography';
import logoColor from '../assets/png-color-symbol.png';
import logoWhite from '../assets/png-white-symbol.png';
import logoBlack from '../assets/png-black-symbol.png';

const LOGO_VARIANTS = { color: logoColor, white: logoWhite, black: logoBlack } as const;
const CV_PREVIEW_COLLAPSED_KEY = 'genos_cv_taskbar_preview_collapsed';

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

type AppButtonMenuState = {
  x: number;
  y: number;
  appId: string;
  windowId: string | null;
  windowMinimized: boolean;
};

function CvTaskbarPreview({
  app,
  isVisible,
  collapsed,
  onToggleCollapsed,
}: {
  app: App;
  isVisible: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleCollapsed();
        }}
        className="absolute right-0.5 top-0.5 z-[10003] flex h-4 w-4 items-center justify-center rounded-[5px] bg-background-chrome/86 text-white/42 transition-colors hover:bg-os-ink-800 hover:text-white"
        title={collapsed ? 'Show bio preview' : 'Hide bio preview'}
      >
        {collapsed ? <Icons.ChevronUp className="h-2.5 w-2.5" /> : <Icons.ChevronDown className="h-2.5 w-2.5" />}
      </button>

      <AnimatePresence>
        {isVisible && !collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute bottom-[calc(100%+10px)] left-1/2 z-[10002] w-[330px] -translate-x-1/2"
            style={{ overflow: 'visible' }}
          >
            <div aria-hidden className="absolute -bottom-3 left-1/2 h-3 w-20 -translate-x-1/2" />
            <div className="relative min-h-[190px] overflow-hidden rounded-2xl">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.24, delay: 0.03, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-0 right-0 z-20 w-24 h-full"
              >
                {!imageLoaded && (
                  <div className="absolute bottom-0 left-0 flex h-full w-full items-center justify-center">
                    <div className="h-7 w-7 rounded-full border border-brand-300/25 border-t-brand-300/80 animate-spin" />
                  </div>
                )}
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/generative-studio.appspot.com/o/profile%2Fcompressed__9BP5381%20(1).png?alt=media&token=96691a14-ea96-4da3-bf1c-5190b2ce8cc8"
                  alt="Keketso Matsuma"
                  onLoad={() => setImageLoaded(true)}
                  className={cn(
                    'absolute bottom-0 left-0 w-full h-full object-cover object-top transition-opacity duration-300',
                    imageLoaded ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </motion.div>

              <div className="relative z-10 p-4 pr-24">
                <div className="pointer-events-none absolute inset-0 bg-background-chrome/68 backdrop-blur-2xl [mask-image:radial-gradient(ellipse_at_bottom,black_0%,black_58%,transparent_86%)]" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background-chrome/88 via-background-chrome/42 to-transparent" />
                <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-os-ink-900/78">
                    <AppIcon icon={app.icon} customIcon={app.customIcon} className="h-4 w-4 text-white/70" />
                  </div>
                  <div>
                    <Typography variant="label" tone="brand" className="tracking-[0.14em]">CV</Typography>
                    <Typography as="h3" variant="bodyStrong" className="leading-none text-white/86">Keketso Matsuma</Typography>
                  </div>
                </div>
                <Typography variant="caption" tone="inverseMuted" className="max-w-[210px] leading-5">
                  Full-stack developer and UI/UX designer building interactive systems, motion-rich interfaces, and product environments with depth.
                </Typography>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['Systems', 'Frontend', 'Motion'].map((tag) => (
                    <Typography as="span" key={tag} variant="caption" className="rounded-full border border-os-line-dark bg-os-ink-900/70 px-2 py-1 text-[10px] text-white/42">
                      {tag}
                    </Typography>
                  ))}
                </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

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
  const [hoveredTaskbarAppId, setHoveredTaskbarAppId] = useState<string | null>(null);
  const [isCvPreviewCollapsed, setIsCvPreviewCollapsed] = useState(() => {
    try {
      return localStorage.getItem(CV_PREVIEW_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const notificationCount = useNotificationStore((s) => s.notifications.length);
  const [startMenuAnchor, setStartMenuAnchor] = useState<PopupAnchor | null>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<PopupAnchor | null>(null);
  const [volumeAnchor, setVolumeAnchor] = useState<PopupAnchor | null>(null);
  const { isAuthenticated, isAdmin } = useAuthStore();
  const menuPermissions: ContextPermission[] = [
    'visitor',
    ...(isAuthenticated ? ['owner' as ContextPermission] : []),
    ...(isAdmin ? ['admin' as ContextPermission] : []),
  ];

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

  const toggleCvPreviewCollapsed = () => {
    setIsCvPreviewCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(CV_PREVIEW_COLLAPSED_KEY, String(next));
      } catch {
        // Preference persistence is helpful, not critical.
      }
      return next;
    });
  };

  const pinnedApps = apps.filter(app => app.pinnedToTaskbar);
  const openApps = windows;

  const renderIcon = (iconName: string, customIcon: string | undefined, className: string) => (
    <AppIcon icon={iconName} customIcon={customIcon} className={className} />
  );

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

    return `fixed ${posClass} ${dirClass} ${paddingClass} flex items-center z-[10000] rounded-2xl backdrop-blur-md bg-background-chrome/80 border border-os-line-dark shadow-xl shadow-black/50 overflow-visible`;
  };
  const isVertical = systemPreferences.taskbarPosition === 'left' || systemPreferences.taskbarPosition === 'right';

  const focusedWindowId = windows
    .filter(w => !w.isMinimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0]?.id ?? null;
  return (
    <>
    <div id="genos-taskbar" className={getTaskbarClasses()} onContextMenu={handleTaskbarContextMenu}>
      <TaskbarStrip />
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
              <img src={LOGO_VARIANTS[systemPreferences.startIconVariant ?? 'color']} alt="Generative Studio" className="w-5 h-5 object-contain" />
              {isAuthenticated && (
                <span className={cn(
                  "absolute right-1.5 bottom-1.5 w-2 h-2 rounded-full border border-os-canvas",
                  isAdmin ? "bg-brand-600" : "bg-fg-success"
                )} />
              )}
            </div>
          </Button>
        </div>
        <div className={isVertical ? 'h-px w-6 bg-os-line-dark my-1' : 'w-px h-6 bg-os-line-dark mx-1'} />
        {pinnedApps.map((app) => {
          const win = windows.find(w => w.appId === app.id);
          const hasWindow = !!win;
          const isFocused = win?.id === focusedWindowId;
          const iconClass = isFocused
            ? "w-5 h-5 text-white"
            : hasWindow ? "w-5 h-5 text-white/70" : "w-5 h-5 text-white/40";
          const isCvApp = app.id === 'cv' || app.component === 'CV';

          return (
            <div
              key={app.id}
              className="relative overflow-visible"
              onMouseEnter={() => setHoveredTaskbarAppId(app.id)}
              onMouseLeave={() => setHoveredTaskbarAppId((current) => current === app.id ? null : current)}
            >
              {isCvApp && (
                <CvTaskbarPreview
                  app={app}
                  isVisible={hoveredTaskbarAppId === app.id}
                  collapsed={isCvPreviewCollapsed}
                  onToggleCollapsed={toggleCvPreviewCollapsed}
                />
              )}
            <Button
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
                  className="absolute bottom-1 inset-x-0 mx-auto h-[2px] w-5 rounded-full bg-brand-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.5 }}
                />
              )}
              {hasWindow && !isFocused && (
                <div className="absolute bottom-1 inset-x-0 mx-auto h-[2px] w-2 rounded-full bg-white/30" />
              )}
            </Button>
            </div>
          );
        })}

        {openApps.filter(w => !pinnedApps.some(app => app.id === w.appId)).map((win) => {
          const isFocused = win.id === focusedWindowId;
          const iconClass = win.isMinimized
            ? "w-5 h-5 text-white/35"
            : isFocused ? "w-5 h-5 text-white" : "w-5 h-5 text-white/70";
          return (
            <Button
              key={win.id}
              onClick={() => {
                if (win.isMinimized) {
                  minimizeWindow(win.id);
                } else if (isFocused) {
                  minimizeWindow(win.id);
                } else {
                  bringToFront(win.id);
                }
              }}
              onContextMenu={(e) =>
                handleAppButtonContextMenu(e, win.appId, win.id, win.isMinimized)
              }
              variant="taskbar"
              size="iconLg"
              title={win.title}
            >
              {renderIcon(win.icon, win.customIcon, iconClass)}
              {isFocused ? (
                <motion.div
                  layoutId="taskbar-focus-indicator"
                  className="absolute bottom-1 inset-x-0 mx-auto h-[2px] w-5 rounded-full bg-brand-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.5 }}
                />
              ) : win.isMinimized ? (
                <div className="absolute bottom-1 inset-x-0 mx-auto h-[2px] w-2 rounded-full bg-white/15" />
              ) : (
                <div className="absolute bottom-1 inset-x-0 mx-auto h-[2px] w-2 rounded-full bg-white/30" />
              )}
            </Button>
          );
        })}
      </div>

      <div className={isVertical ? 'h-px w-6 bg-os-line-dark my-1' : 'w-px h-5 bg-os-line-dark mx-2'} />
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
          className="relative p-2 hover:bg-os-ink-800 rounded-[10px] transition-colors group"
          title="Notifications"
        >
          <Icons.Bell className={cn(
            'w-3.5 h-3.5 transition-colors',
            showNotifications ? 'text-white/70' : 'text-white/40 group-hover:text-white/70'
          )} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-400" />
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
          className="p-2 hover:bg-os-ink-800 rounded-[10px] transition-colors group"
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
            "hover:bg-os-ink-800 text-white/80 hover:text-white",
            isVertical ? "text-center" : "text-right",
            showCalendar && "bg-os-ink-800 text-white"
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
            showSystemTray ? "bg-os-ink-800" : "hover:bg-os-ink-800"
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
          items={toContextMenuItems(getAppButtonMenuDefs(appMenu), menuPermissions)}
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
          items={toContextMenuItems(getTaskbarMenuDefs(), menuPermissions)}
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
            className="fixed z-[10009] w-72 rounded-2xl border border-os-line-dark bg-background-chrome/95 shadow-os-window backdrop-blur-xl p-2"
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
                    className="rounded-xl border border-os-line-dark bg-os-ink-900/55 p-3 transition-all hover:bg-os-ink-800 hover:border-os-line-dark-hover hover:-translate-y-0.5"
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
              className="mt-2 w-full rounded-xl border border-os-line-dark bg-os-ink-900/55 px-3 py-3 text-left transition-all hover:bg-os-ink-800 hover:border-os-line-dark-hover flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-600/15 border border-brand-600/25 flex items-center justify-center">
                <Icons.Keyboard className="w-4 h-4 text-fg-brand" />
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
