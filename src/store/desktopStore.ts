import { create } from 'zustand';
import { App, WindowState, FileItem } from '../types';
import { supabase } from '../lib/supabase';

interface DesktopBackground {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  type?: 'gradient' | 'image' | 'aurora' | 'beams' | 'grid';
  config?: Record<string, any>;
}

interface SystemPreferences {
  taskbarPosition: 'top' | 'bottom' | 'left' | 'right';
  taskbarSize: 'small' | 'medium' | 'large';
  iconSize: 'small' | 'medium' | 'large';
  windowAnimations: boolean;
  autoHideTaskbar: boolean;
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

  addApp: (app: App) => void;
  removeApp: (appId: string) => void;
  updateApp: (appId: string, updates: Partial<App>) => void;
  updateAppPosition: (appId: string, position: { x: number; y: number }) => void;
  reorderApps: (reorderedApps: App[]) => void;

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

  loadApps: (apps: App[]) => void;
  fetchApps: () => Promise<void>;
  exportConfig: () => string;
  importConfig: (json: string) => void;

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
    name: 'File Explorer',
    icon: 'folder',
    type: 'component',
    component: 'FileExplorer',
    pinnedToTaskbar: true,
    pinnedToDesktop: true,
    desktopPosition: { x: 50, y: 50 },
    defaultSize: { width: 800, height: 600 },
    description: 'Browse portfolio files and projects'
  },
  {
    id: 'browser',
    name: 'Portfolio Browser',
    icon: 'globe',
    type: 'component',
    component: 'Browser',
    pinnedToTaskbar: true,
    pinnedToDesktop: true,
    desktopPosition: { x: 50, y: 150 },
    defaultSize: { width: 900, height: 700 },
    description: 'Browse portfolio websites'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: 'calculator',
    type: 'component',
    component: 'Calculator',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 150, y: 50 },
    defaultSize: { width: 320, height: 480 },
    description: 'Simple calculator app'
  },
  {
    id: 'notepad',
    name: 'Notepad',
    icon: 'file-text',
    type: 'component',
    component: 'Notepad',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 150, y: 150 },
    defaultSize: { width: 600, height: 400 },
    description: 'Simple text editor'
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: 'cloud',
    type: 'component',
    component: 'Weather',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 250, y: 50 },
    defaultSize: { width: 400, height: 500 },
    description: 'Johannesburg weather widget'
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    icon: 'activity',
    type: 'component',
    component: 'TaskManager',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 250, y: 150 },
    defaultSize: { width: 700, height: 500 },
    description: 'View running portfolio projects'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    type: 'iframe',
    url: 'https://github.com',
    pinnedToTaskbar: false,
    pinnedToDesktop: false,
    defaultSize: { width: 900, height: 700 },
    description: 'View GitHub profile'
  },
  {
    id: 'about',
    name: 'About Me',
    icon: 'user',
    type: 'component',
    component: 'About',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 350, y: 150 },
    defaultSize: { width: 600, height: 500 },
    description: 'Software Developer from Johannesburg'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'settings',
    type: 'component',
    component: 'Settings',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 450, y: 50 },
    defaultSize: { width: 700, height: 600 },
    description: 'Portfolio settings and preferences'
  },
  {
    id: 'resume',
    name: 'Resume',
    icon: 'file-text',
    type: 'component',
    component: 'Resume',
    pinnedToTaskbar: true,
    pinnedToDesktop: true,
    desktopPosition: { x: 550, y: 50 },
    defaultSize: { width: 800, height: 700 },
    description: 'Professional resume and CV'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    icon: 'briefcase',
    type: 'component',
    component: 'Portfolio',
    pinnedToTaskbar: true,
    pinnedToDesktop: true,
    desktopPosition: { x: 550, y: 150 },
    defaultSize: { width: 900, height: 700 },
    description: 'Portfolio projects showcase'
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: 'zap',
    type: 'component',
    component: 'Skills',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 650, y: 50 },
    defaultSize: { width: 700, height: 600 },
    description: 'Skills and technologies showcase'
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: 'mail',
    type: 'component',
    component: 'Contact',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 650, y: 150 },
    defaultSize: { width: 500, height: 400 },
    description: 'Contact information and links'
  }
];

// Helper to debounce Supabase saves
let appsTimeout: NodeJS.Timeout;
const saveAppsToSupabase = async (apps: App[]) => {
  if (appsTimeout) clearTimeout(appsTimeout);

  appsTimeout = setTimeout(async () => {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ id: 'apps', data: apps, updated_at: new Date().toISOString() });

      if (error) {
        console.error('Error saving apps to Supabase:', error);
      }
    } catch (e: any) {
      console.error('Failed to save apps:', e);
    }
  }, 1000); // 1s debounce
};

