import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Button component with Framer-inspired styling
 * Provides multiple variants for different use cases across GenOS
 *
 * Color System:
 * - Primary: Red (main actions, CTAs)
 * - Secondary: White/Gray (neutral actions)
 * - Tertiary: Orange (accent actions, highlights)
 * - System: Ghost/minimal buttons for UI chrome
 *
 * @example Basic usage
 * <Button variant="primary" size="md">Click me</Button>
 *
 * @example Window control button
 * <Button variant="ghost" size="icon"><X /></Button>
 *
 * @example Taskbar button
 * <Button variant="taskbar" size="iconLg" data-active={isActive}>
 *   <AppIcon />
 * </Button>
 */

const buttonVariants = cva(
  // Base styles (applied to all variants) - Cyberpunk easing
  'inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
  {
    variants: {
      variant: {
        // === SOFT PROMINENCE (Timeline inactive state - semi-transparent, thin border) ===

        // Soft Brand Colors
        'soft-brand-primary':
          'bg-os-ink-950/50 text-primary-400/70 border border-primary-500/30 hover:border-primary-500/60 hover:bg-primary-500/10 hover:text-primary-400 hover:translate-y-[-1px] font-bold uppercase tracking-wide overflow-hidden relative',

        'soft-brand-secondary':
          'bg-os-ink-950/50 text-secondary-400/70 border border-secondary-500/30 hover:border-secondary-500/60 hover:bg-secondary-500/10 hover:text-secondary-400 hover:translate-y-[-1px] font-bold uppercase tracking-wide overflow-hidden relative',

        'soft-brand-tertiary':
          'bg-os-ink-950/50 text-tertiary-400/70 border border-tertiary-500/30 hover:border-tertiary-500/60 hover:bg-tertiary-500/10 hover:text-tertiary-400 hover:translate-y-[-1px] font-bold uppercase tracking-wide overflow-hidden relative',

        // Soft System Colors (neutral UI)
        'soft-system-primary':
          'bg-white/[0.06] text-white/60 border border-white/[0.10] hover:border-white/[0.18] hover:bg-white/[0.10] hover:text-white/80 hover:translate-y-[-1px] font-medium',

        'soft-system-secondary':
          'bg-white/[0.04] text-white/40 border border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-white/60 hover:translate-y-[-1px] font-medium',

        'soft-system-tertiary':
          'bg-white/[0.02] text-white/30 border border-white/[0.06] hover:border-white/[0.10] hover:bg-white/[0.06] hover:text-white/50 hover:translate-y-[-1px] font-medium',

        // === SOLID PROMINENCE (Timeline active state - solid fill, shadow glow) ===

        // Solid Brand Colors
        'solid-brand-primary':
          'bg-primary-500 text-gray-950 shadow-lg shadow-primary-500/50 hover:bg-primary-400 hover:shadow-primary-500/60 hover:translate-y-[-1px] active:translate-y-[0px] font-bold uppercase tracking-wide',

        'solid-brand-secondary':
          'bg-secondary-500 text-gray-950 shadow-lg shadow-secondary-500/50 hover:bg-secondary-400 hover:shadow-secondary-500/60 hover:translate-y-[-1px] active:translate-y-[0px] font-bold uppercase tracking-wide',

        'solid-brand-tertiary':
          'bg-tertiary-500 text-gray-950 shadow-lg shadow-tertiary-500/50 hover:bg-tertiary-400 hover:shadow-tertiary-500/60 hover:translate-y-[-1px] active:translate-y-[0px] font-bold uppercase tracking-wide',

        // Solid System Colors (neutral filled)
        'solid-system-primary':
          'bg-os-ink-800 text-white hover:bg-os-ink-700 hover:translate-y-[-1px] active:translate-y-[0px] font-medium',

        'solid-system-secondary':
          'bg-os-ink-900 text-white/80 hover:bg-os-ink-800 hover:translate-y-[-1px] active:translate-y-[0px] font-medium',

        'solid-system-tertiary':
          'bg-os-ink-950 text-white/60 hover:bg-os-ink-900 hover:translate-y-[-1px] active:translate-y-[0px] font-medium',

        // === UTILITY VARIANTS (special purposes) ===

        // Ghost - Minimal UI chrome (no angled corners)
        ghost:
          'bg-transparent border border-transparent text-white/60 hover:bg-white/[0.08] hover:text-white hover:translate-y-[-1px]',

        // Ghost Danger - Close buttons (no angled corners)
        'ghost-danger':
          'bg-transparent border border-transparent text-white/60 hover:bg-red-500/20 hover:text-red-300',

        // Outline - Just borders
        outline:
          'bg-transparent border border-primary-500/30 text-primary-400/70 hover:border-primary-500/60 hover:bg-primary-500/10 hover:text-primary-400 hover:translate-y-[-1px] font-bold uppercase tracking-wide overflow-hidden relative',

        // Taskbar - Special taskbar buttons (no angled corners)
        taskbar:
          'text-white/50 hover:text-white hover:bg-white/[0.08] relative rounded transition-colors duration-150',

        // Menu Item - Context menu items (no angled corners)
        'menu-item':
          'w-full justify-start hover:bg-white/[0.08] text-white/80 rounded-none',

        // === PRODUCT MONO / OS INK VARIANTS ===

        // Black-filled primary — use on light content surfaces
        ink:
          'bg-os-ink-950 text-os-text-inverse hover:bg-os-ink-800 hover:translate-y-[-1px] active:translate-y-[0px] font-medium',

        // Outline — use on light content surfaces (secondary action)
        'ink-outline':
          'bg-transparent border border-os-ink-950 text-os-ink-950 hover:bg-os-ink-950 hover:text-os-text-inverse hover:translate-y-[-1px] font-medium',

        // Ghost — use on dark chrome surfaces
        'ink-ghost':
          'bg-transparent text-white/60 hover:bg-white/[0.08] hover:text-white font-medium',

        // Ghost — use on light content surfaces
        'content-ghost':
          'bg-transparent text-os-text-muted hover:bg-black/[0.05] hover:text-os-text-strong font-medium',

        // === LEGACY ALIASES (backward compatibility) ===
        primary: 'bg-white/[0.06] text-primary-400/70 border border-primary-500/30 hover:border-primary-500/60 hover:bg-primary-500/10 hover:text-primary-400 hover:translate-y-[-1px] data-[active=true]:bg-primary-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-primary-500/50 font-bold uppercase tracking-wide overflow-hidden relative',
        secondary: 'bg-white/[0.06] text-secondary-400/70 border border-secondary-500/30 hover:border-secondary-500/60 hover:bg-secondary-500/10 hover:text-secondary-400 hover:translate-y-[-1px] data-[active=true]:bg-secondary-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-secondary-500/50 font-bold uppercase tracking-wide overflow-hidden relative',
        tertiary: 'bg-white/[0.06] text-tertiary-400/70 border border-tertiary-500/30 hover:border-tertiary-500/60 hover:bg-tertiary-500/10 hover:text-tertiary-400 hover:translate-y-[-1px] data-[active=true]:bg-tertiary-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-tertiary-500/50 font-bold uppercase tracking-wide overflow-hidden relative',
        danger: 'bg-white/[0.06] text-red-400/70 border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400 hover:translate-y-[-1px] data-[active=true]:bg-red-500 data-[active=true]:text-white font-bold uppercase tracking-wide overflow-hidden relative',
        success: 'bg-white/[0.06] text-accent-400/70 border border-accent-500/30 hover:border-accent-500/60 hover:bg-accent-500/10 hover:text-accent-400 hover:translate-y-[-1px] data-[active=true]:bg-accent-500 data-[active=true]:text-white font-bold uppercase tracking-wide overflow-hidden relative',
        menuItem: 'w-full justify-start hover:bg-white/[0.08] text-white/80 rounded-none transition-all duration-100',
        ghostDanger: 'bg-transparent border border-transparent text-white/60 hover:bg-red-500/20 hover:text-red-300',
      },

      size: {
        // Icon buttons (window controls)
        icon: 'w-8 h-8 rounded',

        // Larger icon buttons (taskbar)
        iconLg: 'w-10 h-10 rounded-[10px]',

        // Text button sizes
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-4 py-2 text-base rounded-md',
        lg: 'px-6 py-3 text-lg rounded-lg',

        // Calculator-specific size
        calculator: 'h-14 text-lg rounded-lg px-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Button component
 *
 * @param variant - The button style variant
 * @param size - The button size
 * @param asChild - When true, renders as the child element instead of a button
 * @param className - Additional classes to apply
 * @param children - Button content
 * @param ...props - All other button HTML attributes
 *
 * @example With asChild
 * <Button asChild>
 *   <a href="/about">Go to About</a>
 * </Button>
 * // Renders: <a class="button-classes" href="/about">Go to About</a>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={style}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
