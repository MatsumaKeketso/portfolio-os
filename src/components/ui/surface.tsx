import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Surface component - Unified glassmorphism surface system
 *
 * Provides consistent futuristic minimal space UI styling across all surfaces:
 * - Blurred backgrounds (backdrop-blur)
 * - Semi-transparent backgrounds
 * - 1px bottom border on all surfaces
 * - Variants for different surface types
 *
 * @example Window surface
 * <Surface variant="window">
 *   <WindowContent />
 * </Surface>
 *
 * @example Dialog surface
 * <Surface variant="dialog" elevation="high">
 *   <DialogContent />
 * </Surface>
 *
 * @example Panel surface
 * <Surface variant="panel">
 *   <PanelContent />
 * </Surface>
 */

const surfaceVariants = cva(
  // Base styles - Applied to ALL surfaces for consistent futuristic minimal space UI
  // Sharp corners, high transparency, mild blur for that minimal space aesthetic
  'relative backdrop-blur-md border-b border-white/10 transition-all duration-300',
  {
    variants: {
      variant: {
        // Window chrome - Main application windows
        window: 'bg-gray-900/75 shadow-2xl rounded overflow-hidden',

        // Dialog/Modal - Elevated dialogs and modals
        dialog: 'bg-gray-800/75 shadow-2xl rounded overflow-hidden',

        // Panel - Side panels, admin panels, settings panels (DEFAULT)
        // High transparency, sharp corners, mild blur
        panel: 'bg-gray-900/70 shadow-xl rounded',

        // Card - Content cards within apps
        card: 'bg-white/5 shadow-lg rounded hover:bg-white/8',

        // Toolbar - Top bars, action bars
        toolbar: 'bg-gray-900/60 shadow-md',

        // Sidebar - Navigation sidebars
        sidebar: 'bg-gray-900/70 shadow-lg',

        // Popover - Small floating panels (context menus, tooltips)
        popover: 'bg-gray-800/80 shadow-xl rounded',

        // Input - Form input surfaces
        input: 'bg-gray-700/40 rounded border border-gray-600/50 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500',

        // App container - Main app content area
        app: 'bg-gradient-to-br from-gray-900/70 to-gray-800/70 shadow-inner',

        // Inline - Minimal inline surface (no shadow)
        inline: 'bg-white/5 rounded',

        // Glass - Maximum transparency for overlays
        glass: 'bg-white/5 shadow-lg rounded',
      },

      elevation: {
        // Shadow depth for layering
        none: 'shadow-none',
        low: 'shadow-md',
        medium: 'shadow-xl',
        high: 'shadow-2xl',
        highest: 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]',
      },

      blur: {
        // Blur intensity - mild by default for sharp minimal aesthetic
        none: 'backdrop-blur-none',
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
        '2xl': 'backdrop-blur-2xl',
        '3xl': 'backdrop-blur-3xl',
      },

      border: {
        // Border style
        default: 'border-b border-white/10',
        none: 'border-none',
        all: 'border border-white/10',
        glow: 'border-b border-primary-500/30 shadow-[0_1px_20px_rgba(239,68,68,0.15)]',
      },

      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'panel',      // Panel is now the default
      elevation: 'medium',
      blur: 'md',            // Mild blur by default
      border: 'default',
      padding: 'none',
    },
  }
)

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof surfaceVariants> {
  /**
   * Enable animated entrance
   */
  animate?: boolean

  /**
   * Glow effect color (for accents)
   */
  glowColor?: 'primary' | 'tertiary' | 'none'
}

/**
 * Surface component
 *
 * The foundational component for all surfaces in GenOS.
 * Provides consistent glassmorphism, blur, shadows, and borders.
 *
 * @param variant - Surface type (window, dialog, panel, card, etc.)
 * @param elevation - Shadow depth (none, low, medium, high, highest)
 * @param blur - Backdrop blur intensity
 * @param border - Border style
 * @param padding - Internal padding
 * @param animate - Enable entrance animation
 * @param glowColor - Accent glow color
 * @param className - Additional classes
 * @param children - Surface content
 */
const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({
    className,
    variant,
    elevation,
    blur,
    border,
    padding,
    animate = false,
    glowColor = 'none',
    children,
    ...props
  }, ref) => {
    const glowClasses = {
      primary: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]',
      tertiary: 'shadow-[0_0_40px_rgba(249,115,22,0.15)]',
      none: '',
    }

    return (
      <div
        ref={ref}
        className={cn(
          surfaceVariants({ variant, elevation, blur, border, padding, className }),
          glowClasses[glowColor],
          animate && 'animate-in fade-in slide-in-from-bottom-4 duration-300'
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Surface.displayName = 'Surface'

/**
 * SurfaceHeader - Header section for surfaces
 */
const SurfaceHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-6 py-4 border-b border-white/10 backdrop-blur-sm bg-white/5',
      className
    )}
    {...props}
  />
))
SurfaceHeader.displayName = 'SurfaceHeader'

/**
 * SurfaceContent - Content section for surfaces
 */
const SurfaceContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6', className)}
    {...props}
  />
))
SurfaceContent.displayName = 'SurfaceContent'

/**
 * SurfaceFooter - Footer section for surfaces
 */
const SurfaceFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-6 py-4 border-t border-white/10 backdrop-blur-sm bg-white/5 flex items-center justify-end gap-3',
      className
    )}
    {...props}
  />
))
SurfaceFooter.displayName = 'SurfaceFooter'

/**
 * SurfaceDivider - Divider line for surfaces
 */
const SurfaceDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'solid' | 'gradient' }
>(({ className, variant = 'gradient', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'h-px my-4',
      variant === 'gradient'
        ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
        : 'bg-white/10',
      className
    )}
    {...props}
  />
))
SurfaceDivider.displayName = 'SurfaceDivider'

/**
 * SurfaceGlow - Accent glow effect overlay
 */
const SurfaceGlow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    color?: 'primary' | 'tertiary' | 'mixed'
    intensity?: 'low' | 'medium' | 'high'
  }
>(({ className, color = 'mixed', intensity = 'medium', ...props }, ref) => {
  const colors = {
    primary: 'bg-gradient-to-br from-primary-500/30 to-primary-600/30',
    tertiary: 'bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/30',
    mixed: 'bg-gradient-to-br from-primary-500/20 via-tertiary-500/20 to-primary-500/20',
  }

  const intensities = {
    low: 'opacity-30',
    medium: 'opacity-50',
    high: 'opacity-70',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'absolute inset-0 pointer-events-none blur-3xl',
        colors[color],
        intensities[intensity],
        className
      )}
      {...props}
    />
  )
})
SurfaceGlow.displayName = 'SurfaceGlow'

export {
  Surface,
  SurfaceHeader,
  SurfaceContent,
  SurfaceFooter,
  SurfaceDivider,
  SurfaceGlow,
  surfaceVariants,
}
