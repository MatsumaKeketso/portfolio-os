import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { BackgroundBeams } from '../aceternity/backgrounds/background-beams'
import { AuroraBackground } from '../aceternity/backgrounds/aurora-background'
import { useDesktopStore } from '../../store/desktopStore'

/**
 * Surface system — unified OS surface primitives.
 *
 * Two layers:
 *  1. Low-level `Surface` component (CVA-based, all variants).
 *  2. High-level semantic compounds: ChromeSurface, ContentSurface,
 *     FloatingSurface, InsetSurface, MediaSurface — use these in app code.
 *
 * Semantic surface map:
 *  chrome    — taskbar, start menu, title bars, admin nav (#111111 bg)
 *  content   — app body, settings pane, CV, File Explorer (#ffffff bg)
 *  floating  — dropdowns, notifications, date pickers (#1f1f21 bg)
 *  inset     — input wells, selected rows, nested controls
 *  media     — image previews with halftone hover treatment
 */

// ---------------------------------------------------------------------------
// CVA definition
// ---------------------------------------------------------------------------

const surfaceVariants = cva(
  'relative transition-all duration-200',
  {
    variants: {
      variant: {
        // ── OS Semantic Primitives ──────────────────────────────────────────

        // Dark OS shell: taskbar, start menu, title bars, admin nav
        chrome:
          'bg-os-ink-950 border border-os-line-dark text-os-text-inverse',

        // Dark OS shell (slightly lighter layer): menus, raised panels
        'chrome-raised':
          'bg-os-ink-900 border border-os-line-dark text-os-text-inverse',

        // Light app body: CV, File Explorer, About, Settings content
        content:
          'bg-os-canvas border border-os-line-light text-os-text-strong',

        // Light app body — warm tint: desktop bg, secondary panels
        'content-warm':
          'bg-os-canvas-warm border border-os-line-light text-os-text-strong',

        // Elevated dark panel: dropdowns, date pickers, notification panels
        floating:
          'bg-black/70 backdrop-blur-md border border-white/[0.10] text-os-text-inverse shadow-os-floating',

        // Inset control area on dark chrome: inputs, inner rows
        inset:
          'bg-white/[0.08] border border-white/[0.08] text-os-text-inverse/80',

        // Inset control area on light content: inputs, inner rows
        'inset-light':
          'bg-white border border-[#deded8] text-os-text-strong',

        // Image/media surface — use MediaSurface compound for halftone
        media:
          'relative overflow-hidden',

        // ── App-facing variants (glass-compatible) ──────────────────────────

        // Window title bar / OS chrome panels (intentionally opaque)
        window:
          'bg-os-ink-950 shadow-os-window border border-white/[0.08] overflow-hidden',

        // In-app floating dialog — heavy blur keeps it readable over glass
        dialog:
          'bg-black/80 backdrop-blur-md border border-white/[0.08] overflow-hidden',

        // Raised card / section container within an app
        panel:
          'bg-black/30 border border-white/[0.08] hover:border-white/[0.14] hover:bg-black/40',

        // Hoverable card — same as panel but lifts on hover
        card:
          'bg-black/30 border border-white/[0.08] hover:bg-black/40 hover:border-white/[0.14] hover:translate-y-[-1px]',

        // Horizontal toolbar / action bar at top of an app
        toolbar:
          'bg-white/[0.06] border-b border-white/[0.08]',

        // Vertical left-nav panel
        sidebar:
          'bg-black/50 border-r border-white/[0.08]',

        // Dropdown / context overlay
        popover:
          'bg-black/70 backdrop-blur-md border border-white/[0.10]',

        // Text input / select / textarea well
        input:
          'bg-white/[0.08] border border-white/[0.08] focus-within:border-white/[0.20]',

        // Root app container — transparent, window body provides the blur
        app:
          'bg-transparent',

        // Subtle inline container (no prominent border)
        inline:
          'bg-white/[0.04] border border-white/[0.06]',

        // Glass card — same as panel, preferred alias for app surfaces
        glass:
          'bg-black/30 border border-white/[0.08]',
      },

      elevation: {
        none: 'shadow-none',
        low: 'shadow-md',
        medium: 'shadow-hud-base',
        high: 'shadow-hud-elevated',
        highest: 'shadow-[0_25px_50px_rgba(0,0,0,0.9),0_0_2px_rgba(6,182,212,0.5)]',
      },

      blur: {
        none: '',
        sm: '',
        md: '',
        lg: '',
        xl: '',
        '2xl': '',
        '3xl': '',
      },

      border: {
        default: 'border-b border-white/[0.08]',
        none: '',
        all: 'border border-white/[0.08]',
        glow: 'border-b border-primary-500/50',
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
      variant: 'panel',
      elevation: 'medium',
      blur: 'none',
      border: 'none',
      padding: 'none',
    },
  }
)

// ---------------------------------------------------------------------------
// Base Surface component
// ---------------------------------------------------------------------------

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof surfaceVariants> {
  animate?: boolean
  glowColor?: 'primary' | 'tertiary' | 'none'
  showBeams?: boolean
  showAurora?: boolean
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, elevation, blur, border, padding, animate = false, glowColor = 'none', showBeams = false, showAurora = false, children, ...props }, ref) => {
    const glowClasses = {
      primary: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]',
      tertiary: 'shadow-[0_0_40px_rgba(249,115,22,0.15)]',
      none: '',
    }

    return (
      <div
        ref={ref}
        className={cn(
          surfaceVariants({ variant, elevation, blur, border, padding }),
          glowClasses[glowColor],
          animate && 'animate-in fade-in slide-in-from-bottom-4 duration-300',
          'overflow-hidden isolate',
          className
        )}
        {...props}
      >
        {showBeams && (
          <BackgroundBeams
            className="opacity-[0.12] z-[-1]"
            color="rgba(var(--color-primary), 0.5)"
          />
        )}
        {showAurora && (
          <AuroraBackground
            className="absolute inset-0 opacity-[0.08] pointer-events-none z-[-1]"
            colors={['#00d9ff', '#0066ff', '#00d9ff']}
            showRadialGradient={false}
          />
        )}
        {children}
      </div>
    )
  }
)
Surface.displayName = 'Surface'

