import { createContext, useContext, ReactNode } from 'react';
import { theme, type Theme } from './theme';

/**
 * Theme Context
 * Similar to Material-UI's ThemeProvider
 * Provides centralized theme access to all components
 */

interface ThemeContextValue {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  customTheme?: Partial<Theme>;
}

/**
 * ThemeProvider Component
 * Wraps the application to provide theme access
 *
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children, customTheme }: ThemeProviderProps) {
  const mergedTheme = customTheme
    ? ({ ...theme, ...customTheme } as Theme)
    : theme;

  return (
    <ThemeContext.Provider value={{ theme: mergedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 * Access the theme from any component
 *
 * @example
 * const { theme } = useTheme();
 * const primaryColor = theme.palette.primary.main;
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Utility function to get theme values outside React components
 * Useful for styled-components, CSS-in-JS, etc.
 */
export function getTheme(): Theme {
  return theme;
}
