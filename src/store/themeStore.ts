import { create } from 'zustand';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  fetchTheme: () => Promise<void>;
  updateColors: (colors: Partial<ThemeColors>) => void;
  setBorderRadius: (radius: ThemeSettings['borderRadius']) => void;
  setSpacing: (spacing: ThemeSettings['spacing']) => void;
  setIconStyle: (style: ThemeSettings['iconStyle']) => void;
  applyPreset: (presetName: string) => void;
  resetToDefault: () => Promise<void>;
  applyThemeToDom: (theme: ThemeSettings) => void;
}

const generativeStudioTheme: ThemeSettings = {
  colors: {
    primary: '#ef4444',
    secondary: '#dc2626',
    tertiary: '#f97316',
    accent: '#fbbf24',
  },
  borderRadius: 'lg',
  spacing: 'normal',
  iconStyle: 'default',
};

const presets = [
  { name: 'Generative Studio', theme: generativeStudioTheme },
  {
    name: 'Ocean Blue',
    theme: {
      colors: { primary: '#0ea5e9', secondary: '#06b6d4', tertiary: '#3b82f6', accent: '#14b8a6' },
      borderRadius: 'lg' as const, spacing: 'normal' as const, iconStyle: 'rounded' as const,
    },
  },
  {
    name: 'Forest Green',
    theme: {
      colors: { primary: '#22c55e', secondary: '#10b981', tertiary: '#84cc16', accent: '#eab308' },
      borderRadius: 'lg' as const, spacing: 'normal' as const, iconStyle: 'default' as const,
    },
  },
  {
    name: 'Purple Haze',
    theme: {
      colors: { primary: '#a855f7', secondary: '#8b5cf6', tertiary: '#d946ef', accent: '#ec4899' },
      borderRadius: 'xl' as const, spacing: 'comfortable' as const, iconStyle: 'rounded' as const,
    },
  },
  {
    name: 'Sunset Orange',
    theme: {
      colors: { primary: '#f97316', secondary: '#fb923c', tertiary: '#f59e0b', accent: '#ef4444' },
      borderRadius: 'lg' as const, spacing: 'normal' as const, iconStyle: 'default' as const,
    },
  },
  {
    name: 'Monochrome',
    theme: {
      colors: { primary: '#64748b', secondary: '#6b7280', tertiary: '#78716c', accent: '#71717a' },
      borderRadius: 'sm' as const, spacing: 'compact' as const, iconStyle: 'sharp' as const,
    },
  },
  {
    name: 'Cyberpunk',
    theme: {
      colors: { primary: '#06b6d4', secondary: '#ec4899', tertiary: '#a855f7', accent: '#eab308' },
      borderRadius: 'none' as const, spacing: 'compact' as const, iconStyle: 'sharp' as const,
    },
  },
  {
    name: 'Star Citizen',
    theme: {
      colors: { primary: '#00d9ff', secondary: '#0066ff', tertiary: '#00e5cc', accent: '#00ffff' },
      borderRadius: 'lg' as const, spacing: 'normal' as const, iconStyle: 'rounded' as const,
    },
  },
  {
    name: 'Product Mono',
    theme: {
      colors: { primary: '#111111', secondary: '#666666', tertiary: '#f5f5f3', accent: '#10b981' },
      borderRadius: 'md' as const, spacing: 'compact' as const, iconStyle: 'default' as const,
    },
  },
];


const fetchThemeFromFirestore = async (): Promise<ThemeSettings> => {
  try {
    const docSnap = await getDoc(doc(db, 'os-site_content', 'theme'));
    if (docSnap.exists() && docSnap.data().data) {
      return docSnap.data().data as ThemeSettings;
    }
    return generativeStudioTheme;
  } catch (err: any) {
    console.error('Error fetching theme:', err);
    return generativeStudioTheme;
  }
};

let themeTimeout: ReturnType<typeof setTimeout>;
const saveThemeToFirestore = (theme: ThemeSettings): void => {
  clearTimeout(themeTimeout);
  themeTimeout = setTimeout(async () => {
    try {
      await setDoc(doc(db, 'os-site_content', 'theme'), {
        data: theme,
        updated_at: new Date().toISOString(),
      });
    } catch (e: any) {
      console.error('Failed to save theme:', e);
    }
  }, 500);
};

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '239, 68, 68';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `${R}, ${G}, ${B}`;
};

