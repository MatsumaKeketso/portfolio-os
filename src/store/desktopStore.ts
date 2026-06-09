import { create } from 'zustand';
import { App, WindowState, FileItem } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface DesktopBackground {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  // 'solid' = single colour from config.base. 'animated-gradient' renders a
  // drifting multi-blob gradient from config.colors (CSS-only, GPU-cheap).
  // 'aurora'/'beams'/'grid' are legacy labels kept for backward compat with
  // stored selections (no preset uses them anymore).
  type?: 'gradient' | 'image' | 'solid' | 'animated-gradient' | 'aurora' | 'beams' | 'grid';
  config?: { colors?: string[]; base?: string; [key: string]: any };
}

interface SystemPreferences {
  taskbarPosition: 'top' | 'bottom' | 'left' | 'right';
  taskbarSize: 'small' | 'medium' | 'large';
  iconSize: 'small' | 'medium' | 'large';
  windowAnimations: boolean;
  autoHideTaskbar: boolean;
  startIconVariant: 'color' | 'white' | 'black';
}

interface PublishResult {
  success: boolean;
  error?: string;
}

interface DesktopStore {
  apps: App[];
  windows: WindowState[];
  isStartMenuOpen: boolean;
  isAdminMode: boolean;
  maxZIndex: number;
  backgrounds: DesktopBackground[];
  selectedBackgroundId: string;
  systemPreferences: SystemPreferences;
  adminEditTargetAppId: string | null;
  setAdminEditTarget: (appId: string | null) => void;

  addApp: (app: App) => Promise<PublishResult>;
  removeApp: (appId: string) => Promise<PublishResult>;
  updateApp: (appId: string, updates: Partial<App>) => Promise<PublishResult>;
  updateAppPosition: (appId: string, position: { x: number; y: number }) => Promise<PublishResult>;
  reorderApps: (reorderedApps: App[]) => Promise<PublishResult>;

  openWindow: (app: App, fileData?: { fileId?: string; content?: string; title?: string; file?: FileItem }) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void;
  updateWindowSize: (windowId: string, size: { width: number; height: number }) => void;
  updateWindow: (windowId: string, updates: Partial<WindowState>) => void;
  bringToFront: (windowId: string) => void;

  toggleStartMenu: () => void;
  setStartMenuOpen: (open: boolean) => void;
  toggleAdminMode: () => void;
  setAdminMode: (mode: boolean) => void;

  loadApps: (apps: App[]) => Promise<PublishResult>;
  fetchApps: () => Promise<void>;
  exportConfig: () => string;
  importConfig: (json: string) => Promise<PublishResult>;

  fetchBackgrounds: () => Promise<void>;
  addBackground: (background: DesktopBackground) => void;
  removeBackground: (backgroundId: string) => void;
  setSelectedBackground: (backgroundId: string) => void;
  resetBackgroundToDefault: () => Promise<void>;
  getSelectedBackground: () => DesktopBackground | undefined;

  updateSystemPreferences: (preferences: Partial<SystemPreferences>) => void;
  setTaskbarPosition: (position: SystemPreferences['taskbarPosition']) => void;
  setTaskbarSize: (size: SystemPreferences['taskbarSize']) => void;
  setIconSize: (size: SystemPreferences['iconSize']) => void;
  setWindowAnimations: (enabled: boolean) => void;
  setAutoHideTaskbar: (enabled: boolean) => void;
}