// ---------------------------------------------------------------------------
// Semantic compound surfaces
// ---------------------------------------------------------------------------

/** Dark OS shell: taskbar, start menu, title bars, admin navigation. */
export interface ChromeSurfaceProps extends Omit<SurfaceProps, 'variant' | 'blur' | 'border' | 'elevation'> {
  raised?: boolean
}
const ChromeSurface = React.forwardRef<HTMLDivElement, ChromeSurfaceProps>(
  ({ raised, className, ...props }, ref) => (
    <Surface
      ref={ref}
      variant={raised ? 'chrome-raised' : 'chrome'}
      elevation="none"
      blur="none"
      border="none"
      className={className}
      {...props}
    />
  )
)
ChromeSurface.displayName = 'ChromeSurface'

/** Light app body: CV, File Explorer, Settings, About, project details. */
export interface ContentSurfaceProps extends Omit<SurfaceProps, 'variant' | 'blur' | 'border' | 'elevation'> {
  warm?: boolean
}
const ContentSurface = React.forwardRef<HTMLDivElement, ContentSurfaceProps>(
  ({ warm, className, ...props }, ref) => (
    <Surface
      ref={ref}
      variant={warm ? 'content-warm' : 'content'}
      elevation="none"
      blur="none"
      border="none"
      showBeams={true}
      showAurora={true}
      className={className}
      {...props}
    />
  )
)
ContentSurface.displayName = 'ContentSurface'

/** Elevated dark panel: dropdowns, date pickers, notification panels. */
const FloatingSurface = React.forwardRef<HTMLDivElement, Omit<SurfaceProps, 'variant' | 'border' | 'elevation'>>(
  ({ className, blur = 'sm', ...props }, ref) => (
    <Surface
      ref={ref}
      variant="floating"
      elevation="none"
      blur={blur}
      border="none"
      className={className}
      {...props}
    />
  )
)
FloatingSurface.displayName = 'FloatingSurface'

/** Inset control area: input wells, selected rows, nested controls. */
export interface InsetSurfaceProps extends Omit<SurfaceProps, 'variant' | 'blur' | 'border' | 'elevation'> {
  light?: boolean
}
const InsetSurface = React.forwardRef<HTMLDivElement, InsetSurfaceProps>(
  ({ light, className, ...props }, ref) => (
    <Surface
      ref={ref}
      variant={light ? 'inset-light' : 'inset'}
      elevation="none"
      blur="none"
      border="none"
      className={className}
      {...props}
    />
  )
)
InsetSurface.displayName = 'InsetSurface'

/**
 * Media surface: image previews with halftone dot hover treatment.
 *
 * Wraps content in a `group` div. On hover a fine dot screen fades in,
 * and optionally an accent dot layer rises from the bottom.
 *
 * Use on: project thumbnails, case study screenshots, Visitor Gallery,
 * About/concept imagery, CV project summaries.
 *
 * @example
 * <MediaSurface className="rounded-lg" accentLayer>
 *   <img src="..." alt="Project preview" className="w-full h-full object-cover" />
 * </MediaSurface>
 */
