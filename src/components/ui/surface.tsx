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
  // Base styles - Cyberpunk HUD panels with neon accents
  // Sharp corners, high transparency, mild blur for that minimal space aesthetic
  'relative backdrop-blur-md border-b border-primary-500/10 transition-all duration-200',
  {
    variants: {
      variant: {
        // Window chrome - Main app container (sharp HUD panel)
        window: 'bg-black/92 shadow-hud-elevated border-t border-primary-500/25 border-x border-b border-gray-800/50 overflow-hidden',

        // Dialog/Modal - Elevated layer with subtle glow
        dialog: 'bg-black/95 shadow-[0_25px_50px_rgba(0,0,0,0.8)] shadow-lg shadow-primary-500/20 border border-primary-500/30 overflow-hidden',

        // Panel - Side panels with layered depth (DEFAULT)
        panel: 'bg-gray-900/50 shadow-hud-base border border-primary-500/30 hover:border-primary-500/60 hover:bg-primary-500/10',

        // Card - Content cards (Timeline style with subtle glow on hover)
        card: 'bg-gray-900/50 shadow-hud-base border border-primary-500/30 hover:bg-primary-500/10 hover:border-primary-500/60 hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary-500/30',

        // Toolbar - Top bars (thin bottom accent)
        toolbar: 'bg-black/80 shadow-md border-b border-primary-500/25',

        // Sidebar - Nav sidebars (thin right divider)
        sidebar: 'bg-black/85 shadow-hud-base border-r border-primary-500/20',

        // Popover - Context menus (elevated with subtle glow)
        popover: 'bg-black/95 shadow-hud-elevated shadow-lg shadow-primary-500/20 border border-primary-500/30',

        // Input - Form surfaces (inset on focus)
        input: 'bg-gray-900/60 border border-gray-700/50 focus-within:border-primary-500/60 focus-within:shadow-[0_0_0_1px_rgba(6,182,212,0.3)_inset]',

        // App container - Main content area
        app: 'bg-gradient-to-br from-black/85 via-gray-900/80 to-black/85 shadow-inner',

        // Inline - Minimal flat surface
        inline: 'bg-black/40 border border-gray-800/40',

        // Glass - Max transparency HUD overlay
        glass: 'bg-black/30 shadow-lg border border-primary-500/15',
      },

      elevation: {
        // Shadow depth for layering (HUD-inspired)
        none: 'shadow-none',
        low: 'shadow-md',
        medium: 'shadow-hud-base',
        high: 'shadow-hud-elevated',
        highest: 'shadow-[0_25px_50px_rgba(0,0,0,0.9),0_0_2px_rgba(6,182,212,0.5)]',
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
        // Border style (Cyberpunk neon)
        default: 'border-b border-primary-500/10',
        none: 'border-none',
        all: 'border border-primary-500/15',
        glow: 'border-b border-primary-500/50 shadow-[0_1px_10px_rgba(6,182,212,0.3)]',
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
 * SurfaceDivider - HUD section divider (subtle, no glow)
 */
const SurfaceDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'solid' | 'gradient' }
>(({ className, variant = 'gradient', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'h-[1px] my-4',
      variant === 'gradient'
        ? 'bg-gradient-to-r from-transparent via-primary-500/25 to-transparent'
        : 'bg-primary-500/20',
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
