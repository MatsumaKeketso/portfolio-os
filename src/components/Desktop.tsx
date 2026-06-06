import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useFileStore } from '../store/fileStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { uploadFile, UploadProgress as UploadProgressType } from '../lib/uploadUtils';
import { UploadProgressToast } from './UploadProgress';
import { Taskbar } from './Taskbar';
import { DesktopIcons } from './DesktopIcons';
import { WindowManager } from './WindowManager';
import { AdminPanel } from './AdminPanel';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { LoginModal } from './LoginModal';
import { WelcomeScreen } from './WelcomeScreen';
import { NotificationContainer } from './NotificationContainer';
import { Timeline } from './Timeline';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { ContextMenuItemDef, ContextPermission, resolveAndSort } from '../lib/contextMenuRegistry';
import { MiniPlayer } from './MiniPlayer';
import { BootHeaderStrip, WindowHeaderStrip } from './TaskbarStrip';
import logoWhite from '../assets/png-white-symbol.png';
import { createThumbnail } from '../lib/imageUtils';

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

import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { useTimelineStore } from '../store/timelineStore';
import { useObservatoryStore } from '../store/observatoryStore';

const MOBILE_ABOUT_ITEMS = [
  { label: 'System', value: 'GenOS' },
  { label: 'Version', value: '2.1.0' },
  { label: 'Signal', value: 'A living interface' },
  { label: 'Builder', value: 'Generative Studio' },
];

type BootTaskId = 'auth' | 'theme' | 'profile' | 'archive' | 'apps' | 'backgrounds' | 'modules' | 'timeline' | 'observatory';
type BootTaskStatus = 'pending' | 'loading' | 'done' | 'error';

type BootTask = {
  id: BootTaskId;
  label: string;
  detail: string;
  status: BootTaskStatus;
  durationMs?: number;
};

const BOOT_TASKS: BootTask[] = [
  { id: 'auth', label: 'Session', detail: 'Checking access', status: 'pending' },
  { id: 'theme', label: 'Theme', detail: 'Applying system tokens', status: 'pending' },
  { id: 'profile', label: 'Profile', detail: 'Loading owner data', status: 'pending' },
  { id: 'archive', label: 'Archive', detail: 'Mounting files', status: 'pending' },
  { id: 'apps', label: 'Apps', detail: 'Syncing desktop entries', status: 'pending' },
  { id: 'backgrounds', label: 'Backgrounds', detail: 'Preparing surfaces', status: 'pending' },
  { id: 'modules', label: 'Modules', detail: 'Warming core apps', status: 'pending' },
  { id: 'timeline', label: 'Timeline', detail: 'Loading recent activity', status: 'pending' },
  { id: 'observatory', label: 'Observatory', detail: 'Indexing topics', status: 'pending' },
];

const MIN_BOOT_DURATION_MS = 950;
const CACHE_HINT_KEY = 'genos_cache_hint_2026_05_10';

const wait = (ms: number) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

const warmStartupModules = async () => {
  await Promise.allSettled([
    import('./apps/FileExplorer'),
    import('./apps/Browser'),
    import('./apps/CV'),
    import('./apps/AboutOS'),
    import('./apps/Settings'),
    import('./apps/ImageViewer'),
    import('./apps/Music'),
  ]);
};

const createDesktopThumbnail = async (file: File): Promise<string | undefined> => {
  if (!file.type.startsWith('image/')) return undefined;
  try {
    return await createThumbnail(file, 360);
  } catch (error) {
    console.warn('Failed to create desktop thumbnail:', error);
    return undefined;
  }
};

function DesktopBackground({
  url,
  thumbnail,
  isGradient,
}: {
  url?: string;
  thumbnail?: string;
  isGradient: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(isGradient || !url);

  useEffect(() => {
    setIsLoaded(isGradient || !url);
  }, [isGradient, url]);

  if (!url) {
    return <div className="absolute inset-0 bg-os-ink-950" />;
  }

  if (isGradient) {
    return <div className="absolute inset-0" style={{ background: url }} />;
  }

  return (
    <>
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center opacity-70 blur-2xl"
        />
      )}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-os-ink-950">
          <div className="h-8 w-8 rounded-full border border-white/10 border-t-primary-400/80 animate-spin" />
        </div>
      )}
      <motion.img
        key={url}
        src={url}
        alt=""
        draggable={false}
        initial={{ opacity: 0, scale: 1.015 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.015 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        onLoad={() => setIsLoaded(true)}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </>
  );
}

