import * as React from 'react'
import { cn } from '../../lib/utils'

/**
 * SystemRow — shared row pattern for all OS list surfaces.
 *
 * Used in: Start Menu, Settings sidebar, File Explorer nav,
 * Admin nav, notification list, date range presets.
 *
 * Supports two surface contexts:
 *  - "chrome"  : dark OS shell (taskbar, start menu, admin nav)
 *  - "content" : light app body (settings, CV, file explorer nav)
 *
 * @example Start Menu row
 * <SystemRow
 *   icon={<Icons.FolderOpen />}
 *   label="File Explorer"
 *   description="Browse your files"
 *   context="chrome"
 *   onClick={() => openApp('FileExplorer')}
 * />
 *
 * @example Settings sidebar row (selected)
 * <SystemRow
 *   icon={<Icons.Palette />}
 *   label="Appearance"
 *   selected
 *   accentRail
 *   context="content"
 * />
 */

export interface SystemRowProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Leading icon (16–18px, any React node) */
  icon?: React.ReactNode
  /** Primary label */
  label: string
  /** Secondary description below the label */
  description?: string
  /** Trailing metadata text */
  meta?: string
  /** Highlight this row as the active/selected item */
  selected?: boolean
  /**
   * Show a 2px accent left rail when selected (default: true).
   * Set to false to use background fill only.
   */
  accentRail?: boolean
  /** Dark chrome or light content surface context (default: "chrome") */
  context?: 'chrome' | 'content'
  /** Small status/admin badge */
  badge?: string
  /** Arbitrary trailing slot (icons, toggles, counts, etc.) */
  rightSlot?: React.ReactNode
}

const SystemRow = React.forwardRef<HTMLButtonElement, SystemRowProps>(
  (
    {
      className,
      icon,
      label,
      description,
      meta,
      selected = false,
      accentRail = true,
      context = 'chrome',
      badge,
      rightSlot,
      disabled,
      ...props
    },
    ref
  ) => {
    const isChrome = context === 'chrome'
    const showRail = selected && accentRail

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Layout
          'flex items-center gap-3 w-full text-left min-h-[40px] transition-colors duration-100 select-none',

          // Horizontal padding — pulled in by 2px when rail is shown to fit the border
          showRail ? 'pl-[10px] pr-3' : 'px-3',

          // Left accent rail (selected state)
          showRail && 'border-l-2 border-stroke-brand',

          // Context-aware hover
          isChrome
            ? 'hover:bg-os-ink-800/70 focus-visible:ring-os-line-dark-hover'
            : 'hover:bg-black/[0.04] focus-visible:ring-black/20',

          // Selected fill (no rail variant)
          selected && !accentRail && (isChrome ? 'bg-os-ink-800' : 'bg-black/[0.05]'),

          // Text color
          isChrome
            ? cn(selected ? 'text-white' : 'text-white/70 hover:text-white')
            : cn(selected ? 'text-os-text-strong' : 'text-os-text-muted hover:text-os-text-strong'),

          // Focus
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset',

          // Disabled
          disabled && 'opacity-40 pointer-events-none',

          className
        )}
        {...props}
      >
        {/* Leading icon */}
        {icon && (
          <span
            className={cn(
              'flex-shrink-0 flex items-center justify-center w-[18px] h-[18px]',
              '[&_svg]:w-4 [&_svg]:h-4',
              isChrome
                ? cn(selected ? 'text-white/70' : 'text-white/40')
                : cn(selected ? 'text-os-text-muted' : 'text-os-text-faint')
            )}
          >
            {icon}
          </span>
        )}

        {/* Label + description */}
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-medium leading-[18px] truncate">
            {label}
          </span>
          {description && (
            <span
              className={cn(
                'block text-[11px] leading-[16px] truncate mt-px',
                isChrome ? 'text-white/35' : 'text-os-text-faint'
              )}
            >
              {description}
            </span>
          )}
        </span>

        {/* Trailing slot */}
        {(meta || badge || rightSlot) && (
          <span className="flex items-center gap-1.5 flex-shrink-0 ml-1">
            {meta && (
              <span
                className={cn(
                  'text-[11px] leading-[16px]',
                  isChrome ? 'text-white/30' : 'text-os-text-faint'
                )}
              >
                {meta}
              </span>
            )}
            {badge && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-[2px] rounded-[4px] font-medium leading-none',
                  isChrome
                    ? 'bg-os-ink-800 text-os-text-inverse/70'
                    : 'bg-black/[0.05] text-os-text-muted'
                )}
              >
                {badge}
              </span>
            )}
            {rightSlot}
          </span>
        )}
      </button>
    )
  }
)
SystemRow.displayName = 'SystemRow'

/** Section header label above a group of SystemRows. */
export interface SystemRowGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  context?: 'chrome' | 'content'
}
const SystemRowGroup = React.forwardRef<HTMLDivElement, SystemRowGroupProps>(
  ({ className, context = 'chrome', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] leading-none select-none',
        context === 'chrome' ? 'text-white/30' : 'text-os-text-faint',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SystemRowGroup.displayName = 'SystemRowGroup'

/** Thin 1px divider between groups of SystemRows. */
export interface SystemRowDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  context?: 'chrome' | 'content'
}
const SystemRowDivider = React.forwardRef<HTMLDivElement, SystemRowDividerProps>(
  ({ className, context = 'chrome', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'my-1 mx-3 h-px',
        context === 'chrome' ? 'bg-os-line-dark' : 'bg-os-line-light',
        className
      )}
      {...props}
    />
  )
)
SystemRowDivider.displayName = 'SystemRowDivider'

export { SystemRow, SystemRowGroup, SystemRowDivider }
