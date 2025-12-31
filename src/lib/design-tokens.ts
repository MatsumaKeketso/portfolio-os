/**
 * Design Tokens for PortfolioOS
 * Centralized design system with Aceternity UI integration
 *
 * This file contains all design constants used throughout the application
 * to ensure consistency in colors, spacing, shadows, animations, and z-index layering
 */

// ===========================
// COLOR SYSTEM
// ===========================

/**
 * Aceternity-inspired premium color palette
 * Primary: Electric Blue to Purple gradient
 */
export const colors = {
  // Primary gradient (used for buttons, focused states, gradients)
  primary: {
    50: '#f0f4ff',
    100: '#e0e8ff',
    200: '#c7d6fe',
    300: '#a5b8fc',
    400: '#8b9df8',
    500: '#667eea', // Primary blue
    600: '#5a67d8',
    700: '#764ba2', // Primary purple
    800: '#6a3e9a',
    900: '#5e3580',
    DEFAULT: '#667eea',
  },

  // Glass-morphism backgrounds with opacity
  glass: {
    dark: 'rgba(17, 24, 39, 0.95)', // gray-900/95
    darker: 'rgba(31, 41, 55, 0.95)', // gray-800/95
    light: 'rgba(255, 255, 255, 0.1)', // white/10
    border: 'rgba(156, 163, 175, 0.3)', // gray-400/30
    borderDark: 'rgba(75, 85, 99, 0.5)', // gray-600/50
    borderDarker: 'rgba(55, 65, 81, 0.5)', // gray-700/50
    borderLight: 'rgba(255, 255, 255, 0.2)', // white/20
  },

  // Accent colors for interactive states
  accent: {
    blue: '#3b82f6', // blue-500
    purple: '#a855f7', // purple-500
    green: '#10b981', // green-500
    red: '#ef4444', // red-500
    yellow: '#f59e0b', // yellow-500
    pink: '#ec4899', // pink-500
  },
} as const

// ===========================
// SPACING SYSTEM
// ===========================

/**
 * Spacing constants for Windows-like density and layout
 */
export const spacing = {
  // Window chrome sizing
  windowChrome: {
    header: 40, // px - Window title bar height
    padding: 12, // px - Window content padding
    borderRadius: 8, // px - Window corner radius
  },

  // Taskbar sizing
  taskbar: {
    height: 48, // px - Taskbar height
    iconSize: 40, // px - App icon size in taskbar
    padding: 8, // px - Taskbar padding
  },

  // Desktop icons
  desktop: {
    iconSize: 80, // px - Desktop icon width
    iconHeight: 90, // px - Desktop icon container height
    iconGap: 16, // px - Gap between icons
    gridSize: 90, // px - Grid cell size for icon positioning
  },

  // Modal and panel sizing
  modal: {
    padding: 24, // px - Modal content padding
    headerHeight: 60, // px - Modal header height
    gap: 16, // px - Gap between elements
  },

  // General spacing scale (matches Tailwind defaults)
  scale: {
    xs: 4, // 0.25rem
    sm: 8, // 0.5rem
    md: 16, // 1rem
    lg: 24, // 1.5rem
    xl: 32, // 2rem
    '2xl': 48, // 3rem
    '3xl': 64, // 4rem
  },
} as const

// ===========================
// SHADOW SYSTEM
// ===========================

/**
 * Shadow presets for Aceternity premium effects
 */
export const shadows = {
  // Glass-morphism shadow
  glass: '0 8px 32px rgba(0, 0, 0, 0.37)',

  // Window shadow (elevated)
  window: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

  // Elevated elements (dropdowns, tooltips)
  elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',

  // Premium glow effects
  glow: {
    blue: '0 0 20px rgba(59, 130, 246, 0.5)',
    purple: '0 0 20px rgba(168, 85, 247, 0.5)',
    green: '0 0 20px rgba(16, 185, 129, 0.5)',
    red: '0 0 20px rgba(239, 68, 68, 0.5)',
  },

  // Inner shadow for inputs
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const

// ===========================
// Z-INDEX SCALE
// ===========================

/**
 * Z-index layering system
 * Prevents z-index conflicts and ensures proper stacking
 */
export const zIndex = {
  // Desktop base layer
  desktop: 0,
  desktopIcons: 10,

  // Windows layer (dynamic, starts at 1000)
  window: 1000,
  windowActive: 1001, // Active window slightly above others

  // Overlays and drag operations
  dragOverlay: 9997,

  // Start menu system
  startMenuBackdrop: 9998,
  startMenu: 9999,

  // Taskbar (always on top of windows but below modals)
  taskbar: 10000,

  // Context menus
  contextMenu: 10002,

  // Modal system
  modalOverlay: 14999,
  modal: 15000,

  // Tooltips and notifications (highest)
  tooltip: 20000,
  notification: 20001,
} as const

// ===========================
// BACKDROP BLUR VALUES
// ===========================

/**
 * Standardized backdrop blur values for glass-morphism
 */
export const blur = {
  glass: '40px', // backdrop-blur-xl
  glassHeavy: '64px', // backdrop-blur-2xl
  glassMedium: '24px', // backdrop-blur-md
  glassLight: '12px', // backdrop-blur
  none: '0',
} as const

// ===========================
// BORDER RADIUS SYSTEM
// ===========================

/**
 * Border radius values (Windows 11 inspired)
 */
export const borderRadius = {
  none: '0',
  sm: '4px', // rounded-sm
  md: '6px', // rounded-md
  lg: '8px', // rounded-lg
  xl: '12px', // rounded-xl
  '2xl': '16px', // rounded-2xl
  '3xl': '24px', // rounded-3xl
  full: '9999px', // rounded-full

  // Component-specific
  window: '8px',
  card: '12px',
  modal: '16px',
  button: '6px',
  icon: '8px',
  input: '6px',
} as const

// ===========================
// ANIMATION SYSTEM
// ===========================

/**
 * Animation durations and easing functions
 * Optimized for Framer Motion and Aceternity effects
 */
export const animations = {
  // Duration in milliseconds
  duration: {
    instant: 0,
    fast: 100, // 0.1s - Quick transitions
    normal: 150, // 0.15s - Default transitions
    slow: 300, // 0.3s - Emphasized transitions
    slower: 500, // 0.5s - Very emphasized
  },

  // Easing curves (for CSS transitions)
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)', // Default
  },

  // Framer Motion easing arrays
  motion: {
    smooth: [0.4, 0, 0.2, 1], // ease-out
    bounce: [0.68, -0.55, 0.265, 1.55],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },
} as const

// ===========================
// TYPOGRAPHY SCALE
// ===========================

/**
 * Typography system for consistent text sizing
 */
export const typography = {
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
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
} as const

// ===========================
// BREAKPOINTS
// ===========================

/**
 * Responsive breakpoints (Tailwind defaults)
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ===========================
// EXPORT ALL TOKENS
// ===========================

/**
 * Complete design token system
 * Import individual tokens or the entire system
 *
 * @example
 * import { colors, spacing, zIndex } from '@/lib/design-tokens'
 * import * as tokens from '@/lib/design-tokens'
 */
export const designTokens = {
  colors,
  spacing,
  shadows,
  zIndex,
  blur,
  borderRadius,
  animations,
  typography,
  breakpoints,
} as const

// Type exports for TypeScript autocomplete
export type Colors = typeof colors
export type Spacing = typeof spacing
export type Shadows = typeof shadows
export type ZIndex = typeof zIndex
export type Blur = typeof blur
export type BorderRadius = typeof borderRadius
export type Animations = typeof animations
export type Typography = typeof typography
export type Breakpoints = typeof breakpoints
