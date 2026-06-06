import { create } from 'zustand';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { generateBrandRamp, brandLegacyChannels, idealOnColor, BRAND_STOPS } from '../lib/brandRamp';

// The OS theme is a SINGLE brand color. Everything else (focus rings, hovers,
// subtle fills, borders) is derived from it via the brand ramp — see
// src/lib/brandRamp.ts. Secondary/tertiary/accent were removed; legacy CSS
// vars are still populated (pointed at the brand) for backward compatibility
// with components that haven't migrated off `primary-*`/`accent-*` utilities.
export interface ThemeColors {
  primary: string;
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
  colors: { primary: '#ef4444' },
  borderRadius: 'lg',
  spacing: 'normal',
  iconStyle: 'default',
};

// Presets are now a single brand hex each. Layout prefs (radius/spacing/icon)
// are carried per-preset for variety but are independent of the color system.
const presets = [
  { name: 'Generative Studio', theme: generativeStudioTheme },
  { name: 'Ocean Blue',   theme: { colors: { primary: '#0ea5e9' }, borderRadius: 'lg' as const, spacing: 'normal' as const, iconStyle: 'rounded' as const } },
  { name: 'Forest Green',  theme: { colors: { primary: '#22c55e' }, borderRadius: 'lg' as const, spacing: 'normal' as const, iconStyle: 'default' as const } },
  { name: 'Purple Haze',   theme: { colors: { primary: '#a855f7' }, borderRadius: 'xl' as const, spacing: 'comfortable' as const, iconStyle: 'rounded' as const } },
  { name: 'Sunset Orange', theme: { colors: { primary: '#f97316' }, borderRadius: 'lg' as const, spacing: 'normal' as const, iconStyle: 'default' as const } },
  { name: 'Monochrome',    theme: { colors: { primary: '#64748b' }, borderRadius: 'sm' as const, spacing: 'compact' as const, iconStyle: 'sharp' as const } },
  { name: 'Cyberpunk',     theme: { colors: { primary: '#06b6d4' }, borderRadius: 'none' as const, spacing: 'compact' as const, iconStyle: 'sharp' as const } },
  { name: 'Star Citizen',  theme: { colors: { primary: '#00d9ff' }, borderRadius: 'lg' as const, spacing: 'normal' as const, iconStyle: 'rounded' as const } },
  { name: 'Product Mono',  theme: { colors: { primary: '#111111' }, borderRadius: 'md' as const, spacing: 'compact' as const, iconStyle: 'default' as const } },
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
  const brandHex = theme.colors.primary;

  // ── Brand ramp (canonical) ─────────────────────────────────────────────
  // 11 space-separated "r g b" stops + DEFAULT (verbatim brand). Consumed via
  // `rgb(var(--brand-600) / <alpha>)` in tailwind.config.js and index.css.
  const ramp = generateBrandRamp(brandHex);
  for (const stop of BRAND_STOPS) {
    root.style.setProperty(`--brand-${stop}`, ramp[stop]);
  }
  root.style.setProperty('--brand', ramp.DEFAULT);

  // Smart on-brand foreground: black or white, whichever contrasts better with
  // the brand SOLID fill (--brand-600). currentColor SVG icons inside a brand
  // button inherit this automatically, so the brand hue never hurts legibility.
  root.style.setProperty('--color-fg-on-primary', idealOnColor(ramp['600']));

  // ── Legacy compatibility ───────────────────────────────────────────────
  // `--color-primary` stays comma-separated for the legacy `primary-*`
  // Tailwind utilities that use `rgba(var(--color-primary), 0.05)`. Secondary
  // / tertiary / accent no longer exist as distinct theme colors; they point
  // at the brand so any un-migrated `secondary-*`/`accent-*` usage stays
  // on-brand instead of breaking.
  const legacy = brandLegacyChannels(brandHex);
  const legacyHover = darkenColor(brandHex, 10);
  root.style.setProperty('--color-primary', legacy);
  root.style.setProperty('--color-secondary', legacy);
  root.style.setProperty('--color-tertiary', legacy);
  root.style.setProperty('--color-accent', legacy);
  root.style.setProperty('--color-primary-hover', legacyHover);
  root.style.setProperty('--color-secondary-hover', legacyHover);
  root.style.setProperty('--color-tertiary-hover', legacyHover);
  root.style.setProperty('--color-accent-hover', legacyHover);
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
