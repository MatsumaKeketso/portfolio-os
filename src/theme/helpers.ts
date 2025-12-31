/**
 * Theme Helper Functions
 * Utilities for applying theme values to components
 */

import { theme } from './theme';

/**
 * Get color from theme palette
 * @example getColor('primary.main') => '#667eea'
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = theme.palette;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${path}" not found in theme`);
      return '#000000';
    }
  }

  return value as string;
}

/**
 * Get spacing value from theme
 * @example getSpacing('md') => '1rem'
 */
export function getSpacing(size: keyof typeof theme.spacing): string {
  return theme.spacing[size] || theme.spacing.md;
}

/**
 * Get shadow from theme
 * @example getShadow('window') => '0 20px 25px...'
 */
export function getShadow(name: keyof typeof theme.shadows | string): string {
  if (name.startsWith('glow.')) {
    const glowColor = name.split('.')[1] as keyof typeof theme.shadows.glow;
    return theme.shadows.glow[glowColor] || theme.shadows.md;
  }

  return (theme.shadows as any)[name] || theme.shadows.md;
}

/**
 * Get border radius from theme
 * @example getBorderRadius('lg') => '0.75rem'
 */
export function getBorderRadius(size: keyof typeof theme.borderRadius): string {
  return theme.borderRadius[size] || theme.borderRadius.md;
}

/**
 * Get z-index from theme
 * @example getZIndex('modal') => 15000
 */
export function getZIndex(layer: keyof typeof theme.zIndex): number {
  return theme.zIndex[layer] || 0;
}

/**
 * Get transition duration
 * @example getTransitionDuration('normal') => '150ms'
 */
export function getTransitionDuration(speed: keyof typeof theme.transitions.duration): string {
  return theme.transitions.duration[speed] || theme.transitions.duration.normal;
}

/**
 * Get component default props
 * @example getComponentDefaults('Button') => { variant: 'primary', size: 'md' }
 */
export function getComponentDefaults<T extends keyof typeof theme.components>(
  component: T
): typeof theme.components[T]['defaultProps'] {
  return theme.components[component].defaultProps;
}

/**
 * Build className from theme values
 * Useful for applying theme-based styles
 *
 * @example
 * themeClass({
 *   bg: 'glass.dark',
 *   text: 'text.primary',
 *   rounded: 'lg',
 *   shadow: 'window'
 * })
 */
export function themeClass(config: {
  bg?: string;
  text?: string;
  border?: string;
  rounded?: keyof typeof theme.borderRadius;
  shadow?: string;
  padding?: keyof typeof theme.spacing;
}): string {
  const classes: string[] = [];

  // These would need to be mapped to actual Tailwind classes
  // This is a simplified example

  if (config.rounded) {
    const radiusMap: Record<string, string> = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    };
    classes.push(radiusMap[config.rounded] || 'rounded-md');
  }

  return classes.join(' ');
}