export interface MediaSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show the halftone dot overlay on hover (default: true) */
  halftone?: boolean
  /** Show an accent dot layer rising from the bottom on hover (default: false) */
  accentLayer?: boolean
}
const MediaSurface = React.forwardRef<HTMLDivElement, MediaSurfaceProps>(
  ({ className, halftone = true, accentLayer = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative overflow-hidden group', className)}
      {...props}
    >
      {children}

      {/* Halftone dot screen — fades in on hover */}
      {halftone && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-[0.8] transition-opacity duration-[180ms] ease-linear"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.72) 1px, transparent 1.4px)',
            backgroundSize: '5px 5px',
            mixBlendMode: 'multiply',
          }}
          aria-hidden="true"
        />
      )}

      {/* Accent dot layer — rises from bottom on hover */}
      {accentLayer && (
        <div
          className="absolute bottom-0 inset-x-0 h-14 pointer-events-none opacity-0 group-hover:opacity-[0.85] translate-y-[2px] group-hover:translate-y-0 transition-[opacity,transform] duration-[220ms] ease-out"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(var(--color-accent), 0.85) 1.5px, transparent 2px)',
            backgroundSize: '16px 12px',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
)
MediaSurface.displayName = 'MediaSurface'

// ---------------------------------------------------------------------------
// Sub-components (shared across all surface types)
// ---------------------------------------------------------------------------

/** Header band — sits above content, separated by a 1px divider. */
export interface SurfaceHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  context?: 'chrome' | 'content' | 'floating'
}
const SurfaceHeader = React.forwardRef<HTMLDivElement, SurfaceHeaderProps>(
  ({ className, context = 'chrome', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-4 py-3 flex items-center gap-2 flex-shrink-0',
        context === 'content'
          ? 'border-b border-os-line-light bg-os-canvas'
          : 'border-b border-os-line-dark bg-white/[0.03]',
        className
      )}
      {...props}
    />
  )
)
SurfaceHeader.displayName = 'SurfaceHeader'

/** Scrollable content body. */
const SurfaceContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-auto p-4', className)} {...props} />
  )
)
SurfaceContent.displayName = 'SurfaceContent'

/** Footer band — sits below content, separated by a 1px divider. */
export interface SurfaceFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  context?: 'chrome' | 'content' | 'floating'
}
const SurfaceFooter = React.forwardRef<HTMLDivElement, SurfaceFooterProps>(
  ({ className, context = 'chrome', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-4 py-3 flex items-center justify-end gap-2 flex-shrink-0',
        context === 'content'
          ? 'border-t border-os-line-light bg-os-canvas-raised'
          : 'border-t border-os-line-dark bg-white/[0.02]',
        className
      )}
      {...props}
    />
  )
)
SurfaceFooter.displayName = 'SurfaceFooter'

/** Thin horizontal rule between sections. */
export interface SurfaceDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  context?: 'chrome' | 'content' | 'floating'
  gradient?: boolean
}
const SurfaceDivider = React.forwardRef<HTMLDivElement, SurfaceDividerProps>(
  ({ className, context = 'chrome', gradient = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'h-px shrink-0',
        gradient
          ? context === 'content'
            ? 'bg-gradient-to-r from-transparent via-os-line-light to-transparent'
            : 'bg-gradient-to-r from-transparent via-white/[0.08] to-transparent'
          : context === 'content'
            ? 'bg-os-line-light'
            : 'bg-white/[0.07]',
        className
      )}
      {...props}
    />
  )
)
SurfaceDivider.displayName = 'SurfaceDivider'

/** Decorative ambient glow — legacy glassmorphism accent. */
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
  const intensities = { low: 'opacity-30', medium: 'opacity-50', high: 'opacity-70' }

  return (
    <div
      ref={ref}
      className={cn('absolute inset-0 pointer-events-none blur-3xl', colors[color], intensities[intensity], className)}
      {...props}
    />
  )
})
SurfaceGlow.displayName = 'SurfaceGlow'

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  // Base
  Surface,
  surfaceVariants,

  // Semantic compounds
  ChromeSurface,
  ContentSurface,
  FloatingSurface,
  InsetSurface,
  MediaSurface,

  // Sub-components
  SurfaceHeader,
  SurfaceContent,
  SurfaceFooter,
  SurfaceDivider,
  SurfaceGlow,
}
