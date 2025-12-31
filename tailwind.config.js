/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // PortfolioOS Design System Colors (Framer-inspired)
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
          DEFAULT: '#ef4444',
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
          DEFAULT: '#9ca3af',
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
          DEFAULT: '#f97316',
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