// Fetch apps from Supabase
const fetchAppsFromSupabase = async (): Promise<App[]> => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 'apps')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data && data.data) {
      const dbApps = data.data as App[];
      // Merge: Add any default apps that are missing from DB
      // This ensures new apps added to the code (defaultApps) are synced to Supabase
      const missingApps = defaultApps.filter(defApp => !dbApps.some(dbApp => dbApp.id === defApp.id));

      if (missingApps.length > 0) {
        console.log('Found new apps in code, syncing to Supabase:', missingApps.map(a => a.name));
        const mergedApps = [...dbApps, ...missingApps];
        // Save back to sync immediately
        await saveAppsToSupabase(mergedApps);
        return mergedApps;
      }

      return dbApps;
    } else {
      // No apps found, initialize with defaults
      await saveAppsToSupabase(defaultApps);
      return defaultApps;
    }
  } catch (err: any) {
    console.error('Error fetching apps:', err);
    return defaultApps;
  }
};

// Backgrounds Supabase integration
let backgroundsTimeout: NodeJS.Timeout;
const saveBackgroundsToSupabase = async (backgrounds: DesktopBackground[]) => {
  if (backgroundsTimeout) clearTimeout(backgroundsTimeout);

  backgroundsTimeout = setTimeout(async () => {
    try {
      // Only save custom backgrounds (not defaults)
      const customBackgrounds = backgrounds.filter(b => !b.id.startsWith('default-'));
      const { error } = await supabase
        .from('site_content')
        .upsert({ id: 'backgrounds', data: customBackgrounds, updated_at: new Date().toISOString() });

      if (error) {
        console.error('Error saving backgrounds to Supabase:', error);
      }
    } catch (e: any) {
      console.error('Failed to save backgrounds:', e);
    }
  }, 1000); // 1s debounce
};

const fetchBackgroundsFromSupabase = async (): Promise<DesktopBackground[]> => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 'backgrounds')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data && data.data) {
      const customBackgrounds = data.data as DesktopBackground[];
      // Merge defaults with custom backgrounds
      return [...defaultBackgrounds, ...customBackgrounds];
    } else {
      return defaultBackgrounds;
    }
  } catch (err: any) {
    console.error('Error fetching backgrounds:', err);
    return defaultBackgrounds;
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
    id: 'default-aurora',
    name: 'Aurora Dreams',
    url: '',
    type: 'aurora',
    config: { colors: ['#667eea', '#764ba2', '#f093fb'] },
  },
  {
    id: 'default-beams',
    name: 'Energy Beams',
    url: '',
    type: 'beams',
    config: { color: '#667eea', opacity: 0.3 },
  },
  {
    id: 'default-grid',
    name: 'Cyber Grid',
    url: '',
    type: 'grid',
    config: { dotColor: '#667eea', spacing: 30 },
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
    type: 'aurora',
    config: { colors: ['#00d9ff', '#0066ff', '#00e5cc'] },
  },
  {
    id: 'default-starcitizen-beams',
    name: 'Quantum Beams',
    url: '',
    type: 'beams',
    config: { color: '#00d9ff', opacity: 0.4 },
  },
  {
    id: 'default-hud-grid',
    name: 'HUD Grid',
    url: '',
    type: 'grid',
    config: { dotColor: '#00d9ff', spacing: 40 },
  },
];

// Selected background ID Supabase integration
const saveSelectedBackgroundToSupabase = async (backgroundId: string) => {
  try {
    await supabase
      .from('site_content')
      .upsert({ id: 'selectedBackground', data: { backgroundId }, updated_at: new Date().toISOString() });
  } catch (e: any) {
    console.error('Failed to save selected background:', e);
  }
};

const fetchSelectedBackgroundFromSupabase = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 'selectedBackground')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data && data.data && data.data.backgroundId) {
      return data.data.backgroundId;
    }
    return 'default-quantum'; // Star Citizen default
  } catch (err: any) {
    console.error('Error fetching selected background:', err);
    return 'default-quantum';
  }
};