const defaultApps: App[] = [
  {
    id: 'file-explorer',
    name: 'Archive',
    icon: 'folder',
    type: 'component',
    component: 'FileExplorer',
    surfaceMode: 'glass',
    pinnedToTaskbar: true,
    pinnedToDesktop: true,
    desktopPosition: { x: 50, y: 50 },
    defaultSize: { width: 860, height: 600 },
    minSize: { width: 580, height: 400 },
    mobileBehavior: 'maximize',
    description: 'Browse and manage portfolio files',
  },
  {
    id: 'cv',
    name: 'CV',
    icon: 'user-check',
    type: 'component',
    component: 'CV',
    surfaceMode: 'glass',
    pinnedToTaskbar: true,
    pinnedToDesktop: true,
    desktopPosition: { x: 50, y: 150 },
    defaultSize: { width: 780, height: 640 },
    minSize: { width: 520, height: 480 },
    mobileBehavior: 'maximize',
    description: 'Profile, experience, skills, projects, and contact',
  },
  {
    id: 'browser',
    name: 'Browser',
    icon: 'globe',
    type: 'component',
    component: 'Browser',
    surfaceMode: 'glass',
    pinnedToTaskbar: true,
    pinnedToDesktop: true,
    desktopPosition: { x: 150, y: 50 },
    defaultSize: { width: 900, height: 700 },
    minSize: { width: 480, height: 360 },
    mobileBehavior: 'maximize',
    description: 'Browse the web and project links',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'wallet-cards',
    type: 'component',
    component: 'Finance',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 350, y: 50 },
    defaultSize: { width: 880, height: 640 },
    minSize: { width: 620, height: 440 },
    mobileBehavior: 'maximize',
    description: 'Quote, budget, and runway planner',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'settings',
    type: 'component',
    component: 'Settings',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 150, y: 150 },
    defaultSize: { width: 700, height: 600 },
    minSize: { width: 480, height: 400 },
    mobileBehavior: 'maximize',
    description: 'System preferences and profile editing',
  },
  {
    id: 'about-os',
    name: 'About This OS',
    icon: 'info',
    type: 'component',
    component: 'AboutOS',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 250, y: 50 },
    defaultSize: { width: 700, height: 580 },
    minSize: { width: 480, height: 400 },
    mobileBehavior: 'maximize',
    description: 'GenOS — concept, stack, and build info',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    icon: 'history',
    type: 'component',
    component: 'Timeline',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 350, y: 150 },
    defaultSize: { width: 860, height: 620 },
    minSize: { width: 480, height: 420 },
    preferredWindowMode: 'floating',
    mobileBehavior: 'maximize',
    description: 'A live record of progress, updates, ideas, and system evolution',
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    icon: 'activity',
    type: 'component',
    component: 'TaskManager',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 250, y: 150 },
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 460, height: 320 },
    description: 'Running processes and system info',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: 'calculator',
    type: 'component',
    component: 'Calculator',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: false,
    defaultSize: { width: 320, height: 480 },
    minSize: { width: 280, height: 420 },
    preferredWindowMode: 'fixed',
    description: 'System calculator',
  },
  {
    id: 'notepad',
    name: 'Notepad',
    icon: 'file-text',
    type: 'component',
    component: 'Notepad',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: false,
    defaultSize: { width: 600, height: 400 },
    description: 'Plain text editor',
  },
  {
    id: 'music',
    name: 'Music',
    icon: 'music',
    type: 'component',
    component: 'Music',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: false,
    defaultSize: { width: 420, height: 580 },
    minSize: { width: 340, height: 480 },
    mobileBehavior: 'maximize',
    singleInstance: true,
    description: 'Audio player for Archive tracks',
  },
  {
    id: 'pdf-reader',
    name: 'PDF Reader',
    icon: 'file-type',
    type: 'component',
    component: 'PDFReader',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: false,
    defaultSize: { width: 820, height: 700 },
    minSize: { width: 480, height: 400 },
    mobileBehavior: 'maximize',
    description: 'PDF document viewer',
  },
  {
    id: 'video-player',
    name: 'Video Player',
    icon: 'play-circle',
    type: 'component',
    component: 'VideoPlayer',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: false,
    defaultSize: { width: 860, height: 560 },
    minSize: { width: 480, height: 320 },
    mobileBehavior: 'maximize',
    description: 'Video file player',
  },
  {
    id: 'image-viewer',
    name: 'Image Viewer',
    icon: 'image',
    type: 'component',
    component: 'ImageViewer',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: false,
    defaultSize: { width: 900, height: 680 },
    minSize: { width: 480, height: 360 },
    mobileBehavior: 'maximize',
    description: 'Image viewer with zoom and pan',
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: 'cloud',
    type: 'component',
    component: 'Weather',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: false,
    defaultSize: { width: 400, height: 500 },
    description: 'Johannesburg weather',
  },
  {
    id: 'feedback',
    name: 'Feedback',
    icon: 'message-square',
    type: 'component',
    component: 'Feedback',
    surfaceMode: 'glass',
    pinnedToTaskbar: true,
    pinnedToDesktop: false,
    defaultSize: { width: 700, height: 600 },
    minSize: { width: 500, height: 450 },
    description: 'Send feedback and report issues',
  },
  {
    id: 'admin-panel',
    name: 'Admin Panel',
    icon: 'settings',
    type: 'component',
    component: 'AdminPanel',
    surfaceMode: 'glass',
    pinnedToTaskbar: false,
    pinnedToDesktop: false,
    defaultSize: { width: 1000, height: 800 },
    description: 'OS Content Management and Administration',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    type: 'iframe',
    surfaceMode: 'iframe',
    url: 'https://github.com/MatsumaKeketso',
    pinnedToTaskbar: false,
    pinnedToDesktop: false,
    defaultSize: { width: 900, height: 700 },
    description: 'Keketso on GitHub',
  },
];

