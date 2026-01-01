import { create } from 'zustand';

/**
 * Theme Store
 * Manages visual customization for the entire OS
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
}

export interface ThemeSettings {
  colors: ThemeColors;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing: 'compact' | 'normal' | 'comfortable';
  iconStyle: 'default' | 'rounded' | 'sharp';
}

interface ThemeState {
  theme: ThemeSettings;
  presets: { name: string; theme: ThemeSettings }[];
  updateColors: (colors: Partial<ThemeColors>) => void;
  setBorderRadius: (radius: ThemeSettings['borderRadius']) => void;
  setSpacing: (spacing: ThemeSettings['spacing']) => void;
  setIconStyle: (style: ThemeSettings['iconStyle']) => void;
  applyPreset: (presetName: string) => void;
  resetToDefault: () => void;
  applyThemeToDom: (theme: ThemeSettings) => void;
}

// Default theme
const defaultTheme: ThemeSettings = {
  colors: {
    primary: '#ef4444', // red-500
    secondary: '#3b82f6', // blue-500
    tertiary: '#8b5cf6', // violet-500
    accent: '#f59e0b', // amber-500
  },
  borderRadius: 'lg',
  spacing: 'normal',
  iconStyle: 'default',
};

// Preset themes
const presets = [
  {
    name: 'Default',
    theme: defaultTheme,
  },
  {
    name: 'Ocean Blue',
    theme: {
      colors: {
        primary: '#0ea5e9', // sky-500
        secondary: '#06b6d4', // cyan-500
        tertiary: '#3b82f6', // blue-500
        accent: '#14b8a6', // teal-500
      },
      borderRadius: 'lg' as const,
      spacing: 'normal' as const,
      iconStyle: 'rounded' as const,
    },
  },
  {
    name: 'Forest Green',
    theme: {
      colors: {
        primary: '#22c55e', // green-500
        secondary: '#10b981', // emerald-500
        tertiary: '#84cc16', // lime-500
        accent: '#eab308', // yellow-500
      },
      borderRadius: 'lg' as const,
      spacing: 'normal' as const,
      iconStyle: 'default' as const,
    },
  },
  {
    name: 'Purple Haze',
    theme: {
      colors: {
        primary: '#a855f7', // purple-500
        secondary: '#8b5cf6', // violet-500
        tertiary: '#d946ef', // fuchsia-500
        accent: '#ec4899', // pink-500
      },
      borderRadius: 'xl' as const,
      spacing: 'comfortable' as const,
      iconStyle: 'rounded' as const,
    },
  },
  {
    name: 'Sunset Orange',
    theme: {
      colors: {
        primary: '#f97316', // orange-500
        secondary: '#fb923c', // orange-400
        tertiary: '#f59e0b', // amber-500
        accent: '#ef4444', // red-500
      },
      borderRadius: 'lg' as const,
      spacing: 'normal' as const,
      iconStyle: 'default' as const,
    },
  },
  {
    name: 'Monochrome',
    theme: {
      colors: {
        primary: '#64748b', // slate-500
        secondary: '#6b7280', // gray-500
        tertiary: '#78716c', // stone-500
        accent: '#71717a', // zinc-500
      },
      borderRadius: 'sm' as const,
      spacing: 'compact' as const,
      iconStyle: 'sharp' as const,
    },
  },
  {
    name: 'Cyberpunk',
    theme: {
      colors: {
        primary: '#06b6d4', // cyan-500
        secondary: '#ec4899', // pink-500
        tertiary: '#8b5cf6', // violet-500
        accent: '#eab308', // yellow-500
      },
      borderRadius: 'none' as const,
      spacing: 'compact' as const,
      iconStyle: 'sharp' as const,
    },
  },
];

// Storage key
const THEME_STORAGE_KEY = 'portfolioOS_theme';

// Cyberpunk as default theme
const cyberpunkTheme: ThemeSettings = {
  colors: {
    primary: '#06b6d4', // cyan-500
    secondary: '#ec4899', // pink-500
    tertiary: '#8b5cf6', // violet-500
    accent: '#eab308', // yellow-500
  },
  borderRadius: 'none',
  spacing: 'compact',
  iconStyle: 'sharp',
};

/**
 * Load theme from localStorage
 */
