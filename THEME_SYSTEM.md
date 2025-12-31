# PortfolioOS Theme System

## Overview

PortfolioOS now has a centralized design system similar to Material-UI (MUI) and Ant Design (ANTD). All styling decisions are made in one place, ensuring consistency across the entire application.

## Architecture

```
src/
├── theme/
│   ├── theme.ts          # Central theme configuration
│   ├── ThemeProvider.tsx # React context provider
│   ├── helpers.ts        # Theme utility functions
│   └── index.ts          # Public API exports
```

## Quick Start

### 1. Using the Theme in Components

```tsx
import { useTheme } from '../theme';

function MyComponent() {
  const { theme } = useTheme();

  return (
    <div style={{
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.window,
    }}>
      Content
    </div>
  );
}
```

### 2. Using Theme Helpers

```tsx
import { getColor, getSpacing, getShadow } from '../theme/helpers';

function MyComponent() {
  return (
    <div style={{
      backgroundColor: getColor('primary.main'),
      padding: getSpacing('md'),
      boxShadow: getShadow('window'),
    }}>
      Content
    </div>
  );
}
```

### 3. Using Component Defaults

```tsx
import { theme } from '../theme';

// Get default props for Button
const buttonDefaults = theme.components.Button.defaultProps;
// { variant: 'primary', size: 'md' }

// Get Button variant styles
const primaryButton = theme.components.Button.variants.primary;
// { base: 'bg-gradient-to-r...', hover: 'from-blue-700...', ... }
```

## Theme Structure

### Colors

```tsx
theme.palette.primary.main     // '#667eea' - Brand blue
theme.palette.secondary.main   // '#764ba2' - Brand purple
theme.palette.success.main     // '#10b981' - Green
theme.palette.error.main       // '#ef4444' - Red
theme.palette.glass.dark       // 'rgba(17, 24, 39, 0.95)' - Glass dark
```

### Typography

```tsx
theme.typography.fontFamily.sans // System font stack
theme.typography.fontSize.base   // '1rem' (16px)
theme.typography.fontWeight.bold // 700
```

### Spacing

```tsx
theme.spacing.xs   // '0.5rem' (8px)
theme.spacing.md   // '1rem' (16px)
theme.spacing.xl   // '2rem' (32px)

// Component-specific
theme.spacing.component.windowChrome  // '2.5rem' (40px)
theme.spacing.component.taskbar       // '3rem' (48px)
```

### Shadows

```tsx
theme.shadows.md            // Standard elevation
theme.shadows.window        // Window shadow
theme.shadows.glass         // Glass-morphism shadow
theme.shadows.glow.blue     // Blue glow effect
```

### Border Radius

```tsx
theme.borderRadius.sm   // '0.25rem' (4px)
theme.borderRadius.md   // '0.5rem' (8px)
theme.borderRadius.lg   // '0.75rem' (12px)
```

### Z-Index

```tsx
theme.zIndex.window         // 1000
theme.zIndex.taskbar        // 10000
theme.zIndex.modal          // 15000
theme.zIndex.tooltip        // 20000
```

### Transitions

```tsx
theme.transitions.duration.fast      // '100ms'
theme.transitions.duration.normal    // '150ms'
theme.transitions.easing.easeInOut   // 'cubic-bezier(...)'
```

### Backdrop Blur

```tsx
theme.blur.glass        // '40px'
theme.blur.glassHeavy   // '64px'
```

## Component Defaults

Each component has centralized default values and variants:

### Button

```tsx
theme.components.Button = {
  defaultProps: {
    variant: 'primary',
    size: 'md',
  },

  variants: {
    primary: {
      base: 'bg-gradient-to-r from-blue-600 to-purple-600...',
      hover: 'from-blue-700 to-purple-700',
      shadow: 'shadow-md hover:shadow-glow-blue',
    },
    // ... other variants
  },

  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  },
}
```

### Input

```tsx
theme.components.Input = {
  defaultProps: {
    variant: 'glass',
    size: 'md',
  },

  variants: {
    glass: {
      base: 'bg-gray-700/50 border border-gray-600/50...',
      focus: 'border-blue-500 ring-1 ring-blue-500',
    },
    // ... other variants
  },
}
```

### Card

```tsx
theme.components.Card = {
  defaultProps: {
    variant: 'window',
    padding: 'md',
    rounded: 'lg',
  },

  variants: {
    window: {
      base: 'bg-gray-900/95 backdrop-blur-xl...',
      shadow: 'shadow-window',
    },
    // ... other variants
  },
}
```

### Window

