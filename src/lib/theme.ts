/**
 * Design System Theme Configuration
 * Inspired by Framer UI with custom PortfolioOS color scheme
 *
 * Color Scheme:
 * - Primary: Red (main actions, focus states)
 * - Secondary: White/Gray (neutral, backgrounds)
 * - Tertiary: Orange (accents, highlights)
 * - System: Dark grays (surfaces, cards)
 */

export const theme = {
  // Color Tokens
  colors: {
    // Primary - Red (main brand color)
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',  // Base primary
      600: '#dc2626',  // Primary hover
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },

    // Secondary - White/Neutral (supporting, backgrounds)
    secondary: {
      50: '#ffffff',
      100: '#f9fafb',
      200: '#f3f4f6',
      300: '#e5e7eb',
      400: '#d1d5db',
      500: '#9ca3af',  // Base secondary
      600: '#6b7280',
      700: '#4b5563',
      800: '#374151',
      900: '#1f2937',
      950: '#0a0a0a',
    },

    // Tertiary - Orange (accents, highlights)
    tertiary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',  // Base tertiary
      600: '#ea580c',  // Tertiary hover
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },

    // System - Dark surfaces (Framer-inspired)
    system: {
      bg: {
        primary: '#0a0a0a',      // Main background
        secondary: '#111111',    // Card background
        tertiary: '#1a1a1a',     // Elevated surfaces
        overlay: 'rgba(0, 0, 0, 0.8)',
      },
      surface: {
        base: '#171717',         // Base surface
        raised: '#1f1f1f',       // Raised surface
        overlay: '#262626',      // Overlay surface
      },
      border: {
        subtle: 'rgba(255, 255, 255, 0.08)',
        default: 'rgba(255, 255, 255, 0.12)',
        strong: 'rgba(255, 255, 255, 0.18)',
      },
      text: {
        primary: '#ffffff',
        secondary: '#a1a1a1',
        tertiary: '#737373',
        disabled: '#525252',
      },
    },

    // Semantic colors
    semantic: {
      success: {
        base: '#10b981',
        hover: '#059669',
        text: '#d1fae5',
      },
      warning: {
        base: '#f59e0b',
        hover: '#d97706',
        text: '#fef3c7',
      },
      danger: {
        base: '#ef4444',
        hover: '#dc2626',
        text: '#fee2e2',
      },
      info: {
        base: '#3b82f6',
        hover: '#2563eb',
        text: '#dbeafe',
      },
    },
  },

  // Spacing tokens (consistent spacing scale)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border radius tokens
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadow tokens (Framer-style elevation)
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Glow effects for primary color
    glowPrimary: '0 0 20px rgba(239, 68, 68, 0.3)',
    glowPrimaryHover: '0 0 30px rgba(239, 68, 68, 0.5)',

    // Glow effects for tertiary color
    glowTertiary: '0 0 20px rgba(249, 115, 22, 0.3)',
    glowTertiaryHover: '0 0 30px rgba(249, 115, 22, 0.5)',
  },

  // Typography tokens
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Animation tokens
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Gradient presets (desktop icon card style)
  gradients: {
    // Primary gradients
    primaryBase: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    primaryHover: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',

    // Tertiary gradients
    tertiaryBase: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    tertiaryHover: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',

    // System gradients (Framer-style)
    systemBg: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
    systemCard: 'linear-gradient(180deg, #171717 0%, #0a0a0a 100%)',

    // Accent bar (desktop icon style)
    accentBar: 'linear-gradient(90deg, #ef4444 0%, #f97316 50%, #ef4444 100%)',

    // Divider gradient (desktop icon style)
    divider: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.12) 50%, transparent 100%)',
  },
} as const;

/**
 * Desktop Icon Card Styling Preset
 * Replicates the Netflix-style preview card from DesktopIcons component
 */
export const cardPresets = {
  hoverCard: {
    container: 'relative bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-xl overflow-hidden shadow-2xl border border-gray-700/50',
    accentBar: 'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500',
    content: 'p-6',
    iconGlow: 'bg-gradient-to-br from-red-500/30 to-orange-500/30 blur-2xl',
    title: 'text-white text-2xl font-bold text-center mb-3 tracking-tight',
    description: 'text-gray-300 text-sm text-center leading-relaxed mb-5 min-h-[40px]',
    divider: 'h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent',
    badge: {
      primary: 'px-2.5 py-1 bg-red-500/15 text-red-300 border border-red-500/30 rounded-full text-xs font-medium',
      tertiary: 'px-2.5 py-1 bg-orange-500/15 text-orange-300 border border-orange-500/30 rounded-full text-xs font-medium',
    },
  },

  standardCard: {
    container: 'bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20',
    content: 'p-6',
    header: 'text-xl font-bold text-white mb-4',
    body: 'text-slate-300 text-sm leading-relaxed',
  },
} as const;

/**
 * Helper function to get color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  // If color is already rgba, replace opacity
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }

  // Convert hex to rgba
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
}

/**
 * Type exports for TypeScript
 */
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeRadius = typeof theme.radius;
