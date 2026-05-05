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

        // OS Design Tokens — Product Mono base palette (static, not theme-variable)
        os: {
          ink: {
            950: 'rgb(var(--os-ink-950) / <alpha-value>)',  // Main chrome
            900: 'rgb(var(--os-ink-900) / <alpha-value>)',  // Menus, title bars
            800: 'rgb(var(--os-ink-800) / <alpha-value>)',  // Hover tiles, raised chrome
            700: 'rgb(var(--os-ink-700) / <alpha-value>)',  // Inputs on dark chrome
          },
          canvas: {
            DEFAULT: '#ffffff',  // Main app body
            warm: '#f7f7f5',     // Desktop background, app bg
            raised: '#fbfbfa',   // Cards and controls
          },
          line: {
            dark: 'rgba(255,255,255,0.08)',
            'dark-hover': 'rgba(255,255,255,0.14)',
            light: '#e8e8e5',
            'light-hover': '#d8d8d4',
          },
          text: {
            strong: '#171717',
            muted: '#666666',
            faint: '#9a9a9a',
            inverse: '#ffffff',
          },
        },

        // ─── Design System Token Layer ─────────────────────────────────────────
        // Primitive layer — ONLY place hex values are allowed in this config.
        // Components must use semantic tokens only (background/foreground/stroke).
        primitive: {
          gray: {
            50: '#fafafa',
            100: '#f5f5f3',
            200: '#ebebeb',
            300: '#d6d6d6',
            400: '#b8b8b8',
            600: '#737373',
            800: '#454545',
            1000: '#2c2c2c',
            1300: '#1a1a1a',
            1700: '#111111',
            2100: '#080808',
          },
          blue: {
            50: '#eff8ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            600: '#2563eb',
            800: '#1e40af',
            1000: '#1d4ed8',
            1300: '#1e3a8a',
            1700: '#172554',
            2100: '#0f172a',
          },
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            600: '#16a34a',
            800: '#166534',
            1000: '#15803d',
            1300: '#14532d',
            1700: '#052e16',
            2100: '#012617',
          },
          red: {
            50: '#fff1f2',
            100: '#ffe4e6',
            200: '#fecdd3',
            300: '#fda4af',
            400: '#fb7185',
            600: '#dc2626',
            800: '#991b1b',
            1000: '#b91c1c',
            1300: '#7f1d1d',
            1700: '#450a0a',
            2100: '#2a0505',
          },
          yellow: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            600: '#ca8a04',
            800: '#854d0e',
            1000: '#a16207',
            1300: '#713f12',
            1700: '#422006',
            2100: '#270d02',
          },
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            600: '#9333ea',
            800: '#6b21a8',
            1000: '#7e22ce',
            1300: '#581c87',
            1700: '#3b0764',
            2100: '#1e0630',
          },
        },

        // Semantic layer — references CSS variables; responds to light/dark mode.
        // Usage: bg-background-primary, text-foreground-secondary, border-stroke-brand

        // Surface backgrounds
        background: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
          overlay: 'var(--color-bg-overlay)',
          chrome: 'rgb(var(--color-bg-chrome) / <alpha-value>)',
          'chrome-raised': 'rgb(var(--color-bg-chrome-raised) / <alpha-value>)',
          floating: 'rgb(var(--color-bg-floating) / <alpha-value>)',
          brand: {
            solid: { DEFAULT: 'var(--color-bg-brand-solid)', hover: 'var(--color-bg-brand-solid-hover)' },
            subtle: { DEFAULT: 'var(--color-bg-brand-subtle)', hover: 'var(--color-bg-brand-subtle-hover)' },
          },
          accent: {
            DEFAULT: 'var(--color-bg-accent)',
            hover: 'var(--color-bg-accent-hover)',
          },
          feedback: {
            success: { DEFAULT: 'var(--color-bg-success)', subtle: 'var(--color-bg-success-subtle)' },
            warning: { DEFAULT: 'var(--color-bg-warning)', subtle: 'var(--color-bg-warning-subtle)' },
            error: { DEFAULT: 'var(--color-bg-error)', subtle: 'var(--color-bg-error-subtle)' },
            info: { DEFAULT: 'var(--color-bg-info)', subtle: 'var(--color-bg-info-subtle)' },
          },
          control: {
            DEFAULT: 'var(--color-bg-control)',
            hover: 'var(--color-bg-control-hover)',
            active: 'var(--color-bg-control-active)',
            disabled: 'var(--color-bg-control-disabled)',
          },
        },

        // Text / icon colors
        foreground: {
          primary: 'var(--color-fg-primary)',
          secondary: 'var(--color-fg-secondary)',
          tertiary: 'var(--color-fg-tertiary)',
          disabled: 'var(--color-fg-disabled)',
          accent: 'var(--color-bg-accent)',
          on: {
            primary: 'var(--color-fg-on-primary)',
            secondary: 'var(--color-fg-on-secondary)',
          },
          brand: { DEFAULT: 'var(--color-fg-brand)', hover: 'var(--color-fg-brand-hover)' },
          feedback: {
            success: 'var(--color-fg-success)',
            warning: 'var(--color-fg-warning)',
            error: 'var(--color-fg-error)',
            info: 'var(--color-fg-info)',
          },
        },

        // Border / divider colors — use `border-stroke-*` to avoid redundancy
        stroke: {
          primary: 'var(--color-stroke-primary)',
          secondary: 'var(--color-stroke-secondary)',
          tertiary: 'var(--color-stroke-tertiary)',
          focus: 'var(--color-stroke-focus)',
          brand: 'var(--color-stroke-brand)',
          accent: 'var(--color-bg-accent)',
          feedback: {
            success: 'var(--color-stroke-success)',
            warning: 'var(--color-stroke-warning)',
            error: 'var(--color-stroke-error)',
            info: 'var(--color-stroke-info)',
          },
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

        // OS semantic shadows
        'os-floating': '0 18px 50px rgba(0,0,0,0.28)',
        'os-window': '0 24px 60px rgba(0,0,0,0.24)',
        'os-card': '0 8px 24px rgba(0,0,0,0.06)',
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
