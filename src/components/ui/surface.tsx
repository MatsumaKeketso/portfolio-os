import * as React from 'react'
import { cn } from '../../lib/utils'

/**
 * MediaSurface — image / video preview with optional halftone dot hover.
 *
 * This is the only surface primitive currently in active use. The earlier
 * `Surface` / `ChromeSurface` / `ContentSurface` / `FloatingSurface` /
 * `InsetSurface` exports (and their Aceternity background coupling) were
 * removed in the 2026-05-30 ui/ reconciliation pass — no app imported them
 * and they contradicted the current Generative Studio / Product Mono
 * direction.
 *
 * For chrome/content/floating/inset roles, use the AppShell primitives
 * (`AppShell`, `AppToolbar`, `AppBody`, `AppSidebar`, `AppContent`,
 * `AppCard`, `AppModal`) or the semantic Tailwind utilities (`bg-os-ink-*`,
 * `bg-background-floating`, etc.). See `docs/DESIGN_SYSTEM.md`.
 *
 * MediaSurface wraps content in a `group` div. On hover a fine dot screen
 * fades in, and optionally an accent dot layer rises from the bottom.
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

export { MediaSurface }
