import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Button — canonical button primitive for GenOS.
 *
 * Variant naming follows {prominence}-{tone}-{rank} for the brand/system
 * pairs, and shorthand names for utility roles. The 2026-05-30 ui/
 * reconciliation pass kept all variants in place for backward compatibility
 * but marked the original `primary`/`secondary`/`tertiary`/`danger`/
 * `success`/`menuItem`/`ghostDanger` aliases as @deprecated.
 *
 * Use the explicit name in new code so prominence/tone/rank is readable
 * at the call site. See `docs/DESIGN_SYSTEM.md` §Component Primitives for
 * the full guide.
 *
 * Current variant catalog:
 *
 * Soft prominence (translucent, thin border):
 *  - soft-brand-primary  / soft-brand-secondary  / soft-brand-tertiary
 *  - soft-system-primary / soft-system-secondary / soft-system-tertiary
 *
 * Solid prominence (filled, shadow glow):
 *  - solid-brand-primary  / solid-brand-secondary  / solid-brand-tertiary
 *  - solid-system-primary / solid-system-secondary / solid-system-tertiary
 *
 * Utility:
 *  - ghost           — minimal UI chrome
 *  - ghost-danger    — close/destructive icon buttons
 *  - outline         — outlined brand button
 *  - taskbar         — taskbar app launchers
 *  - menu-item       — context menu rows
 *
 * Product Mono (use on light content surfaces):
 *  - ink             — black-filled primary
 *  - ink-outline     — outlined ink secondary
 *  - ink-ghost       — ghost button on dark chrome
 *  - content-ghost   — ghost button on light content
 *
 * @example Brand primary (Generative Studio red, prominent CTA)
 * <Button variant="solid-brand-primary" size="md">Publish</Button>
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
  'os-interactive os-focus-ring inline-flex items-center justify-center whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50',
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
          'bg-os-ink-800 text-white/75 border border-os-line-dark-hover hover:border-stroke-brand hover:bg-os-ink-700 hover:text-white hover:translate-y-[-1px] font-medium',

        'soft-system-secondary':
          'bg-os-ink-900 text-white/65 border border-os-line-dark hover:border-os-line-dark-hover hover:bg-os-ink-800 hover:text-white/85 hover:translate-y-[-1px] font-medium',

        'soft-system-tertiary':
          'bg-os-ink-950 text-white/55 border border-os-line-dark hover:border-os-line-dark-hover hover:bg-os-ink-900 hover:text-white/75 hover:translate-y-[-1px] font-medium',

        // === SOLID PROMINENCE (Timeline active state - solid fill, shadow glow) ===

        // Solid Brand Colors — fill from the brand ramp, foreground auto-contrasts
        // (text-fg-on-primary = smart black/white per brand luminance, set in themeStore).
        'solid-brand-primary':
          'bg-brand-600 text-fg-on-primary shadow-lg shadow-glow-primary hover:bg-brand-400 hover:translate-y-[-1px] active:translate-y-[0px] font-bold uppercase tracking-wide',

        'solid-brand-secondary':
          'bg-brand-600 text-fg-on-primary shadow-lg shadow-glow-primary hover:bg-brand-400 hover:translate-y-[-1px] active:translate-y-[0px] font-bold uppercase tracking-wide',

        'solid-brand-tertiary':
          'bg-brand-600 text-fg-on-primary shadow-lg shadow-glow-primary hover:bg-brand-400 hover:translate-y-[-1px] active:translate-y-[0px] font-bold uppercase tracking-wide',

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
          'bg-transparent border border-transparent text-os-text-inverse/60 hover:bg-os-ink-800/70 hover:text-os-text-inverse',

        // Ghost Danger - Close buttons (no angled corners)
        'ghost-danger':
          'bg-transparent border border-transparent text-white/60 hover:bg-red-500/20 hover:text-red-300',

        // Outline - Just borders
        outline:
          'bg-transparent border border-primary-500/30 text-primary-400/70 hover:border-primary-500/60 hover:bg-primary-500/10 hover:text-primary-400 hover:translate-y-[-1px] font-bold uppercase tracking-wide overflow-hidden relative',

        // Taskbar - Special taskbar buttons (no angled corners)
        taskbar:
          'text-os-text-inverse/50 hover:text-os-text-inverse hover:bg-os-ink-800/70 relative rounded',

        // Menu Item - Context menu items (no angled corners)
        'menu-item':
          'w-full justify-start hover:bg-os-ink-800/70 text-os-text-inverse/80 rounded-none',

        // === PRODUCT MONO / OS INK VARIANTS ===

        // Black-filled primary — use on light content surfaces
        ink:
          'bg-os-ink-950 text-os-text-inverse hover:bg-os-ink-800 hover:translate-y-[-1px] active:translate-y-[0px] font-medium',

        // Outline — use on light content surfaces (secondary action)
        'ink-outline':
          'bg-transparent border border-os-ink-950 text-os-ink-950 hover:bg-os-ink-950 hover:text-os-text-inverse hover:translate-y-[-1px] font-medium',

        // Ghost — use on dark chrome surfaces
        'ink-ghost':
          'bg-transparent text-os-text-inverse/60 hover:bg-os-ink-800/70 hover:text-os-text-inverse font-medium',

        // Ghost — use on light content surfaces
        'content-ghost':
          'bg-transparent text-os-text-muted hover:bg-black/[0.05] hover:text-os-text-strong font-medium',

        // === LEGACY ALIASES (backward compatibility) ===
        // @deprecated Use `soft-brand-primary` (toggle row) or `solid-brand-primary` (CTA) instead.
        primary: 'bg-os-ink-950/50 text-primary-400/70 border border-primary-500/30 hover:border-primary-500/60 hover:bg-primary-500/10 hover:text-primary-400 data-[active=true]:bg-primary-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-primary-500/50 font-bold uppercase tracking-wide overflow-hidden relative',
        // @deprecated Use `soft-brand-secondary` or `solid-brand-secondary` instead.
        secondary: 'bg-os-ink-950/50 text-secondary-400/70 border border-secondary-500/30 hover:border-secondary-500/60 hover:bg-secondary-500/10 hover:text-secondary-400 data-[active=true]:bg-secondary-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-secondary-500/50 font-bold uppercase tracking-wide overflow-hidden relative',
        // @deprecated Use `soft-brand-tertiary` or `solid-brand-tertiary` instead.
        tertiary: 'bg-os-ink-950/50 text-tertiary-400/70 border border-tertiary-500/30 hover:border-tertiary-500/60 hover:bg-tertiary-500/10 hover:text-tertiary-400 data-[active=true]:bg-tertiary-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-tertiary-500/50 font-bold uppercase tracking-wide overflow-hidden relative',
        // @deprecated Use `ghost-danger` for icon-only close actions, or compose a destructive button explicitly.
        danger: 'bg-os-ink-950/50 text-red-400/70 border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400 data-[active=true]:bg-red-500 data-[active=true]:text-white font-bold uppercase tracking-wide overflow-hidden relative',
        // @deprecated Tie success state to the semantic `fg-success` token explicitly instead.
        success: 'bg-os-ink-950/50 text-accent-400/70 border border-accent-500/30 hover:border-accent-500/60 hover:bg-accent-500/10 hover:text-accent-400 data-[active=true]:bg-accent-500 data-[active=true]:text-white font-bold uppercase tracking-wide overflow-hidden relative',
        // @deprecated Use `menu-item` (kebab-case) instead.
        menuItem: 'w-full justify-start hover:bg-os-ink-800/70 text-os-text-inverse/80 rounded-none',
        // @deprecated Use `ghost-danger` (kebab-case) instead.
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