const loadThemeFromStorage = (): ThemeSettings => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse theme from storage:', e);
    }
  }
  return cyberpunkTheme;
};

/**
 * Save theme to localStorage
 */
const saveThemeToStorage = (theme: ThemeSettings): void => {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
};

/**
 * Convert hex color to RGB values
 */
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '239, 68, 68'; // fallback to red-500
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

/**
 * Darken a hex color by a percentage
 */
const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `${R}, ${G}, ${B}`;
};

/**
 * Apply theme to DOM using CSS variables
 */
const applyThemeToDom = (theme: ThemeSettings): void => {
  const root = document.documentElement;

  // Apply base colors as CSS variables
  root.style.setProperty('--color-primary', hexToRgb(theme.colors.primary));
  root.style.setProperty('--color-secondary', hexToRgb(theme.colors.secondary));
  root.style.setProperty('--color-tertiary', hexToRgb(theme.colors.tertiary));
  root.style.setProperty('--color-accent', hexToRgb(theme.colors.accent));

  // Apply hover states (darker variants)
  root.style.setProperty('--color-primary-hover', darkenColor(theme.colors.primary, 10));
  root.style.setProperty('--color-secondary-hover', darkenColor(theme.colors.secondary, 10));
  root.style.setProperty('--color-tertiary-hover', darkenColor(theme.colors.tertiary, 10));
  root.style.setProperty('--color-accent-hover', darkenColor(theme.colors.accent, 10));

  // Apply border radius
  const radiusMap = {
    none: '0px',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  };
  root.style.setProperty('--border-radius', radiusMap[theme.borderRadius]);

  // Apply spacing scale
  const spacingMap = {
    compact: '0.75',
    normal: '1',
    comfortable: '1.25',
  };
  root.style.setProperty('--spacing-scale', spacingMap[theme.spacing]);

  // Apply icon style class
  root.setAttribute('data-icon-style', theme.iconStyle);
  root.setAttribute('data-border-radius', theme.borderRadius);
  root.setAttribute('data-spacing', theme.spacing);
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = loadThemeFromStorage();

  // Apply theme on initialization
  if (typeof window !== 'undefined') {
    applyThemeToDom(initialTheme);
  }

  return {
    theme: initialTheme,
    presets,

    updateColors: (colors) => {
      const newTheme = {
        ...get().theme,
        colors: { ...get().theme.colors, ...colors },
      };
      saveThemeToStorage(newTheme);
      applyThemeToDom(newTheme);
      set({ theme: newTheme });
    },

    setBorderRadius: (radius) => {
      const newTheme = {
        ...get().theme,
        borderRadius: radius,
      };
      saveThemeToStorage(newTheme);
      applyThemeToDom(newTheme);
      set({ theme: newTheme });
    },

    setSpacing: (spacing) => {
      const newTheme = {
        ...get().theme,
        spacing,
      };
      saveThemeToStorage(newTheme);
      applyThemeToDom(newTheme);
      set({ theme: newTheme });
    },

    setIconStyle: (style) => {
      const newTheme = {
        ...get().theme,
        iconStyle: style,
      };
      saveThemeToStorage(newTheme);
      applyThemeToDom(newTheme);
      set({ theme: newTheme });
    },

    applyPreset: (presetName) => {
      const preset = presets.find((p) => p.name === presetName);
      if (preset) {
        saveThemeToStorage(preset.theme);
        applyThemeToDom(preset.theme);
        set({ theme: preset.theme });
      }
    },

    resetToDefault: () => {
      saveThemeToStorage(defaultTheme);
      applyThemeToDom(defaultTheme);
      set({ theme: defaultTheme });
    },

    applyThemeToDom,
  };
});
