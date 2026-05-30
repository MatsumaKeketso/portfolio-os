import * as React from 'react'
import { cn } from '../../lib/utils'
import { Typography } from './Typography'

/**
 * AppShell — layout primitives for every app window.
 *
 * App windows should use semantic OS tokens instead of raw alpha colors.
 * These components add shared structure for dark chrome system apps.
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
        'bg-os-ink-900 border-b border-os-line-dark',
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
        'bg-os-ink-950 border-r border-os-line-dark',
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
    <div ref={ref} className={cn('flex-1 overflow-auto pb-[var(--window-cutout-bottom,0px)]', className)} {...props} />
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
        <Typography as="div" variant="label" tone="inverseFaint" className="px-3 pt-4 pb-1 select-none">
          {title}
        </Typography>
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
      className={cn('bg-os-ink-900 border border-os-line-dark rounded-lg', className)}
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
  'bg-os-ink-800 border border-os-line-dark text-os-text-inverse placeholder:text-os-text-inverse/25 rounded focus:outline-none focus:border-stroke-brand transition-colors'

export const appSelectClass =
  'os-select os-focus-ring bg-os-ink-800 border border-os-line-dark text-os-text-inverse rounded focus:outline-none focus:border-stroke-brand transition-colors'

export const appInteractiveClass =
  'os-interactive os-focus-ring'

export const appIconButtonClass =
  'os-interactive os-focus-ring rounded-md text-os-text-inverse/55 hover:bg-os-ink-800/70 hover:text-os-text-inverse'

export const appSoftButtonClass =
  'os-interactive os-focus-ring rounded-md border border-os-line-dark bg-os-ink-900 text-os-text-inverse/65 hover:border-os-line-dark-hover hover:bg-os-ink-800 hover:text-os-text-inverse'

export const appTableClass =
  'overflow-hidden rounded-lg border border-os-line-dark bg-os-ink-900'

export const appTableHeaderClass =
  'grid gap-4 border-b border-os-line-dark bg-os-ink-950/70 px-4 py-2.5 os-type-label text-os-text-inverse/40'

export const appTableBodyClass =
  'divide-y divide-os-line-dark'

export const appTableRowClass =
  'os-row-hover grid gap-4 items-center px-4 py-2.5'

// Settings/admin-style outer panel — same surface tone as <AppCard> but without
// forced padding. Compose with `cn(appPanelClass, 'p-6')` at the call site.
export const appPanelClass =
  'bg-os-ink-900 border border-os-line-dark rounded-lg'

// Settings/admin-style interior row — slightly darker tone, indicates a single
// settings line. Compose with `cn(appRowClass, 'p-4')` at the call site.
export const appRowClass =
  'flex items-center gap-3 bg-os-ink-950/70 border border-os-line-dark rounded-lg transition-colors'

// ---------------------------------------------------------------------------
// AppDivider — thin 1px separator between sections
// ---------------------------------------------------------------------------

export const AppDivider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('h-px bg-os-line-dark shrink-0', className)} {...props} />
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
        'bg-background-overlay',
        className
      )}
      onClick={onClose}
      {...props}
    >
      <div
        className={cn(
          'bg-background-floating border border-os-line-dark rounded-lg shadow-2xl',
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
// bg: chrome so it stays readable when rows scroll under it
// ---------------------------------------------------------------------------

export const AppStickyHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Typography
      as="div"
      variant="label"
      tone="inverseFaint"
      ref={ref}
      className={cn(
        'sticky top-0 z-10',
        'bg-os-ink-950 border-b border-os-line-dark',
        'select-none',
        className
      )}
      {...props}
    />
  )
)
AppStickyHeader.displayName = 'AppStickyHeader'
