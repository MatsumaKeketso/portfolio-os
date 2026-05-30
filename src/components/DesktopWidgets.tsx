import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useDesktopStore } from '../store/desktopStore';
import { useNotificationStore } from '../store/notificationStore';
import { cn } from '../lib/utils';

type WidgetId = 'creator' | 'media' | 'projects' | 'time' | 'calendar' | 'news' | 'calculator';
type WidgetPositions = Record<WidgetId, { x: number; y: number }>;
type WidgetDefinition = {
  id: WidgetId;
  name: string;
  description: string;
  icon: keyof typeof Icons;
};

const WIDGET_POSITION_KEY = 'genos_widget_positions';
const WIDGET_LOCAL_HIDDEN_KEY = 'genos_widget_hidden_local';
const WIDGET_LOCAL_VISIBLE_KEY = 'genos_widget_visible_local';
const WIDGET_DOC = doc(db, 'os-site_content', 'widgets');

const WIDGETS: WidgetDefinition[] = [
  { id: 'creator', name: 'Creator', description: 'Portfolio identity and system context', icon: 'UserRound' },
  { id: 'projects', name: 'Projects', description: 'Pinned project apps on the desktop', icon: 'Blocks' },
  { id: 'calendar', name: 'Calendar', description: 'Today, month, and date context', icon: 'CalendarDays' },
  { id: 'time', name: 'Time', description: 'Local time and session presence', icon: 'Clock3' },
  { id: 'media', name: 'Media', description: 'Screenshots and videos attached to apps', icon: 'PlaySquare' },
  { id: 'news', name: 'News', description: 'Small system notices and read prompts', icon: 'Newspaper' },
  { id: 'calculator', name: 'Calculator', description: 'Quick arithmetic without opening the app', icon: 'Calculator' },
];

const DEFAULT_VISIBLE_WIDGETS: WidgetId[] = ['creator', 'projects', 'calendar'];

const safeWidth = () => (typeof globalThis.window === 'undefined' ? 1280 : globalThis.window.innerWidth);

const getDefaultPositions = (): WidgetPositions => {
  const x = Math.max(360, safeWidth() - 760);
  return {
    creator: { x, y: 18 },
    projects: { x, y: 244 },
    calendar: { x: x + 340, y: 18 },
    time: { x: x + 340, y: 214 },
    media: { x, y: 470 },
    news: { x: x + 340, y: 390 },
    calculator: { x: x + 340, y: 566 },
  };
};

const loadJsonArray = <T extends string>(key: string): T[] => {
  try {
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadWidgetPositions = (): WidgetPositions => {
  try {
    const stored = localStorage.getItem(WIDGET_POSITION_KEY);
    if (!stored) return getDefaultPositions();
    return { ...getDefaultPositions(), ...JSON.parse(stored) };
  } catch {
    return getDefaultPositions();
  }
};

function WidgetShell({
  children,
  id,
  title,
  position,
  onDismiss,
  onPositionChange,
  className = '',
}: {
  children: React.ReactNode;
  id: WidgetId;
  title: string;
  position: { x: number; y: number };
  onDismiss: (id: WidgetId) => void;
  onPositionChange: (id: WidgetId, position: { x: number; y: number }) => void;
  className?: string;
}) {
  const [isInteracting, setIsInteracting] = useState(false);

  return (
    <motion.section
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsInteracting(true)}
      onDragEnd={(_, info) => {
        onPositionChange(id, {
          x: Math.max(8, position.x + info.offset.x),
          y: Math.max(8, position.y + info.offset.y),
        });
        setIsInteracting(false);
      }}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, x: position.x, y: position.y }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'pointer-events-auto absolute isolate w-[320px] cursor-grab overflow-hidden rounded-2xl border border-os-line-dark bg-background-chrome shadow-os-card active:cursor-grabbing',
        isInteracting ? 'z-[45]' : 'z-[25]',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-os-ink-950" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(var(--color-primary),0.12),transparent_38%),radial-gradient(circle_at_92%_0%,rgba(var(--color-primary),0.22),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-os-ink-950 to-os-ink-950/20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent" />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDismiss(id);
        }}
        className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-lg text-white/32 transition-colors hover:bg-os-ink-800 hover:text-white/80"
        aria-label={`Dismiss ${title} widget`}
        title={`Dismiss ${title}`}
      >
        <Icons.X className="h-3.5 w-3.5" />
      </button>
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}

function WidgetHeader({ label, title, icon: Icon }: { label: string; title: string; icon: React.ElementType }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4 pr-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-300">{label}</p>
        <h2 className="mt-1 text-xl font-semibold leading-tight text-white">{title}</h2>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-os-line-dark bg-os-ink-900">
        <Icon className="h-4 w-4 text-white/60" />
      </div>
    </div>
  );
}

