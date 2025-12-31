/**
 * Centralized Theme Configuration
 * Similar to Material-UI's theme system
 *
 * All design decisions are made here:
 * - Colors, typography, spacing, shadows, animations
 * - Component default props and variants
 * - Consistent styling across the entire application
 */

export const theme = {
  // ==================== COLOR PALETTE ====================
  palette: {
    primary: {
      50: '#f0f4ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#667eea', // Main brand color
      600: '#5568d3',
      700: '#4c51bf',
      800: '#434190',
      900: '#3c366b',
      main: '#667eea',
      light: '#818cf8',
      dark: '#4c51bf',
    },

    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#764ba2', // Secondary brand color
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      main: '#764ba2',
      light: '#c084fc',
      dark: '#7e22ce',
    },

    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },

    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },

    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },

    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },

    // Glass-morphism colors
    glass: {
      dark: 'rgba(17, 24, 39, 0.95)',      // gray-900/95
      darker: 'rgba(31, 41, 55, 0.95)',     // gray-800/95
      light: 'rgba(255, 255, 255, 0.1)',
      border: {
        dark: 'rgba(55, 65, 81, 0.5)',      // gray-700/50
        light: 'rgba(255, 255, 255, 0.2)',
      },
    },

    // Background colors
    background: {
      default: '#1e3a8a',
      paper: '#ffffff',
      dark: '#111827',
    },

    // Text colors
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
      dark: '#111827',
    },
  },

  // ==================== TYPOGRAPHY ====================
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },

    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // ==================== SPACING ====================
  spacing: {
    // Base spacing unit (4px)
    unit: 4,

    // Common spacing values
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px

    // Component-specific spacing
    component: {
      windowChrome: '2.5rem',    // 40px - Window header height
      taskbar: '3rem',           // 48px - Taskbar height
      desktopIcon: '5.625rem',   // 90px - Desktop icon grid
      cardPadding: '1rem',       // 16px
      buttonPadding: '0.5rem 1rem', // 8px 16px
    },
  },

  // ==================== SHADOWS ====================
  shadows: {
    // Standard elevation shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Glass-morphism shadows
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',

    // Component-specific shadows
    window: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',

    // Glow effects
    glow: {
      blue: '0 0 20px rgba(102, 126, 234, 0.5)',
      purple: '0 0 20px rgba(168, 85, 247, 0.5)',
      green: '0 0 20px rgba(16, 185, 129, 0.5)',
      red: '0 0 20px rgba(239, 68, 68, 0.5)',
    },
  },

  // ==================== BORDER RADIUS ====================
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // ==================== Z-INDEX SCALE ====================
  zIndex: {
    desktop: 0,
    desktopIcons: 10,
    window: 1000,
    dragOverlay: 9997,
    startMenuBackdrop: 9998,
    startMenu: 9999,
    taskbar: 10000,
    contextMenu: 10002,
    modalOverlay: 14999,
    modal: 15000,
    tooltip: 20000,
  },

  // ==================== TRANSITIONS ====================
  transitions: {
    duration: {
      fast: '100ms',
      normal: '150ms',
      slow: '300ms',
      slower: '500ms',
    },

    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },

  // ==================== BACKDROP BLUR ====================
  blur: {
    sm: '4px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    glass: '40px',
    glassHeavy: '64px',
  },

  // ==================== COMPONENT DEFAULTS ====================
  components: {
    Button: {
      defaultProps: {
        variant: 'primary' as const,
        size: 'md' as const,
      },

      variants: {
        ghost: {
          base: 'hover:bg-white/10 text-white',
          hover: 'bg-white/10',
        },
        ghostDanger: {
          base: 'hover:bg-red-500 text-white',
          hover: 'bg-red-500',
        },
        taskbar: {
          base: 'hover:bg-white/10 text-white',
          active: 'bg-white/20 border-b-2 border-blue-500',
        },
        primary: {
          base: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
          hover: 'from-blue-700 to-purple-700',
          shadow: 'shadow-md hover:shadow-glow-blue',
        },
        secondary: {
          base: 'bg-gray-700 text-white border border-gray-600',
          hover: 'bg-gray-600 border-gray-500',
        },
        danger: {
          base: 'bg-red-600 text-white',
          hover: 'bg-red-700',
          shadow: 'shadow-md hover:shadow-glow-red',
        },
        success: {
          base: 'bg-green-600 text-white',
          hover: 'bg-green-700',
          shadow: 'shadow-md hover:shadow-glow-green',
        },
        menuItem: {
          base: 'w-full justify-start text-gray-700 dark:text-gray-200',
          hover: 'bg-blue-50 dark:bg-blue-600',
        },
      },

      sizes: {
        icon: 'w-8 h-8',
        iconLg: 'w-10 h-10',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        calculator: 'h-14 text-lg px-4',
      },
    },

    Input: {
      defaultProps: {
        variant: 'glass' as const,
        size: 'md' as const,
      },

      variants: {
        glass: {
          base: 'bg-gray-700/50 border border-gray-600/50 text-white backdrop-blur-sm',
          focus: 'border-blue-500 ring-1 ring-blue-500',
        },
        solid: {
          base: 'bg-gray-700 border border-gray-600 text-white',
          focus: 'border-blue-500 ring-1 ring-blue-500',
        },
        light: {
          base: 'bg-white border border-gray-200 text-gray-900',
          focus: 'border-blue-500 ring-1 ring-blue-500',
        },
        search: {
          base: 'bg-gray-700/50 border border-gray-600/50 text-white pl-10 backdrop-blur-sm',
          focus: 'border-blue-500 ring-1 ring-blue-500',
        },
      },

      sizes: {
        sm: 'h-8 px-3 py-1.5 text-xs',
        md: 'h-10 px-4 py-2.5 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },

    Card: {
      defaultProps: {
        variant: 'window' as const,
        padding: 'md' as const,
        rounded: 'lg' as const,
      },

      variants: {
        window: {
          base: 'bg-gray-900/95 backdrop-blur-xl border border-gray-700/50',
          shadow: 'shadow-window',
        },
        modal: {
          base: 'bg-gray-800/95 backdrop-blur-2xl border border-gray-700/50',
          shadow: 'shadow-2xl',
        },
        icon: {
          base: 'bg-gray-900/95 backdrop-blur-lg border border-white/20',
          shadow: 'shadow-glass',
        },
        menu: {
          base: 'bg-white dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 backdrop-blur-md',
          shadow: 'shadow-xl',
        },
        elevated: {
          base: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
          shadow: 'shadow-elevated',
        },
      },

      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },

      rounded: {
        none: 'rounded-none',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
      },
    },

    Window: {
      chrome: {
        height: '2.5rem', // 40px
        background: 'bg-gray-800/80',
        border: 'border-b border-gray-700/50',
      },

      body: {
        background: 'bg-white',
      },

      border: {
        color: 'border-gray-700/50',
        width: '1px',
      },

      shadow: 'shadow-2xl',
      borderRadius: 'rounded-lg',
      backdrop: 'backdrop-blur-xl',

      glow: {
        enabled: true,
        color: 'rgba(102, 126, 234, 0.8)',
        size: 250,
      },
    },

    Taskbar: {
      height: '3rem', // 48px
      background: 'bg-gray-900/95',
      backdrop: 'backdrop-blur-xl',
      border: 'border-t border-gray-700/50',
      zIndex: 10000,
    },

    DesktopIcon: {
      size: '5.625rem', // 90px
      gap: '1rem',
      background: 'bg-gray-900/95',
      backdrop: 'backdrop-blur-lg',
      border: 'border border-white/20',
      borderRadius: 'rounded-lg',
      shadow: 'shadow-glass',
      padding: 'p-2',

      hover: {
        scale: 'scale-105',
        shadow: 'shadow-lg',
      },

      active: {
        background: 'bg-blue-600/20',
        border: 'border-blue-500',
      },
    },
  },
} as const;

// Type for the theme
export type Theme = typeof theme;

// Export individual parts for convenience
export const { palette, typography, spacing, shadows, borderRadius, zIndex, transitions, blur, components } = theme;