function BootScreen({
  tasks,
}: {
  tasks: BootTask[];
}) {
  const completed = tasks.filter((task) => task.status === 'done' || task.status === 'error').length;
  const progress = Math.round((completed / tasks.length) * 100);
  const activeTask =
    tasks.find((task) => task.status === 'loading') ||
    tasks.find((task) => task.status === 'pending') ||
    tasks[tasks.length - 1];

  return (
    <div className="fixed inset-0 overflow-hidden bg-os-ink-950 text-white">
      <BootHeaderStrip />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--color-primary),0.16),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(var(--color-tertiary),0.08),transparent_38%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle,rgba(255,255,255,0.72)_1px,transparent_1px)] [background-size:8px_8px]" />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full max-w-[560px] flex-col items-center"
        >
          <div className="mb-7 flex flex-col items-center text-center">
            <img src={logoWhite} alt="" className="mb-5 h-11 w-11 object-contain opacity-95 drop-shadow-[0_0_18px_rgba(255,255,255,0.18)]" />
            <h1 className="text-6xl font-semibold leading-none tracking-normal text-white md:text-7xl">
              GenoOS
            </h1>
            <p className="mt-3 text-sm font-medium uppercase tracking-[0.22em] text-white/36">
              Generative OS
            </p>
            <p className="mt-6 text-sm text-white/42">
              {activeTask.detail}
            </p>
          </div>

          <div className="w-full">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-os-line-dark to-os-line-dark" />
              <span className="text-[10px] font-semibold tabular-nums text-white/35">{progress}%</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-os-line-dark to-os-line-dark" />
            </div>

            <div className="mb-4 overflow-hidden rounded-full border border-os-line-dark bg-os-ink-900">
              <motion.div
                className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 via-white to-tertiary-500 shadow-[0_0_18px_rgba(var(--color-primary),0.45)]"
                initial={{ width: '4%' }}
                animate={{ width: `${Math.max(progress, 8)}%` }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <div className="grid gap-1.5 rounded-2xl border border-os-line-dark bg-background-chrome/72 p-2 shadow-os-window">
              {tasks.map((task) => {
                const isDone = task.status === 'done';
                const isLoading = task.status === 'loading';
                const isError = task.status === 'error';

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border border-os-line-dark bg-os-ink-900/62 px-3 py-2"
                  >
                    <div
                      className={[
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                        isDone ? 'border-primary-500/40 bg-primary-500/12 text-primary-300' : '',
                        isLoading ? 'border-os-line-dark-hover bg-os-ink-800/40 text-os-text-inverse/70' : '',
                        isError ? 'border-tertiary-500/35 bg-tertiary-500/10 text-tertiary-300' : '',
                        task.status === 'pending' ? 'border-os-line-dark bg-os-ink-950 text-white/20' : '',
                      ].join(' ')}
                    >
                      {isDone && <Icons.Check className="h-3.5 w-3.5" />}
                      {isLoading && <Icons.Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {isError && <Icons.AlertTriangle className="h-3.5 w-3.5" />}
                      {task.status === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white/78">{task.label}</p>
                      <p className="truncate text-[10px] text-white/32">{task.detail}</p>
                    </div>
                    {typeof task.durationMs === 'number' && (
                      <span className="shrink-0 text-[10px] tabular-nums text-white/25">
                        {task.durationMs}ms
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MobileAboutSurface() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-os-line-dark bg-background-chrome shadow-os-window">
      <div className="relative flex min-h-11 shrink-0 items-center justify-between overflow-hidden border-b border-os-line-dark bg-background-chrome px-3">
        <WindowHeaderStrip active />
        <div className="relative z-10 flex min-w-0 items-center gap-2">
          <Icons.Monitor className="h-4 w-4 shrink-0 text-primary-400" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium leading-none text-white/85">About This OS</p>
            <p className="mt-1 truncate text-[10px] leading-none text-white/35">A quieter door into the system</p>
          </div>
        </div>
        <span className="relative z-10 rounded-md border border-os-line-dark bg-os-ink-900 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/40">
          Locked
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4">
        <section className="relative overflow-hidden rounded-xl border border-os-line-dark bg-os-ink-950/72 p-4">
          <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full border border-primary-500/20" />
          <div className="pointer-events-none absolute -right-8 -top-12 h-28 w-28 rounded-full border border-tertiary-500/20" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(var(--color-primary),0.18),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(var(--color-tertiary),0.12),transparent_34%)]" />

          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-400">GenOS</p>
            <h1 className="mt-2 text-2xl font-semibold leading-[1.05] text-white">
              A small window into a larger machine.
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/58">
              GenOS opens best when there is room to move. Here, it folds itself down to a calmer signal: the intent, the maker, and the studio behind the system.
            </p>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-2 gap-2">
          {MOBILE_ABOUT_ITEMS.map((item) => (
            <div key={item.label} className="rounded-lg border border-os-line-dark bg-os-ink-900/78 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{item.label}</p>
              <p className="mt-1 text-xs font-medium leading-4 text-white/78">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-3 space-y-2 rounded-xl border border-os-line-dark bg-os-ink-950/62 p-4">
          <div className="flex items-center gap-2">
            <Icons.Lightbulb className="h-4 w-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-white/85">Concept</h2>
          </div>
          <p className="text-sm leading-6 text-white/55">
            GenOS is an ecosystem of design decisions: motion, layout, color, hierarchy, interaction, and infrastructure shaped into one environment.
          </p>
          <p className="text-sm leading-6 text-white/55">
            The operating system form was chosen for its robustness. It can hold many domains at once: visual design, user experience, code, data, publishing, storage, and the small emotional cues that make a space feel responsive.
          </p>
          <p className="text-sm leading-6 text-white/55">
            The point is connection. Fundamentals like contrast, rhythm, spacing, and color theory meet deeper systems like permissions, persistence, and window behavior. Together, they become a place the user can understand by touching it.
          </p>
        </section>

        <section className="mt-3 space-y-2 rounded-xl border border-os-line-dark bg-os-ink-950/62 p-4">
          <div className="flex items-center gap-2">
            <Icons.User className="h-4 w-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-white/85">Keketso</h2>
          </div>
          <p className="text-sm leading-6 text-white/55">
            Keketso Matsuma builds systems that like to reveal their logic slowly: interfaces with moving parts, patterns that hold under pressure, and tools that feel considered when you touch them.
          </p>
        </section>

        <section className="mt-3 space-y-2 rounded-xl border border-os-line-dark bg-os-ink-950/62 p-4">
          <div className="flex items-center gap-2">
            <Icons.Sparkles className="h-4 w-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-white/85">Generative Studio</h2>
          </div>
          <p className="text-sm leading-6 text-white/55">
            Generative Studio shaped the frame: the OS language, the surfaces, the motion, and the quiet machinery that lets the portfolio behave like a place.
          </p>
        </section>

        <div className="mt-3 rounded-xl border border-os-line-dark bg-os-ink-900/70 p-3 text-xs leading-5 text-white/42">
          For the full room, return on a tablet, laptop, or desktop. This small view is the threshold.
        </div>
      </div>
    </div>
  );
}

export function Desktop() {
  const {
    setStartMenuOpen,
    toggleAdminMode,
    setAdminMode,
    isAdminMode,
    getSelectedBackground,
    backgrounds,
    selectedBackgroundId,
    setSelectedBackground,
    systemPreferences,
    setIconSize,
    windows,
    fetchApps,
    fetchBackgrounds,
  } = useDesktopStore();
  const fileStore = useFileStore();
  const { isAuthenticated, isAdmin, checkSession } = useAuthStore();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const selectedBackground = getSelectedBackground();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'date'>('name');
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType[]>([]);
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const [bootTasks, setBootTasks] = useState<BootTask[]>(BOOT_TASKS);
  const bootStartedRef = useRef(false);
  const skipNextAuthRefreshRef = useRef(false);

  // Auto-hide timeline when a window is maximized
  const hasMaximizedWindow = windows.some(w => w.isMaximized && !w.isMinimized);

  const { fetchProfile } = useUserStore();
  const { fetchFileSystem } = useFileStore();
  const { fetchTheme } = useThemeStore();
  const { loadTimeline } = useTimelineStore();
  const { loadObservatory } = useObservatoryStore();

  useEffect(() => {
    const mediaQuery = globalThis.window.matchMedia('(max-width: 767px)');
    const updateSmallDevice = () => setIsSmallDevice(mediaQuery.matches);
    updateSmallDevice();
    mediaQuery.addEventListener('change', updateSmallDevice);
    return () => mediaQuery.removeEventListener('change', updateSmallDevice);
  }, []);

  useEffect(() => {
    if (bootStartedRef.current) return;
    bootStartedRef.current = true;

    const updateBootTask = (id: BootTaskId, status: BootTaskStatus, detail?: string, durationMs?: number) => {
      setBootTasks((current) =>
        current.map((task) =>
          task.id === id
            ? { ...task, status, detail: detail ?? task.detail, durationMs: durationMs ?? task.durationMs }
            : task
        )
      );
    };

    const runBootTask = async (id: BootTaskId, task: () => Promise<void>, doneDetail: string) => {
      updateBootTask(id, 'loading');
      const taskStartedAt = performance.now();
      try {
        await task();
        updateBootTask(id, 'done', doneDetail, Math.round(performance.now() - taskStartedAt));
      } catch (error) {
        console.error(`Boot task failed: ${id}`, error);
        updateBootTask(id, 'error', 'Using fallback data', Math.round(performance.now() - taskStartedAt));
      }
    };

    const boot = async () => {
      const startedAt = performance.now();

      await Promise.all([
        runBootTask('auth', checkSession, 'Session ready'),
        runBootTask('theme', fetchTheme, 'Theme applied'),
        runBootTask('profile', fetchProfile, 'Profile ready'),
        runBootTask('archive', fetchFileSystem, 'Archive mounted'),
        runBootTask('apps', fetchApps, 'Apps ready'),
        runBootTask('backgrounds', fetchBackgrounds, 'Background ready'),
        runBootTask('modules', warmStartupModules, 'Core apps warmed'),
        runBootTask('timeline', loadTimeline, 'Timeline ready'),
        runBootTask('observatory', loadObservatory, 'Observatory ready'),
      ]);

      const elapsed = performance.now() - startedAt;
      if (elapsed < MIN_BOOT_DURATION_MS) {
        await wait(MIN_BOOT_DURATION_MS - elapsed);
      }

      skipNextAuthRefreshRef.current = true;
      setHasBootstrapped(true);
    };

    boot();
  }, [checkSession, fetchProfile, fetchFileSystem, fetchApps, fetchBackgrounds, fetchTheme, loadTimeline, loadObservatory]);

  useEffect(() => {
    if (!hasBootstrapped || !isAuthenticated) return;
    if (skipNextAuthRefreshRef.current) {
      skipNextAuthRefreshRef.current = false;
      return;
    }
    fetchProfile();
    fetchFileSystem();
    fetchApps();
    fetchBackgrounds();
    // Refetch with role-aware visibility filter: a superuser sign-in promotes
    // their view from public-only to full content.
    loadTimeline();
    loadObservatory();
  }, [hasBootstrapped, isAuthenticated, fetchProfile, fetchFileSystem, fetchApps, fetchBackgrounds, loadTimeline, loadObservatory]);

  useEffect(() => {
    if (!isAdmin) setAdminMode(false);
  }, [isAdmin, setAdminMode]);

  /* Global Error Handling */
  const { error: userError } = useUserStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (userError) {
      addNotification({
        type: 'error',
        title: 'System Error',
        message: userError,
        duration: 5000,
      });
      // Optionally clear error after showing? 
      // useUserStore.setState({ error: null }); 
      // Better to let user dismiss or have it persist until next action.
    }
  }, [userError, addNotification]);

  useEffect(() => {
    if (!hasBootstrapped) return;
    if (localStorage.getItem(CACHE_HINT_KEY) === 'seen') return;

    addNotification({
      type: 'info',
      title: 'Seeing an older build?',
      message: 'Press F12, open Application > Storage, clear site data/cache, close DevTools, then refresh GenOS.',
      duration: 12000,
    });
    localStorage.setItem(CACHE_HINT_KEY, 'seen');
  }, [hasBootstrapped, addNotification]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (isAdmin) {
          toggleAdminMode();
        } else if (isAuthenticated) {
          addNotification({
            type: 'info',
            title: 'Guest session',
            message: 'Only admin@os.com can open the Admin Panel.',
            duration: 4000,
          });
        } else {
          setShowLoginModal(true);
        }
      }

      if (e.key === 'Escape') {
        setStartMenuOpen(false);
        setShowLoginModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, isAdmin, toggleAdminMode, setStartMenuOpen, addNotification]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.start-menu') && !target.closest('.taskbar')) {
        setStartMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setStartMenuOpen]);

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractiveElement =
      target.closest('.window') ||
      target.closest('.taskbar') ||
      target.closest('.start-menu') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('a');

    if (!isInteractiveElement) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const getDesktopMenuDefs = (): ContextMenuItemDef[] => [
    // organize: view options
    {
      id: 'view-large',
      label: 'Large icons',
      icon: Icons.LayoutGrid,
      group: 'organize',
      shortcut: systemPreferences.iconSize === 'large' ? '✓' : undefined,
      action: () => setIconSize('large'),
    },
    {
      id: 'view-medium',
      label: 'Medium icons',
      icon: Icons.Grid2X2,
      group: 'organize',
      shortcut: systemPreferences.iconSize === 'medium' ? '✓' : undefined,
      action: () => setIconSize('medium'),
    },
    {
      id: 'view-small',
      label: 'Small icons',
      icon: Icons.LayoutList,
      group: 'organize',
      shortcut: systemPreferences.iconSize === 'small' ? '✓' : undefined,
      action: () => setIconSize('small'),
    },
    { id: 'div-view-sort', label: '', divider: true, group: 'organize', action: () => {} },
    // organize: sort options
    {
      id: 'sort-name',
      label: 'Sort by Name',
      icon: Icons.SortAsc,
      group: 'organize',
      shortcut: sortBy === 'name' ? '✓' : undefined,
      action: () => setSortBy('name'),
    },
    {
      id: 'sort-type',
      label: 'Sort by Type',
      icon: Icons.Layers,
      group: 'organize',
      shortcut: sortBy === 'type' ? '✓' : undefined,
      action: () => setSortBy('type'),
    },
    {
      id: 'sort-date',
      label: 'Sort by Date',
      icon: Icons.Calendar,
      group: 'organize',
      shortcut: sortBy === 'date' ? '✓' : undefined,
      action: () => setSortBy('date'),
    },
    // system: desktop controls
    {
      id: 'toggle-timeline',
      label: showTimeline ? 'Hide Timeline' : 'Show Timeline',
      icon: Icons.PanelRight,
      group: 'system',
      action: () => setShowTimeline(!showTimeline),
    },
    {
      id: 'refresh',
      label: 'Refresh Desktop',
      icon: Icons.RotateCw,
      group: 'system',
      action: () => window.location.reload(),
    },
    {
      id: 'change-bg',
      label: 'Change Background',
      icon: Icons.Image,
      group: 'system',
      action: () => setShowBackgroundSelector(true),
    },
    {
      id: 'admin',
      label: isAdmin ? 'Admin Panel' : isAuthenticated ? 'Guest Session' : 'Sign In',
      icon: Icons.Settings,
      group: 'system',
      action: () => {
        if (isAdmin) toggleAdminMode();
        else if (isAuthenticated) {
          addNotification({
            type: 'info',
            title: 'Guest session',
            message: 'Only admin@os.com can open the Admin Panel.',
            duration: 4000,
          });
        } else setShowLoginModal(true);
      },
    },
  ];

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(isAdmin);
    };

    const handleDragLeave = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('desktop-drop-zone')) {
        setIsDraggingOver(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-os-window="true"]')) {
        setIsDraggingOver(false);
        return;
      }

      e.preventDefault();
      setIsDraggingOver(false);

      const files = e.dataTransfer?.files;
      if (!files) return;

      if (!isAdmin) {
        addNotification({
          type: 'warning',
          title: 'Desktop upload blocked',
          message: 'Visitors can upload images only inside Visitor Gallery.',
          duration: 5000,
        });
        return;
      }

      const fileArray = Array.from(files);
      setUploadProgress([]);

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileType = file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
            ? 'video'
            : file.type.startsWith('audio/')
              ? 'audio'
              : 'file';

        let dataUrl = '';
        const thumbnailUrl = await createDesktopThumbnail(file);

        if (fileType === 'image' || fileType === 'video' || fileType === 'audio') {
          try {
            const result = await uploadFile(file, {
              folder: 'desktop-uploads',
              maxSizeMB: 100,
              allowedTypes: ['image/*', 'video/*', 'audio/*'],
              onProgress: (progress) => {
                setUploadProgress((prev) => {
                  const existing = prev.findIndex((p) => p.fileName === progress.fileName);
                  if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = progress;
                    return updated;
                  }
                  return [...prev, progress];
                });
              },
            });

            if (result.url && !result.error) {
              dataUrl = result.url;
            } else {
              console.error('Upload error:', result.error);
            }
          } catch (error) {
            console.error('Upload exception:', error);
          }
        }

        // Fallback to base64 if upload fails
        if (!dataUrl && (fileType === 'image' || fileType === 'video' || fileType === 'audio')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            addFileToStore(base64);
          };
          reader.readAsDataURL(file);
          continue;
        }

        addFileToStore(dataUrl);

        function addFileToStore(urlOrContent: string) {
          fileStore.addFile({
            id: `file-${Date.now()}-${i}`,
            name: file.name,
            type: fileType,
            parentId: 'folder-desktop',
            path: `/${file.name}`,
            size: file.size,
            mimeType: file.type,
            dataUrl: urlOrContent,
            thumbnailUrl,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
          });
        }
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [fileStore, isAdmin, addNotification]);

  const isGradient = selectedBackground?.url?.startsWith('linear-gradient') || false;

  if (!hasBootstrapped) {
    return (
      <BootScreen tasks={bootTasks} />
    );
  }

  if (isSmallDevice) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-os-ink-950 text-white">
        <div className="absolute inset-0">
          <DesktopBackground
            url={selectedBackground?.url}
            thumbnail={selectedBackground?.thumbnail}
            isGradient={isGradient}
          />
          <div className="absolute inset-0 bg-os-ink-950/78" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(var(--color-primary),0.24),transparent_34%),radial-gradient(circle_at_82%_88%,rgba(var(--color-tertiary),0.18),transparent_38%)]" />
        </div>

        <div className="relative z-10 flex h-full w-full p-[max(10px,env(safe-area-inset-top))_10px_max(10px,env(safe-area-inset-bottom))]">
          <MobileAboutSurface />
        </div>

        <NotificationContainer />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden desktop-drop-zone"
      onContextMenu={handleDesktopContextMenu}
    >
      <div className="absolute inset-0 overflow-hidden bg-os-ink-950">
        <DesktopBackground
          url={selectedBackground?.url}
          thumbnail={selectedBackground?.thumbnail}
          isGradient={isGradient}
        />
      </div>

      {isDraggingOver && (
        <div className="absolute inset-0 bg-primary-500/20 border-1 border-primary-400 border-dashed flex items-center justify-center z-[9997] pointer-events-none">
          <div className="text-white text-2xl font-bold drop-shadow-lg">Drop files to upload</div>
        </div>
      )}

      <div className="relative h-full flex flex-col overflow-hidden" onContextMenu={handleDesktopContextMenu}>
        <div className="flex-1 relative desktop-area flex gap-4 overflow-hidden">
          {/* Left side: Desktop Icons and Windows */}
          {/* overflow-hidden here clips any window whose absolute position
              extends beyond the container. Without it, un-maximizing while
              the Timeline re-appears would let off-screen windows push the
              desktop layout sideways. */}
          <div className="flex-1 relative min-w-0 overflow-hidden">
            <DesktopIcons iconSize={systemPreferences.iconSize} sortBy={sortBy} />
            <WindowManager />
          </div>

          {/* Right side: Timeline - Hidden when window is maximized */}
          {!hasMaximizedWindow && showTimeline && (
            <div
              className={`flex-shrink-0 relative transition-all duration-300 ease-in-out ${isTimelineExpanded ? 'w-[80%]' : 'w-[400px]'
                }`}
              style={{ zIndex: 1 }}
            >
              <Timeline
                isExpanded={isTimelineExpanded}
                onToggleExpand={() => setIsTimelineExpanded(!isTimelineExpanded)}
              />
            </div>
          )}
        </div>

        <div className="taskbar">
          <Taskbar />
        </div>

        <MiniPlayer />


        {isAdmin && isAdminMode && (
          <div
            className="fixed left-3 right-3 top-3 bottom-[76px] z-[9000] pointer-events-auto overflow-hidden rounded-2xl border border-os-line-dark bg-background-chrome shadow-os-window"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
          >
            <AdminPanel />
          </div>
        )}

        <KeyboardShortcutsHelp />

        <PWAInstallPrompt />

        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

        <WelcomeScreen />

        <NotificationContainer />

        {/* Desktop Context Menu */}
        <AnimatePresence>
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              items={toContextMenuItems(
                getDesktopMenuDefs(),
                [
                  'visitor',
                  ...(isAuthenticated ? ['owner' as ContextPermission] : []),
                  ...(isAdmin ? ['admin' as ContextPermission] : []),
                ],
              )}
              onClose={() => setContextMenu(null)}
            />
          )}
        </AnimatePresence>

        {/* Background Selector Modal */}
        <AnimatePresence>
          {showBackgroundSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[15000] flex items-center justify-center p-4"
              onClick={() => setShowBackgroundSelector(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[80vh] flex flex-col bg-os-ink-950 rounded-lg border border-os-line-dark shadow-os-window overflow-hidden"
              >
                <div className="shrink-0 px-6 py-4 border-b border-os-line-dark flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                      <Icons.Image className="w-4 h-4" />
                      Change Background
                    </h2>
                    <p className="text-white/40 text-xs mt-0.5">Select a background for your desktop</p>
                  </div>
                  <button
                    onClick={() => setShowBackgroundSelector(false)}
                    className="p-1.5 hover:bg-os-ink-800/60 rounded transition-colors"
                  >
                    <Icons.X className="w-4 h-4 text-white/60" />
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {backgrounds.map((bg) => {
                      const isSelected = selectedBackgroundId === bg.id;
                      const isBgGradient = bg.url.startsWith('linear-gradient');

                      return (
                        <button
                          key={bg.id}
                          onClick={() => {
                            setSelectedBackground(bg.id);
                            setShowBackgroundSelector(false);
                          }}
                          className={`relative rounded overflow-hidden border-2 transition-all ${isSelected
                            ? 'border-os-text-inverse/60 scale-105'
                            : 'border-os-line-dark hover:border-os-line-dark-hover'
                            }`}
                        >
                          <div
                            className="w-full h-28 bg-cover bg-center"
                            style={{
                              background: isBgGradient ? bg.url : 'transparent',
                              backgroundImage: !isBgGradient ? `url(${bg.url})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          />
                          <div className="bg-os-ink-900 p-2.5 border-t border-os-line-dark">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white text-xs font-medium truncate">{bg.name}</h3>
                              {isSelected && <Icons.Check className="w-3.5 h-3.5 text-white/60 flex-shrink-0 ml-2" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress Toast */}
        <UploadProgressToast
          uploads={uploadProgress}
          onClose={() => setUploadProgress([])}
        />
      </div>
    </div>
  );
}
