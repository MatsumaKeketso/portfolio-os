import * as React from 'react'
import { cn } from '../../lib/utils'

/**
 * AppShell — layout primitives for every app window.
 *
 * The window body already provides `bg-black/20 backdrop-blur-xl` (glass base).
 * These components add structure on top of it. Use them instead of raw divs
 * with hardcoded background tokens so the visual system stays consistent.
 *
 * Typical single-pane app:
 * ```tsx
 * <AppShell>
 *   <AppToolbar>…buttons, search…</AppToolbar>
 *   <AppContent>…body…</AppContent>
 * </AppShell>
 * ```
 *
 * Typical two-pane app (sidebar + content):
 * ```tsx
 * <AppShell>
 *   <AppToolbar>…breadcrumbs, actions…</AppToolbar>
 *   <AppBody>
 *     <AppSidebar>…nav…</AppSidebar>
 *     <AppContent>…files, settings pane…</AppContent>
 *   </AppBody>
 * </AppShell>
 * ```
 *
 * For in-app dialogs use `<AppModal>` — it provides the semi-opaque backdrop
 * and centered panel automatically.
 */

// ---------------------------------------------------------------------------
// AppShell — root container, fills the window body
// ---------------------------------------------------------------------------

export const AppShell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col h-full w-full overflow-hidden', className)} {...props} />
  )
)
AppShell.displayName = 'AppShell'

// ---------------------------------------------------------------------------
// AppToolbar — horizontal action bar pinned to the top
// bg: white/6 (slightly lighter than glass body) + bottom divider
// ---------------------------------------------------------------------------

export const AppToolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2 px-3 py-2 shrink-0',
        'bg-white/[0.06] border-b border-white/[0.08]',
        className
      )}
      {...props}
    />
  )
)
AppToolbar.displayName = 'AppToolbar'

// ---------------------------------------------------------------------------
// AppBody — flex row that contains sidebar + content side by side
// ---------------------------------------------------------------------------

export const AppBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 flex overflow-hidden', className)} {...props} />
  )
)
AppBody.displayName = 'AppBody'

// ---------------------------------------------------------------------------
// AppSidebar — left navigation panel
// bg: black/50 (darker layer) + right divider
// ---------------------------------------------------------------------------

export interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string
}
export const AppSidebar = React.forwardRef<HTMLDivElement, AppSidebarProps>(
  ({ className, width = 'w-[188px]', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col shrink-0 overflow-y-auto',
        'bg-black/50 border-r border-white/[0.08]',
        width,
        className
      )}
      {...props}
    />
  )
)
AppSidebar.displayName = 'AppSidebar'

// ---------------------------------------------------------------------------
// AppContent — main scrollable area
// bg: transparent — inherits glass from window body
// ---------------------------------------------------------------------------

export const AppContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-auto', className)} {...props} />
  )
)
AppContent.displayName = 'AppContent'

// ---------------------------------------------------------------------------
// AppSection — labeled group of content rows inside AppContent
// ---------------------------------------------------------------------------

export interface AppSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}
export const AppSection = React.forwardRef<HTMLDivElement, AppSectionProps>(
  ({ className, title, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col', className)} {...props}>
      {title && (
        <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30 select-none">
          {title}
        </div>
      )}
      {children}
    </div>
  )
)
AppSection.displayName = 'AppSection'

// ---------------------------------------------------------------------------
// AppCard — raised glass card (section container, stat box, etc.)
// bg: black/30 + border — sits one level above the glass body
// ---------------------------------------------------------------------------

export const AppCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('bg-black/30 border border-white/[0.08] rounded-lg', className)}
      {...props}
    />
  )
)
AppCard.displayName = 'AppCard'

// ---------------------------------------------------------------------------
// AppInput — text input / select / textarea base styles
// Use as className source or wrap your input with it
// ---------------------------------------------------------------------------

export const appInputClass =
  'bg-white/[0.08] border border-white/[0.08] text-white placeholder:text-white/25 rounded focus:outline-none focus:border-white/[0.20] transition-colors'

// ---------------------------------------------------------------------------
// AppDivider — thin 1px separator between sections
// ---------------------------------------------------------------------------

export const AppDivider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('h-px bg-white/[0.08] shrink-0', className)} {...props} />
  )
)
AppDivider.displayName = 'AppDivider'

// ---------------------------------------------------------------------------
// AppModal — full-screen overlay with centered glass panel
// ---------------------------------------------------------------------------

export interface AppModalProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
  panelClassName?: string
}
export const AppModal = React.forwardRef<HTMLDivElement, AppModalProps>(
  ({ className, onClose, panelClassName, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center',
        'bg-black/50',
        className
      )}
      onClick={onClose}
      {...props}
    >
      <div
        className={cn(
          'bg-black/80 backdrop-blur-md border border-white/[0.08] rounded-lg shadow-2xl',
          panelClassName
        )}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
)
AppModal.displayName = 'AppModal'

// ---------------------------------------------------------------------------
// AppStickyHeader — sticky column header (e.g. list view table head)
// bg: black/40 backdrop-blur-sm so it stays readable when rows scroll under it
// ---------------------------------------------------------------------------

export const AppStickyHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'sticky top-0 z-10',
        'bg-black/40 backdrop-blur-sm border-b border-white/[0.08]',
        'text-xs font-semibold text-white/40 select-none',
        className
      )}
      {...props}
    />
  )
)
AppStickyHeader.displayName = 'AppStickyHeader'
