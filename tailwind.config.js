/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // PortfolioOS Design System Colors (Dynamic via CSS Variables)
      colors: {
        // Primary - Customizable via theme store
        primary: {
          50: 'rgba(var(--color-primary), 0.05)',    // Backgrounds only
          100: 'rgba(var(--color-primary), 0.15)',   // Backgrounds only
          200: 'rgba(var(--color-primary), 0.25)',   // Backgrounds only
          300: 'rgb(var(--color-primary))',          // Text safe - full opacity
          400: 'rgb(var(--color-primary))',          // Text safe - full opacity
          500: 'rgb(var(--color-primary))',          // Base primary - full opacity
          600: 'rgb(var(--color-primary-hover))',    // Primary hover (darker)
          700: 'rgb(var(--color-primary-hover))',
          800: 'rgb(var(--color-primary-hover))',
          900: 'rgb(var(--color-primary-hover))',
          950: 'rgb(var(--color-primary-hover))',
          DEFAULT: 'rgb(var(--color-primary))',
        },

        // Secondary - Customizable via theme store
        secondary: {
          50: 'rgba(var(--color-secondary), 0.05)',
          100: 'rgba(var(--color-secondary), 0.15)',
          200: 'rgba(var(--color-secondary), 0.25)',
          300: 'rgb(var(--color-secondary))',
          400: 'rgb(var(--color-secondary))',
          500: 'rgb(var(--color-secondary))',
          600: 'rgb(var(--color-secondary-hover))',
          700: 'rgb(var(--color-secondary-hover))',
          800: 'rgb(var(--color-secondary-hover))',
          900: 'rgb(var(--color-secondary-hover))',
          950: 'rgb(var(--color-secondary-hover))',
          DEFAULT: 'rgb(var(--color-secondary))',
        },

        // Tertiary - Customizable via theme store
        tertiary: {
          50: 'rgba(var(--color-tertiary), 0.05)',
          100: 'rgba(var(--color-tertiary), 0.15)',
          200: 'rgba(var(--color-tertiary), 0.25)',
          300: 'rgb(var(--color-tertiary))',
          400: 'rgb(var(--color-tertiary))',
          500: 'rgb(var(--color-tertiary))',
          600: 'rgb(var(--color-tertiary-hover))',
          700: 'rgb(var(--color-tertiary-hover))',
          800: 'rgb(var(--color-tertiary-hover))',
          900: 'rgb(var(--color-tertiary-hover))',
          950: 'rgb(var(--color-tertiary-hover))',
          DEFAULT: 'rgb(var(--color-tertiary))',
        },

        // Accent - Customizable via theme store
        accent: {
          50: 'rgba(var(--color-accent), 0.05)',
          100: 'rgba(var(--color-accent), 0.15)',
          200: 'rgba(var(--color-accent), 0.25)',
          300: 'rgb(var(--color-accent))',
          400: 'rgb(var(--color-accent))',
          500: 'rgb(var(--color-accent))',
          600: 'rgb(var(--color-accent-hover))',
          DEFAULT: 'rgb(var(--color-accent))',
        },

        // System - Dark surfaces (Framer-inspired)
        system: {
          bg: {
            primary: '#0a0a0a',
            secondary: '#111111',
            tertiary: '#1a1a1a',
          },
          surface: {
            base: '#171717',
            raised: '#1f1f1f',
            overlay: '#262626',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a1a1a1',
            tertiary: '#737373',
            disabled: '#525252',
          },
        },

        // Glass effects
        glass: {
          dark: 'rgba(17, 24, 39, 0.95)',
          darker: 'rgba(31, 41, 55, 0.95)',
          light: 'rgba(255, 255, 255, 0.1)',
        },

        // Cyberpunk HUD borders (subtle, not glowing)
        'hud-border': 'rgba(6, 182, 212, 0.6)',
        'hud-border-dim': 'rgba(6, 182, 212, 0.25)',
        'hud-border-accent': 'rgba(236, 72, 153, 0.6)',
      },

      // Premium shadows (Framer-style elevation)
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
        window: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',

        // Primary (Red) glow effects
        'glow-primary': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-primary-hover': '0 0 30px rgba(239, 68, 68, 0.5)',

        // Tertiary (Orange) glow effects
        'glow-tertiary': '0 0 20px rgba(249, 115, 22, 0.3)',
        'glow-tertiary-hover': '0 0 30px rgba(249, 115, 22, 0.5)',

        // Legacy color glows (for backwards compatibility)
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',

        // === CYBERPUNK HUD DEPTH SHADOWS (no glow, just depth) ===
        // Base depth for standard panels
        'hud-base': '0 4px 16px rgba(0, 0, 0, 0.6)',

        // Raised elements (hover state, slight lift)
        'hud-raised': '0 6px 20px rgba(0, 0, 0, 0.7)',

        // Elevated dialogs and modals
        'hud-elevated': '0 8px 32px rgba(0, 0, 0, 0.7)',

        // Pressed/active inset shadow
        'hud-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',

        // Subtle hairline edge definition (not glow)
        'hud-hairline': '0 0 0 1px rgba(6, 182, 212, 0.15)',
      },

      // Enhanced backdrop blur
      backdropBlur: {
        glass: '40px',
        'glass-heavy': '64px',
        'glass-medium': '24px',
      },

      // Aceternity-inspired animations
      animation: {
        aurora: 'aurora 60s ease infinite',
        spotlight: 'spotlight 2s ease .75s 1 forwards',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
      },

      // Keyframe definitions
      keyframes: {
        aurora: {
          '0%, 100%': {
            transform: 'translateY(0) rotate(0deg)',
            opacity: '0.3',
          },
          '50%': {
            transform: 'translateY(-20px) rotate(5deg)',
            opacity: '0.5',
          },
        },
        spotlight: {
          '0%': {
            opacity: '0',
            transform: 'translate(-72%, -62%) scale(0.5)',
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%, -40%) scale(1)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInUp: {
          '0%': {
            transform: 'translateY(10px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        slideInDown: {
          '0%': {
            transform: 'translateY(-10px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },

      // Z-index utilities (use with arbitrary values like z-[var(--z-modal)])
      zIndex: {
        desktop: '0',
        'desktop-icons': '10',
        window: '1000',
        'drag-overlay': '9997',
        'start-menu-backdrop': '9998',
        'start-menu': '9999',
        taskbar: '10000',
        'context-menu': '10002',
        'modal-overlay': '14999',
        modal: '15000',
        tooltip: '20000',
      },
    },
  },
  plugins: [],
};
