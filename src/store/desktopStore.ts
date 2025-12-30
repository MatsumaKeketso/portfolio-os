import { create } from 'zustand';
import { App, WindowState } from '../types';

interface DesktopStore {
  apps: App[];
  windows: WindowState[];
  isStartMenuOpen: boolean;
  isAdminMode: boolean;
  maxZIndex: number;

  addApp: (app: App) => void;
  removeApp: (appId: string) => void;
  updateApp: (appId: string, updates: Partial<App>) => void;

  openWindow: (app: App) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void;
  updateWindowSize: (windowId: string, size: { width: number; height: number }) => void;
  bringToFront: (windowId: string) => void;

  toggleStartMenu: () => void;
  setStartMenuOpen: (open: boolean) => void;
  toggleAdminMode: () => void;
  setAdminMode: (mode: boolean) => void;

  loadApps: (apps: App[]) => void;
  exportConfig: () => string;
  importConfig: (json: string) => void;
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
    id: 'nailhub',
    name: 'NailHub Social',
    icon: 'heart',
    type: 'iframe',
    url: 'https://www.nailhub.co.za',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 350, y: 50 },
    defaultSize: { width: 900, height: 700 },
    description: 'Social platform for nail artists'
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
  }
];

const loadAppsFromStorage = (): App[] => {
  const stored = localStorage.getItem('portfolioOS_apps');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultApps;
    }
  }
  return defaultApps;
};

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  apps: loadAppsFromStorage(),
  windows: [],
  isStartMenuOpen: false,
  isAdminMode: false,
  maxZIndex: 1000,

  addApp: (app) => set((state) => {
    const newApps = [...state.apps, app];
    localStorage.setItem('portfolioOS_apps', JSON.stringify(newApps));
    return { apps: newApps };
  }),

  removeApp: (appId) => set((state) => {
    const newApps = state.apps.filter(a => a.id !== appId);
    const newWindows = state.windows.filter(w => w.appId !== appId);
    localStorage.setItem('portfolioOS_apps', JSON.stringify(newApps));
    return { apps: newApps, windows: newWindows };
  }),

  updateApp: (appId, updates) => set((state) => {
    const newApps = state.apps.map(a => a.id === appId ? { ...a, ...updates } : a);
    localStorage.setItem('portfolioOS_apps', JSON.stringify(newApps));
    return { apps: newApps };
  }),

  openWindow: (app) => set((state) => {
    const existingWindow = state.windows.find(w => w.appId === app.id);
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
      title: app.name,
      icon: app.icon,
      type: app.type,
      component: app.component,
      url: app.url,
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

  loadApps: (apps) => set({ apps }),

  exportConfig: () => {
    const { apps } = get();
    return JSON.stringify(apps, null, 2);
  },

  importConfig: (json) => {
    try {
      const apps = JSON.parse(json);
      set({ apps });
      localStorage.setItem('portfolioOS_apps', json);
    } catch (e) {
      console.error('Invalid JSON configuration');
    }
  }
}));