const applyThemeToDom = (theme: ThemeSettings): void => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', hexToRgb(theme.colors.primary));
  root.style.setProperty('--color-secondary', hexToRgb(theme.colors.secondary));
  root.style.setProperty('--color-tertiary', hexToRgb(theme.colors.tertiary));
  root.style.setProperty('--color-accent', hexToRgb(theme.colors.accent));
  root.style.setProperty('--color-primary-hover', darkenColor(theme.colors.primary, 10));
  root.style.setProperty('--color-secondary-hover', darkenColor(theme.colors.secondary, 10));
  root.style.setProperty('--color-tertiary-hover', darkenColor(theme.colors.tertiary, 10));
  root.style.setProperty('--color-accent-hover', darkenColor(theme.colors.accent, 10));
  const radiusMap = { none: '0px', sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' };
  root.style.setProperty('--border-radius', radiusMap[theme.borderRadius]);
  const spacingMap = { compact: '0.75', normal: '1', comfortable: '1.25' };
  root.style.setProperty('--spacing-scale', spacingMap[theme.spacing]);
  root.setAttribute('data-icon-style', theme.iconStyle);
  root.setAttribute('data-border-radius', theme.borderRadius);
  root.setAttribute('data-spacing', theme.spacing);

  // OS base tokens — space-separated RGB channels required by rgb(var(--token) / alpha) Tailwind syntax
  root.style.setProperty('--os-ink-950', '17 17 17');
  root.style.setProperty('--os-ink-900', '21 21 21');
  root.style.setProperty('--os-ink-800', '31 31 31');
  root.style.setProperty('--os-ink-700', '42 42 42');
  root.style.setProperty('--os-canvas', '#ffffff');
  root.style.setProperty('--os-canvas-warm', '#f7f7f5');
  root.style.setProperty('--os-canvas-raised', '#fbfbfa');
  root.style.setProperty('--os-line-dark', 'rgba(255,255,255,0.08)');
  root.style.setProperty('--os-line-dark-hover', 'rgba(255,255,255,0.14)');
  root.style.setProperty('--os-line-light', '#e8e8e5');
  root.style.setProperty('--os-line-light-hover', '#d8d8d4');
  root.style.setProperty('--os-text-strong', '#171717');
  root.style.setProperty('--os-text-muted', '#666666');
  root.style.setProperty('--os-text-faint', '#9a9a9a');
  root.style.setProperty('--os-text-inverse', '#ffffff');
};

export const useThemeStore = create<ThemeState>(() => {
  if (typeof window !== 'undefined') {
    applyThemeToDom(generativeStudioTheme);
  }

  return {
    theme: generativeStudioTheme,
    presets,

    fetchTheme: async () => {
      const theme = await fetchThemeFromFirestore();
      applyThemeToDom(theme);
      useThemeStore.setState({ theme });
    },

    updateColors: (colors) => {
      const current = useThemeStore.getState().theme;
      const newTheme = { ...current, colors: { ...current.colors, ...colors } };
      saveThemeToFirestore(newTheme);
      applyThemeToDom(newTheme);
      useThemeStore.setState({ theme: newTheme });
    },

    setBorderRadius: (radius) => {
      const current = useThemeStore.getState().theme;
      const newTheme = { ...current, borderRadius: radius };
      saveThemeToFirestore(newTheme);
      applyThemeToDom(newTheme);
      useThemeStore.setState({ theme: newTheme });
    },

    setSpacing: (spacing) => {
      const current = useThemeStore.getState().theme;
      const newTheme = { ...current, spacing };
      saveThemeToFirestore(newTheme);
      applyThemeToDom(newTheme);
      useThemeStore.setState({ theme: newTheme });
    },

    setIconStyle: (style) => {
      const current = useThemeStore.getState().theme;
      const newTheme = { ...current, iconStyle: style };
      saveThemeToFirestore(newTheme);
      applyThemeToDom(newTheme);
      useThemeStore.setState({ theme: newTheme });
    },

    applyPreset: (presetName) => {
      const preset = presets.find((p) => p.name === presetName);
      if (preset) {
        saveThemeToFirestore(preset.theme);
        applyThemeToDom(preset.theme);
        useThemeStore.setState({ theme: preset.theme });
      }
    },

    resetToDefault: async () => {
      const theme = await fetchThemeFromFirestore();
      applyThemeToDom(theme);
      useThemeStore.setState({ theme });
    },

    applyThemeToDom,
  };
});