const defaultSystemPreferences: SystemPreferences = {
  taskbarPosition: 'bottom',
  taskbarSize: 'medium',
  iconSize: 'medium',
  windowAnimations: true,
  autoHideTaskbar: false,
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
  apps: defaultApps, // Will be loaded from Supabase via fetchApps()
  windows: [],
  isStartMenuOpen: false,
  isAdminMode: false,
  maxZIndex: 1000,
  backgrounds: defaultBackgrounds, // Will be loaded from Supabase via fetchBackgrounds()
  selectedBackgroundId: 'default-quantum', // Will be loaded from Supabase
  systemPreferences: loadSystemPreferences(),

  fetchApps: async () => {
    const apps = await fetchAppsFromSupabase();
    set({ apps });
  },

  fetchBackgrounds: async () => {
    const backgrounds = await fetchBackgroundsFromSupabase();
    const selectedBackgroundId = await fetchSelectedBackgroundFromSupabase();
    set({ backgrounds, selectedBackgroundId });
  },

  addApp: (app) => set((state) => {
    const newApps = [...state.apps, app];
    saveAppsToSupabase(newApps);
    return { apps: newApps };
  }),

  removeApp: (appId) => set((state) => {
    const newApps = state.apps.filter(a => a.id !== appId);
    const newWindows = state.windows.filter(w => w.appId !== appId);
    saveAppsToSupabase(newApps);
    return { apps: newApps, windows: newWindows };
  }),

  updateApp: (appId, updates) => set((state) => {
    const newApps = state.apps.map(a => a.id === appId ? { ...a, ...updates } : a);
    saveAppsToSupabase(newApps);
    return { apps: newApps };
  }),

  updateAppPosition: (appId, position) => set((state) => {
    const newApps = state.apps.map(a =>
      a.id === appId ? { ...a, desktopPosition: position } : a
    );
    saveAppsToSupabase(newApps);
    return { apps: newApps };
  }),

  reorderApps: (reorderedApps) => set((state) => {
    // Replace desktop apps with reordered ones, keep non-desktop apps
    const nonDesktopApps = state.apps.filter(a => !a.pinnedToDesktop);
    const newApps = [...reorderedApps, ...nonDesktopApps];
    saveAppsToSupabase(newApps);
    return { apps: newApps };
  }),

  openWindow: (app, fileData) => set((state) => {
    // If opening a file, check if we already have this specific file open
    const existingWindow = fileData
      ? state.windows.find(w => w.fileId === fileData.fileId)
      : state.windows.find(w => w.appId === app.id && !w.fileId);

    if (existingWindow) {
      return {
        windows: state.windows.map(w =>
          w.id === existingWindow.id ? { ...w, isMinimized: false, zIndex: state.maxZIndex + 1 } : w
        ),
        maxZIndex: state.maxZIndex + 1
      };
    }

    const newWindow: WindowState = {
      id: `${app.id}-${Date.now()}`,
      appId: app.id,
      title: fileData?.title || app.name,
      icon: app.icon,
      type: app.type,
      component: app.component,
      url: app.url,
      content: fileData?.content,
      fileId: fileData?.fileId,
      file: fileData?.file,
      position: { x: 100 + state.windows.length * 30, y: 100 + state.windows.length * 30 },
      size: app.defaultSize || { width: 800, height: 600 },
      isMinimized: false,
      isMaximized: false,
      zIndex: state.maxZIndex + 1
    };

    return {
      windows: [...state.windows, newWindow],
      maxZIndex: state.maxZIndex + 1
    };
  }),

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

  loadApps: (apps) => {
    set({ apps });
    saveAppsToSupabase(apps);
  },

  exportConfig: () => {
    const { apps } = get();
    return JSON.stringify(apps, null, 2);
  },

  importConfig: (json) => {
    try {
      const apps = JSON.parse(json);
      set({ apps });
      saveAppsToSupabase(apps);
    } catch (e) {
      console.error('Invalid JSON configuration');
    }
  },
  addBackground: (background) => set((state) => {
    const newBackgrounds = [...state.backgrounds, background];
    saveBackgroundsToSupabase(newBackgrounds);
    return { backgrounds: newBackgrounds };
  }),

  removeBackground: (backgroundId) => set((state) => {
    // Don't allow removing default backgrounds
    if (backgroundId.startsWith('default-')) return state;

    const newBackgrounds = state.backgrounds.filter(b => b.id !== backgroundId);
    saveBackgroundsToSupabase(newBackgrounds);

    // If removed background was selected, switch to default
    const newSelectedId = state.selectedBackgroundId === backgroundId
      ? 'default-quantum'
      : state.selectedBackgroundId;

    saveSelectedBackgroundToSupabase(newSelectedId);

    return {
      backgrounds: newBackgrounds,
      selectedBackgroundId: newSelectedId
    };
  }),

  setSelectedBackground: (backgroundId) => set((state) => {
    saveSelectedBackgroundToSupabase(backgroundId);
    return { selectedBackgroundId: backgroundId };
  }),

  resetBackgroundToDefault: async () => {
    const defaultId = 'default-quantum';
    saveSelectedBackgroundToSupabase(defaultId);
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