const SUPERUSER_EMAIL = 'admin@os.com';
const canWrite = () => auth.currentUser?.email?.toLowerCase() === SUPERUSER_EMAIL;
const BACKGROUNDS_BACKUP_KEY = 'portfolioOS_backgrounds';
const SELECTED_BACKGROUND_BACKUP_KEY = 'portfolioOS_selectedBackground';

const loadLocalBackgrounds = (): DesktopBackground[] => {
  try {
    const stored = localStorage.getItem(BACKGROUNDS_BACKUP_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as { data?: DesktopBackground[] };
    return Array.isArray(parsed.data) ? parsed.data : [];
  } catch {
    return [];
  }
};

const saveLocalBackgrounds = (backgrounds: DesktopBackground[]) => {
  try {
    const customBackgrounds = backgrounds.filter(b => !b.id.startsWith('default-'));
    localStorage.setItem(BACKGROUNDS_BACKUP_KEY, JSON.stringify({
      data: customBackgrounds,
      updated_at: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Failed to save local backgrounds backup:', err);
  }
};

const mergeBackgrounds = (...backgroundSets: Array<DesktopBackground[] | null | undefined>): DesktopBackground[] => {
  const byId = new Map<string, DesktopBackground>();
  for (const backgrounds of backgroundSets) {
    for (const background of backgrounds ?? []) {
      byId.set(background.id, { ...byId.get(background.id), ...background });
    }
  }
  return Array.from(byId.values());
};

const saveAppsToFirestore = async (apps: App[]): Promise<PublishResult> => {
  if (!canWrite()) {
    return {
      success: false,
      error: 'Only admin@os.com can publish global app changes.',
    };
  }

  try {
    // Strip undefined fields — Firestore rejects them
    const sanitized = JSON.parse(JSON.stringify(apps)) as App[];
    await setDoc(doc(db, 'os-site_content', 'apps'), {
      data: sanitized,
      updated_at: new Date().toISOString(),
    });
    return { success: true };
  } catch (e: any) {
    console.error('Failed to save apps:', e);
    return {
      success: false,
      error: e.message || 'Failed to publish apps to Firestore.',
    };
  }
};

const fetchAppsFromFirestore = async (): Promise<App[]> => {
  try {
    const docSnap = await getDoc(doc(db, 'os-site_content', 'apps'));
    if (docSnap.exists() && docSnap.data().data) {
      const dbApps = (docSnap.data().data as App[]).map((app) =>
        app.id === 'file-explorer' && app.name === 'File Explorer'
          ? { ...app, name: 'Archive' }
          : app
      );
      const missingApps = defaultApps.filter(defApp => !dbApps.some(dbApp => dbApp.id === defApp.id));
      if (missingApps.length > 0) {
        const mergedApps = [...dbApps, ...missingApps];
        if (canWrite()) await saveAppsToFirestore(mergedApps);
        return mergedApps;
      }
      if (canWrite() && (docSnap.data().data as App[]).some((app) => app.id === 'file-explorer' && app.name === 'File Explorer')) {
        await saveAppsToFirestore(dbApps);
      }
      return dbApps;
    }
    if (canWrite()) await saveAppsToFirestore(defaultApps);
    return defaultApps;
  } catch (err: any) {
    console.error('Error fetching apps:', err);
    return defaultApps;
  }
};

let backgroundsTimeout: ReturnType<typeof setTimeout>;
const saveBackgroundsToFirestore = (backgrounds: DesktopBackground[]): void => {
  saveLocalBackgrounds(backgrounds);
  if (!canWrite()) return;
  clearTimeout(backgroundsTimeout);
  backgroundsTimeout = setTimeout(async () => {
    if (!canWrite()) return;
    try {
      const customBackgrounds = backgrounds.filter(b => !b.id.startsWith('default-'));
      await setDoc(doc(db, 'os-site_content', 'backgrounds'), {
        data: customBackgrounds,
        updated_at: new Date().toISOString(),
      });
    } catch (e: any) {
      console.error('Failed to save backgrounds:', e);
    }
  }, 1000);
};

const fetchBackgroundsFromFirestore = async (): Promise<DesktopBackground[]> => {
  const localBackgrounds = loadLocalBackgrounds();
  try {
    const docSnap = await getDoc(doc(db, 'os-site_content', 'backgrounds'));
    if (docSnap.exists() && docSnap.data().data) {
      const customBackgrounds = docSnap.data().data as DesktopBackground[];
      const merged = mergeBackgrounds(defaultBackgrounds, customBackgrounds, localBackgrounds);
      if (localBackgrounds.some((local) => !customBackgrounds.find((remote) => remote.id === local.id))) {
        saveBackgroundsToFirestore(merged);
      } else {
        saveLocalBackgrounds(merged);
      }
      return merged;
    }
    const merged = mergeBackgrounds(defaultBackgrounds, localBackgrounds);
    saveBackgroundsToFirestore(merged);
    return merged;
  } catch (err: any) {
    console.error('Error fetching backgrounds:', err);
    return mergeBackgrounds(defaultBackgrounds, localBackgrounds);
  }
};

const defaultBackgrounds: DesktopBackground[] = [
  {
    id: 'default-blue',
    name: 'Windows Blue',
    url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'gradient',
  },
  {
    id: 'default-dark',
    name: 'Dark Space',
    url: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    type: 'gradient',
  },
  {
    id: 'default-sunset',
    name: 'Sunset',
    url: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    type: 'gradient',
  },
  {
    id: 'default-forest',
    name: 'Forest',
    url: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    type: 'gradient',
  },
  {
    id: 'default-brand-flow',
    name: 'Brand Flow',
    url: '',
    type: 'animated-gradient',
    // Theme-bound: references the brand ramp, so this animated background
    // re-tints automatically when the brand color changes.
    config: { base: '#08080c', colors: ['rgb(var(--brand-400))', 'rgb(var(--brand-600))', 'rgb(var(--brand-800))'] },
  },
  // Brand-themed static options (re-tint with the brand color).
  {
    id: 'default-brand-gradient',
    name: 'Brand Gradient',
    url: 'linear-gradient(135deg, rgb(var(--brand-1300)) 0%, #0b0b10 72%)',
    type: 'gradient',
  },
  {
    id: 'default-brand-solid',
    name: 'Brand Tint',
    url: '',
    type: 'solid',
    config: { base: 'rgb(var(--brand-1700))' },
  },
  // Neutral solids — calm, minimal surfaces.
  {
    id: 'default-ink',
    name: 'Ink',
    url: '',
    type: 'solid',
    config: { base: '#0a0a0c' },
  },
  {
    id: 'default-graphite',
    name: 'Graphite',
    url: '',
    type: 'solid',
    config: { base: '#16181d' },
  },
  {
    id: 'default-aurora',
    name: 'Aurora Dreams',
    url: '',
    type: 'animated-gradient',
    config: { base: '#0a0816', colors: ['#7c5cff', '#a855f7', '#ec4899'] },
  },
  {
    id: 'default-beams',
    name: 'Ember Flow',
    url: '',
    type: 'animated-gradient',
    config: { base: '#120a0a', colors: ['#f97316', '#ef4444', '#a855f7'] },
  },
  {
    id: 'default-grid',
    name: 'Cyan Flow',
    url: '',
    type: 'animated-gradient',
    config: { base: '#05080f', colors: ['#06b6d4', '#3b82f6', '#22d3ee'] },
  },
  // Star Citizen Themed Backgrounds
  {
    id: 'default-quantum',
    name: 'Quantum Drive',
    url: 'linear-gradient(135deg, #001a33 0%, #004d99 50%, #00d9ff 100%)',
    type: 'gradient',
  },
  {
    id: 'default-starcitizen-space',
    name: 'Deep Space',
    url: 'linear-gradient(180deg, #000000 0%, #0a1628 50%, #001a33 100%)',
    type: 'gradient',
  },
  {
    id: 'default-nebula-cyan',
    name: 'Cyan Nebula',
    url: 'linear-gradient(135deg, #001a33 0%, #00334d 25%, #00d9ff 75%, #00ffff 100%)',
    type: 'gradient',
  },
  {
    id: 'default-microtech',
    name: 'Microtech Sky',
    url: 'linear-gradient(135deg, #003d5c 0%, #0066ff 50%, #00d9ff 100%)',
    type: 'gradient',
  },
  {
    id: 'default-crusader',
    name: 'Crusader Atmosphere',
    url: 'linear-gradient(180deg, #001233 0%, #003366 25%, #0066cc 75%, #0099ff 100%)',
    type: 'gradient',
  },
  {
    id: 'default-starcitizen-aurora',
    name: 'Star Citizen Aurora',
    url: '',
    type: 'animated-gradient',
    config: { base: '#04121a', colors: ['#00d9ff', '#0066ff', '#00e5cc'] },
  },
  {
    id: 'default-starcitizen-beams',
    name: 'Quantum Beams',
    url: '',
    type: 'animated-gradient',
    config: { base: '#04101a', colors: ['#22d3ee', '#3b82f6', '#00d9ff'] },
  },
  {
    id: 'default-hud-grid',
    name: 'HUD Glow',
    url: '',
    type: 'animated-gradient',
    config: { base: '#05080f', colors: ['#00e5cc', '#0066ff', '#00d9ff'] },
  },
];

const saveSelectedBackgroundToFirestore = async (backgroundId: string): Promise<void> => {
  localStorage.setItem(SELECTED_BACKGROUND_BACKUP_KEY, backgroundId);
  if (!canWrite()) return;
  try {
    await setDoc(doc(db, 'os-site_content', 'selectedBackground'), {
      data: { backgroundId },
      updated_at: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('Failed to save selected background:', e);
  }
};

const fetchSelectedBackgroundFromFirestore = async (): Promise<string> => {
  const localSelected = localStorage.getItem(SELECTED_BACKGROUND_BACKUP_KEY);
  try {
    const docSnap = await getDoc(doc(db, 'os-site_content', 'selectedBackground'));
    if (docSnap.exists() && docSnap.data().data?.backgroundId) {
      const backgroundId = docSnap.data().data.backgroundId;
      localStorage.setItem(SELECTED_BACKGROUND_BACKUP_KEY, backgroundId);
      return backgroundId;
    }
    return localSelected || 'default-quantum';
  } catch (err: any) {
    console.error('Error fetching selected background:', err);
    return localSelected || 'default-quantum';
  }
};

const defaultSystemPreferences: SystemPreferences = {
  taskbarPosition: 'bottom',
  taskbarSize: 'medium',
  iconSize: 'medium',
  windowAnimations: true,
  autoHideTaskbar: false,
  startIconVariant: 'color',
};

const loadSystemPreferences = (): SystemPreferences => {
  const stored = localStorage.getItem('portfolioOS_systemPreferences');
  if (stored) {
    try {
      return { ...defaultSystemPreferences, ...JSON.parse(stored) };
    } catch (e) {
      return defaultSystemPreferences;
    }
  }
  return defaultSystemPreferences;
};

const saveSystemPreferences = (preferences: SystemPreferences): void => {
  localStorage.setItem('portfolioOS_systemPreferences', JSON.stringify(preferences));
};

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  apps: defaultApps,
  windows: [],
  isStartMenuOpen: false,
  isAdminMode: false,
  maxZIndex: 1000,
  backgrounds: defaultBackgrounds,
  selectedBackgroundId: 'default-quantum',
  systemPreferences: loadSystemPreferences(),
  adminEditTargetAppId: null,
  setAdminEditTarget: (appId) => set({ adminEditTargetAppId: appId }),

  fetchApps: async () => {
    const apps = await fetchAppsFromFirestore();
    set({ apps });
  },

  fetchBackgrounds: async () => {
    const backgrounds = await fetchBackgroundsFromFirestore();
    const selectedBackgroundId = await fetchSelectedBackgroundFromFirestore();
    set({ backgrounds, selectedBackgroundId });
  },

  addApp: async (app) => {
    const newApps = [...get().apps, app];
    const result = await saveAppsToFirestore(newApps);
    if (result.success) set({ apps: newApps });
    return result;
  },

  removeApp: async (appId) => {
    const state = get();
    const newApps = state.apps.filter(a => a.id !== appId);
    const result = await saveAppsToFirestore(newApps);
    if (result.success) {
      set({
        apps: newApps,
        windows: state.windows.filter(w => w.appId !== appId),
      });
    }
    return result;
  },

  updateApp: async (appId, updates) => {
    const newApps = get().apps.map(a => a.id === appId ? { ...a, ...updates } : a);
    const result = await saveAppsToFirestore(newApps);
    if (result.success) set({ apps: newApps });
    return result;
  },

  updateAppPosition: async (appId, position) => {
    const newApps = get().apps.map(a =>
      a.id === appId ? { ...a, desktopPosition: position } : a
    );
    const result = await saveAppsToFirestore(newApps);
    if (result.success) set({ apps: newApps });
    return result;
  },

  reorderApps: async (reorderedApps) => {
    const state = get();
    const nonDesktopApps = state.apps.filter(a => !a.pinnedToDesktop);
    const newApps = [...reorderedApps, ...nonDesktopApps];
    const result = await saveAppsToFirestore(newApps);
    if (result.success) set({ apps: newApps });
    return result;
  },

  openWindow: (app, fileData) => {
    if (app.type === 'link' && app.url) {
      globalThis.window.open(app.url, '_blank', 'noopener,noreferrer');
      return;
    }
    const windowType: WindowState['type'] = app.type === 'link' ? 'iframe' : app.type;
    set((state) => {
    // Window match priority:
    //   1. singleInstance apps reuse the existing window for that appId regardless of file
    //   2. file-mode opens reuse any window already bound to the same fileId
    //   3. non-file opens reuse the existing empty (no fileId) window for that appId
    const existingWindow = app.singleInstance
      ? state.windows.find(w => w.appId === app.id)
      : fileData
        ? state.windows.find(w => w.fileId === fileData.fileId)
        : state.windows.find(w => w.appId === app.id && !w.fileId);

    if (existingWindow) {
      return {
        windows: state.windows.map(w =>
          w.id === existingWindow.id
            ? {
                ...w,
                isMinimized: false,
                zIndex: state.maxZIndex + 1,
                // For singleInstance apps, swap in the new file binding so the
                // title bar and `file` prop track the current item.
                ...(app.singleInstance && fileData
                  ? { fileId: fileData.fileId, file: fileData.file, title: fileData.title ?? w.title }
                  : {}),
              }
            : w
        ),
        maxZIndex: state.maxZIndex + 1
      };
    }

    const isMobile = typeof globalThis.window !== 'undefined' && globalThis.window.innerWidth < 768;

    if (isMobile && app.mobileBehavior === 'hide') {
      return state;
    }

    const defaultSize = app.defaultSize || { width: 800, height: 600 };
    const minSize = app.minSize;
    const resolvedSize = minSize
      ? {
          width: Math.max(defaultSize.width, minSize.width),
          height: Math.max(defaultSize.height, minSize.height),
        }
      : defaultSize;

    const openMaximized =
      app.preferredWindowMode === 'maximized' ||
      (isMobile && (app.mobileBehavior === 'maximize' || app.mobileBehavior === 'fullscreen'));

    const newWindow: WindowState = {
      id: `${app.id}-${Date.now()}`,
      appId: app.id,
      title: fileData?.title || app.name,
      icon: app.icon,
      customIcon: app.customIcon,
      type: windowType,
      component: app.component,
      url: app.url,
      content: fileData?.content,
      fileId: fileData?.fileId,
      file: fileData?.file,
      position: { x: 100 + state.windows.length * 30, y: 100 + state.windows.length * 30 },
      size: resolvedSize,
      isMinimized: false,
      isMaximized: openMaximized,
      zIndex: state.maxZIndex + 1,
      surfaceMode: app.surfaceMode ?? (app.type === 'iframe' ? 'iframe' : 'utilityDark'),
      minSize: app.minSize,
    };

    return {
      windows: [...state.windows, newWindow],
      maxZIndex: state.maxZIndex + 1
    };
    });
  },

  closeWindow: (windowId) => set((state) => ({
    windows: state.windows.filter(w => w.id !== windowId)
  })),

  minimizeWindow: (windowId) => set((state) => ({
    windows: state.windows.map(w =>
      w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
    )
  })),

  maximizeWindow: (windowId) => set((state) => ({
    windows: state.windows.map(w =>
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    )
  })),

  updateWindowPosition: (windowId, position) => set((state) => ({
    windows: state.windows.map(w =>
      w.id === windowId ? { ...w, position } : w
    )
  })),

  updateWindowSize: (windowId, size) => set((state) => ({
    windows: state.windows.map(w =>
      w.id === windowId ? { ...w, size } : w
    )
  })),

  updateWindow: (windowId, updates) => set((state) => ({
    windows: state.windows.map(w =>
      w.id === windowId ? { ...w, ...updates } : w
    )
  })),

  bringToFront: (windowId) => set((state) => ({
    windows: state.windows.map(w =>
      w.id === windowId ? { ...w, zIndex: state.maxZIndex + 1 } : w
    ),
    maxZIndex: state.maxZIndex + 1
  })),

  toggleStartMenu: () => set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen })),

  setStartMenuOpen: (open) => set({ isStartMenuOpen: open }),

  toggleAdminMode: () => set((state) => ({ isAdminMode: !state.isAdminMode })),

  setAdminMode: (mode) => set({ isAdminMode: mode }),

  loadApps: async (apps) => {
    const result = await saveAppsToFirestore(apps);
    if (result.success) set({ apps });
    return result;
  },

  exportConfig: () => {
    const { apps } = get();
    return JSON.stringify(apps, null, 2);
  },

  importConfig: async (json) => {
    try {
      const apps = JSON.parse(json);
      if (!Array.isArray(apps)) {
        return { success: false, error: 'Imported config must be an app array.' };
      }
      const result = await saveAppsToFirestore(apps);
      if (result.success) set({ apps });
      return result;
    } catch (e) {
      console.error('Invalid JSON configuration');
      return { success: false, error: 'Invalid JSON configuration.' };
    }
  },
  addBackground: (background) => set((state) => {
    const newBackgrounds = [...state.backgrounds, background];
    saveBackgroundsToFirestore(newBackgrounds);
    return { backgrounds: newBackgrounds };
  }),

  removeBackground: (backgroundId) => set((state) => {
    // Don't allow removing default backgrounds
    if (backgroundId.startsWith('default-')) return state;

    const newBackgrounds = state.backgrounds.filter(b => b.id !== backgroundId);
    saveBackgroundsToFirestore(newBackgrounds);

    // If removed background was selected, switch to default
    const newSelectedId = state.selectedBackgroundId === backgroundId
      ? 'default-quantum'
      : state.selectedBackgroundId;

    saveSelectedBackgroundToFirestore(newSelectedId);

    return {
      backgrounds: newBackgrounds,
      selectedBackgroundId: newSelectedId
    };
  }),

  setSelectedBackground: (backgroundId) => set(() => {
    saveSelectedBackgroundToFirestore(backgroundId);
    return { selectedBackgroundId: backgroundId };
  }),

  resetBackgroundToDefault: async () => {
    const defaultId = 'default-quantum';
    saveSelectedBackgroundToFirestore(defaultId);
    set({ selectedBackgroundId: defaultId });
  },

  getSelectedBackground: () => {
    const state = get();
    return state.backgrounds.find(b => b.id === state.selectedBackgroundId);
  },

  updateSystemPreferences: (preferences) => set((state) => {
    const newPreferences = { ...state.systemPreferences, ...preferences };
    saveSystemPreferences(newPreferences);
    return { systemPreferences: newPreferences };
  }),

  setTaskbarPosition: (position) => set((state) => {
    const newPreferences = { ...state.systemPreferences, taskbarPosition: position };
    saveSystemPreferences(newPreferences);
    return { systemPreferences: newPreferences };
  }),

  setTaskbarSize: (size) => set((state) => {
    const newPreferences = { ...state.systemPreferences, taskbarSize: size };
    saveSystemPreferences(newPreferences);
    return { systemPreferences: newPreferences };
  }),

  setIconSize: (size) => set((state) => {
    const newPreferences = { ...state.systemPreferences, iconSize: size };
    saveSystemPreferences(newPreferences);
    return { systemPreferences: newPreferences };
  }),

  setWindowAnimations: (enabled) => set((state) => {
    const newPreferences = { ...state.systemPreferences, windowAnimations: enabled };
    saveSystemPreferences(newPreferences);
    return { systemPreferences: newPreferences };
  }),

  setAutoHideTaskbar: (enabled) => set((state) => {
    const newPreferences = { ...state.systemPreferences, autoHideTaskbar: enabled };
    saveSystemPreferences(newPreferences);
    return { systemPreferences: newPreferences };
  }),
}));