export function DesktopWidgets() {
  const apps = useDesktopStore((state) => state.apps);
  const openWindow = useDesktopStore((state) => state.openWindow);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [positions, setPositions] = useState<WidgetPositions>(loadWidgetPositions);
  const [localHidden, setLocalHidden] = useState<WidgetId[]>(() => loadJsonArray<WidgetId>(WIDGET_LOCAL_HIDDEN_KEY));
  const [localVisible, setLocalVisible] = useState<WidgetId[]>(() => loadJsonArray<WidgetId>(WIDGET_LOCAL_VISIBLE_KEY));
  const [globalVisible, setGlobalVisible] = useState<WidgetId[]>(DEFAULT_VISIBLE_WIDGETS);
  const [globalHidden, setGlobalHidden] = useState<WidgetId[]>([]);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [calcValue, setCalcValue] = useState('0');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getDoc(WIDGET_DOC)
      .then((snapshot) => {
        if (!isMounted || !snapshot.exists()) return;
        const hidden = snapshot.data().hiddenWidgetIds;
        const visible = snapshot.data().visibleWidgetIds;
        if (Array.isArray(hidden)) setGlobalHidden(hidden.filter((id): id is WidgetId => WIDGETS.some((widget) => widget.id === id)));
        if (Array.isArray(visible)) setGlobalVisible(visible.filter((id): id is WidgetId => WIDGETS.some((widget) => widget.id === id)));
      })
      .catch((error) => {
        console.error('Failed to load widget settings:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleWidgetIds = useMemo(
    () => {
      const base = new Set<WidgetId>([...globalVisible, ...localVisible]);
      return WIDGETS
        .map((widget) => widget.id)
        .filter((id) => base.has(id))
        .filter((id) => !localHidden.includes(id) && !globalHidden.includes(id));
    },
    [globalHidden, globalVisible, localHidden, localVisible],
  );

  const mediaItems = useMemo(
    () => apps.flatMap((app) =>
      (app.media || []).map((item) => ({
        ...item,
        appName: app.name,
      }))
    ),
    [apps],
  );
  const featuredMedia = mediaItems.slice(0, 4);
  const projectApps = apps.filter((app) => app.pinnedToDesktop && !['file-explorer', 'cv', 'settings', 'about-os', 'task-manager'].includes(app.id)).slice(0, 5);

  const saveLocalHidden = (ids: WidgetId[]) => {
    setLocalHidden(ids);
    localStorage.setItem(WIDGET_LOCAL_HIDDEN_KEY, JSON.stringify(ids));
  };

  const saveLocalVisible = (ids: WidgetId[]) => {
    setLocalVisible(ids);
    localStorage.setItem(WIDGET_LOCAL_VISIBLE_KEY, JSON.stringify(ids));
  };

  const saveGlobalWidgetSettings = async (settings: { hiddenWidgetIds?: WidgetId[]; visibleWidgetIds?: WidgetId[] }) => {
    if (settings.hiddenWidgetIds) setGlobalHidden(settings.hiddenWidgetIds);
    if (settings.visibleWidgetIds) setGlobalVisible(settings.visibleWidgetIds);
    await setDoc(WIDGET_DOC, { ...settings, updated_at: new Date().toISOString() }, { merge: true });
  };

  const dismissWidget = async (id: WidgetId) => {
    if (isAdmin) {
      const next = Array.from(new Set([...globalHidden, id]));
      await saveGlobalWidgetSettings({
        hiddenWidgetIds: next,
        visibleWidgetIds: globalVisible.filter((visibleId) => visibleId !== id),
      });
      addNotification({
        type: 'success',
        title: 'Widget hidden globally',
        message: `${WIDGETS.find((widget) => widget.id === id)?.name ?? 'Widget'} will no longer show by default.`,
        duration: 2200,
      });
      return;
    }
    saveLocalHidden(Array.from(new Set([...localHidden, id])));
  };

  const toggleWidget = async (id: WidgetId) => {
    if (isAdmin) {
      const nextVisible = globalVisible.includes(id)
        ? globalVisible.filter((visibleId) => visibleId !== id)
        : [...globalVisible, id];
      const nextHidden = globalHidden.filter((hiddenId) => hiddenId !== id);
      await saveGlobalWidgetSettings({ visibleWidgetIds: nextVisible, hiddenWidgetIds: nextHidden });
      return;
    }

    const isVisible = visibleWidgetIds.includes(id);
    if (isVisible) {
      saveLocalHidden(Array.from(new Set([...localHidden, id])));
      return;
    }

    saveLocalHidden(localHidden.filter((hiddenId) => hiddenId !== id));
    saveLocalVisible(Array.from(new Set([...localVisible, id])));
  };

  const handlePositionChange = (id: WidgetId, position: { x: number; y: number }) => {
    setPositions((current) => {
      const next = { ...current, [id]: position };
      localStorage.setItem(WIDGET_POSITION_KEY, JSON.stringify(next));
      return next;
    });
  };

  const appendCalc = (value: string) => {
    setCalcValue((current) => current === '0' ? value : `${current}${value}`);
  };

  const evaluateCalc = () => {
    try {
      if (!/^[\d+\-*/. ()]+$/.test(calcValue)) return;
      const result = Function(`"use strict"; return (${calcValue})`)();
      setCalcValue(Number.isFinite(result) ? String(Math.round(result * 100000) / 100000) : '0');
    } catch {
      setCalcValue('0');
    }
  };

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case 'creator':
        return (
          <WidgetShell id={id} title="Creator" position={positions[id]} onDismiss={dismissWidget} onPositionChange={handlePositionChange}>
            <div className="relative p-4">
              <WidgetHeader label="Creator" title="Keketso Matsuma" icon={Icons.UserRound} />
              <p className="text-sm leading-6 text-white/52">
                You are exploring a working portfolio environment: interface systems, motion, apps, files, and publishing logic shaped into one place.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ['System', 'GenOS'],
                  ['Focus', 'UI systems'],
                  ['Mode', 'Portfolio'],
                ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-os-line-dark bg-os-ink-900 px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-[0.08em] text-white/38">{label}</p>
                    <p className="mt-1 truncate text-[11px] font-medium text-white/76">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </WidgetShell>
        );
      case 'projects':
        return (
          <WidgetShell id={id} title="Projects" position={positions[id]} onDismiss={dismissWidget} onPositionChange={handlePositionChange}>
            <div className="relative p-4">
              <WidgetHeader label="Projects" title="Desktop apps" icon={Icons.Blocks} />
              <div className="space-y-2">
                {projectApps.length > 0 ? projectApps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => openWindow(app)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-os-line-dark bg-os-ink-900 px-3 py-2 text-left transition-colors hover:border-stroke-brand hover:bg-os-ink-800"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-os-ink-950 text-primary-300">
                      <Icons.Box className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-white/80">{app.name}</span>
                      <span className="block truncate text-[10px] text-white/42">{app.description || 'Project application'}</span>
                    </span>
                  </button>
                )) : (
                  <p className="rounded-xl border border-dashed border-os-line-dark bg-os-ink-900 px-3 py-4 text-xs leading-5 text-white/48">
                    Project apps will appear here when they are pinned to the desktop.
                  </p>
                )}
              </div>
            </div>
          </WidgetShell>
        );
      case 'calendar': {
        const month = now.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
        const day = now.toLocaleDateString('en-ZA', { weekday: 'long' });
        return (
          <WidgetShell id={id} title="Calendar" position={positions[id]} onDismiss={dismissWidget} onPositionChange={handlePositionChange} className="w-[260px]">
            <div className="relative p-4">
              <WidgetHeader label={month} title={String(now.getDate()).padStart(2, '0')} icon={Icons.CalendarDays} />
              <p className="text-sm font-medium text-white/78">{day}</p>
              <p className="mt-2 text-xs leading-5 text-white/48">A quiet date surface for the desktop. The full calendar stays in the taskbar.</p>
            </div>
          </WidgetShell>
        );
      }
      case 'time':
        return (
          <WidgetShell id={id} title="Time" position={positions[id]} onDismiss={dismissWidget} onPositionChange={handlePositionChange} className="w-[260px]">
            <div className="relative p-4">
              <WidgetHeader label="Local time" title={now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })} icon={Icons.Clock3} />
              <p className="text-xs text-white/48">{now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </WidgetShell>
        );
      case 'media':
        return (
          <WidgetShell id={id} title="Media" position={positions[id]} onDismiss={dismissWidget} onPositionChange={handlePositionChange} className="min-h-[170px]">
            <div className="relative p-3">
              <div className="mb-3 flex items-center justify-between pr-8">
                <div className="flex items-center gap-2">
                  <Icons.PlaySquare className="h-4 w-4 text-primary-300" />
                  <p className="text-xs font-semibold text-white/72">Project media</p>
                </div>
                <span className="text-[10px] text-white/42">{featuredMedia.length} items</span>
              </div>

              {featuredMedia.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {featuredMedia.map((item) => (
                    <div key={item.id} className="relative overflow-hidden rounded-xl border border-os-line-dark bg-os-ink-900">
                      {item.type === 'video' ? (
                        <video src={item.url} muted playsInline loop autoPlay className="aspect-video w-full object-cover opacity-85" />
                      ) : (
                        <img src={item.url} alt={item.name || item.appName} loading="lazy" decoding="async" className="aspect-video w-full object-cover opacity-85" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="truncate text-[10px] font-medium text-white/72">{item.appName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-os-line-dark bg-os-ink-900 text-center">
                  <div>
                    <Icons.Images className="mx-auto h-5 w-5 text-white/18" />
                    <p className="mt-2 text-xs text-white/46">Add app media to activate this widget.</p>
                  </div>
                </div>
              )}
            </div>
          </WidgetShell>
        );
      case 'news':
        return (
          <WidgetShell id={id} title="News" position={positions[id]} onDismiss={dismissWidget} onPositionChange={handlePositionChange} className="w-[280px]">
            <div className="relative p-4">
              <WidgetHeader label="Reads" title="Curated signal" icon={Icons.Newspaper} />
              <p className="text-sm leading-6 text-white/58">New reads, project notes, and system updates can sit here without turning the desktop into a notice board.</p>
            </div>
          </WidgetShell>
        );
      case 'calculator':
        return (
          <WidgetShell id={id} title="Calculator" position={positions[id]} onDismiss={dismissWidget} onPositionChange={handlePositionChange} className="w-[260px]">
            <div className="relative p-3">
              <div className="mb-3 flex items-center gap-2 pr-8">
                <Icons.Calculator className="h-4 w-4 text-primary-300" />
                <p className="text-xs font-semibold text-white/72">Quick calc</p>
              </div>
              <div className="mb-2 rounded-xl border border-os-line-dark bg-os-ink-950 px-3 py-2 text-right text-lg font-semibold text-white/78">{calcValue}</div>
              <div className="grid grid-cols-4 gap-1.5">
                {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => key === '=' ? evaluateCalc() : appendCalc(key)}
                    className="h-8 rounded-lg border border-os-line-dark bg-os-ink-900 text-xs font-semibold text-white/62 transition-colors hover:bg-os-ink-800 hover:text-white"
                  >
                    {key}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setCalcValue('0')} className="mt-2 w-full rounded-lg border border-os-line-dark bg-os-ink-900 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/38 transition-colors hover:text-white/72">Clear</button>
            </div>
          </WidgetShell>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="pointer-events-auto absolute right-6 top-4 z-[55] flex w-72 justify-end">
        <button
          type="button"
          onClick={() => setPickerOpen((open) => !open)}
          className="flex items-center gap-2 rounded-full border border-os-line-dark bg-background-chrome/82 px-3 py-2 text-xs font-semibold text-white/58 shadow-os-card transition-colors hover:border-stroke-brand hover:text-white"
        >
          <Icons.LayoutDashboard className="h-3.5 w-3.5 text-primary-300" />
          Widgets
          <span className="rounded-full bg-os-ink-900 px-1.5 py-0.5 text-[10px] text-white/34">{visibleWidgetIds.length}</span>
        </button>

        {isPickerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-[calc(100%+8px)] w-72 overflow-hidden rounded-2xl border border-os-line-dark bg-background-chrome p-2 shadow-os-window"
          >
            {WIDGETS.map((widget) => {
              const Icon = Icons[widget.icon] as React.ElementType;
              const hidden = !visibleWidgetIds.includes(widget.id);
              return (
                <button
                  key={widget.id}
                  type="button"
                  onClick={() => toggleWidget(widget.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-os-ink-800"
                >
                  <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg border border-os-line-dark', hidden ? 'bg-os-ink-950 text-white/20' : 'bg-os-ink-900 text-primary-300')}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-white/70">{widget.name}</span>
                    <span className="block truncate text-[10px] text-white/30">{widget.description}</span>
                  </span>
                  {hidden ? <Icons.EyeOff className="h-3.5 w-3.5 text-white/28" /> : <Icons.Eye className="h-3.5 w-3.5 text-primary-300" />}
                </button>
              );
            })}
            <p className="px-2.5 pb-1 pt-2 text-[10px] leading-4 text-white/28">
              {isAdmin ? 'Superuser changes affect everyone.' : 'Visitor changes are saved on this device.'}
            </p>
          </motion.div>
        )}
      </div>

      {visibleWidgetIds.map((id) => (
        <div key={id}>{renderWidget(id)}</div>
      ))}
    </>
  );
}
