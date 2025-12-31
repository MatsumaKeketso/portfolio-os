/**
 * Theme System
 * Centralized design system exports
 *
 * Import everything you need for theming:
 * import { ThemeProvider, useTheme, theme } from '@/theme'
 */

export { ThemeProvider, useTheme, getTheme } from './ThemeProvider';
export { theme, palette, typography, spacing, shadows, borderRadius, zIndex, transitions, blur, components } from './theme';
export type { Theme } from './theme';
