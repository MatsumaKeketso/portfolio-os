/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Aceternity UI Premium Colors
      colors: {
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
        glass: {
          dark: 'rgba(17, 24, 39, 0.95)',
          darker: 'rgba(31, 41, 55, 0.95)',
          light: 'rgba(255, 255, 255, 0.1)',
        },
      },

      // Premium shadows for Aceternity effects
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
        window: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
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