```tsx
theme.components.Window = {
  chrome: {
    height: '2.5rem',
    background: 'bg-gray-800/80',
  },

  glow: {
    enabled: true,
    color: 'rgba(102, 126, 234, 0.8)',
    size: 250,
  },
}
```

## Customizing the Theme

### Option 1: Modify theme.ts Directly

```tsx
// src/theme/theme.ts
export const theme = {
  palette: {
    primary: {
      main: '#YOUR_COLOR', // Change brand color
    },
  },
  // ... rest of theme
};
```

### Option 2: Provide Custom Theme to Provider

```tsx
// src/App.tsx
import { ThemeProvider } from './theme';

const customTheme = {
  palette: {
    primary: {
      main: '#YOUR_COLOR',
    },
  },
};

function App() {
  return (
    <ThemeProvider customTheme={customTheme}>
      <Desktop />
    </ThemeProvider>
  );
}
```

## Helper Functions

### getColor(path)
Get a color from the theme palette:
```tsx
getColor('primary.main')     // '#667eea'
getColor('glass.dark')       // 'rgba(17, 24, 39, 0.95)'
```

### getSpacing(size)
Get a spacing value:
```tsx
getSpacing('md')   // '1rem'
getSpacing('xl')   // '2rem'
```

### getShadow(name)
Get a shadow value:
```tsx
getShadow('window')      // Window shadow
getShadow('glow.blue')   // Blue glow
```

### getBorderRadius(size)
Get border radius:
```tsx
getBorderRadius('lg')   // '0.75rem'
```

### getZIndex(layer)
Get z-index value:
```tsx
getZIndex('modal')    // 15000
getZIndex('taskbar')  // 10000
```

### getComponentDefaults(component)
Get component default props:
```tsx
getComponentDefaults('Button')
// { variant: 'primary', size: 'md' }
```

## Best Practices

### ✅ DO

1. **Use theme values instead of hardcoding**
   ```tsx
   // Good
   <div style={{ color: theme.palette.primary.main }}>

   // Bad
   <div style={{ color: '#667eea' }}>
   ```

2. **Use helper functions for cleaner code**
   ```tsx
   // Good
   const color = getColor('primary.main');

   // Also good
   const { theme } = useTheme();
   const color = theme.palette.primary.main;
   ```

3. **Reference component defaults**
   ```tsx
   // Good
   const defaults = theme.components.Button.defaultProps;
   ```

### ❌ DON'T

1. **Don't hardcode colors, spacing, or other design values**
   ```tsx
   // Bad
   <div className="bg-blue-600 p-4 rounded-lg">
   ```

2. **Don't duplicate style definitions**
   ```tsx
   // Bad - define in theme instead
   const buttonStyle = { padding: '8px 16px' };
   ```

3. **Don't use magic numbers**
   ```tsx
   // Bad
   <div style={{ zIndex: 10000 }}>

   // Good
   <div style={{ zIndex: theme.zIndex.taskbar }}>
   ```

## Migration Guide

### Converting Existing Components

**Before:**
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click me
</button>
```

**After:**
```tsx
import { useTheme } from '../theme';

function MyComponent() {
  const { theme } = useTheme();
  const styles = theme.components.Button.variants.primary;

  return (
    <button className={`${styles.base} ${styles.hover}`}>
      Click me
    </button>
  );
}
```

Or better yet, use the existing Button component:
```tsx
import { Button } from '../components/ui/button';

function MyComponent() {
  return <Button variant="primary">Click me</Button>;
}
```

## Current Component Status

### ✅ Using Centralized Theme
- Button (8 variants)
- Input (4 variants)
- Card (5 variants)

### 🔄 Partially Migrated
- Window (structure defined, needs implementation)
- Taskbar (values defined, needs implementation)
- DesktopIcon (values defined, needs implementation)

### ⏳ Needs Migration
- AdminPanel
- StartMenu
- FileExplorer
- Calculator
- Notepad
- Weather
- Browser
- About

## Benefits

1. **Consistency** - All components use the same design values
2. **Maintainability** - Change colors/spacing in one place
3. **Type Safety** - TypeScript enforces theme structure
4. **Scalability** - Easy to add new components/variants
5. **Customization** - Users can theme the entire app
6. **Developer Experience** - Similar to MUI/ANTD, familiar API

## Next Steps

1. Migrate remaining components to use theme
2. Add dark/light mode toggle
3. Add theme presets (Professional, Creative, Minimal)
4. Export theme configuration tool in AdminPanel
5. Add CSS custom properties for runtime theme changes
