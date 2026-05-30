import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Card — semantic card primitive aligned with the Generative Studio /
 * Product Mono direction.
 *
 * The 2026-05-30 ui/ reconciliation pass removed the Cyberpunk angled-corner
 * clip-path, the Aceternity BorderGlow integration, and the gradient
 * `CardIcon` glow effect. All variants now resolve to OS ink/line tokens
 * defined in `src/index.css` and described in `docs/DESIGN_SYSTEM.md`.
 *
 * For app body composition prefer `<AppCard>` from `ui/AppShell.tsx` —
 * `Card` exists for standalone surfaces (welcome screen, popovers,
 * non-AppShell screens).
 *
 * @example Standard card on dark chrome
 * <Card variant="standard" padding="md">
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardBody>Content</CardBody>
 * </Card>
 */

const cardVariants = cva(
  'os-interactive relative',
  {
    variants: {
      variant: {
        // Default card on dark chrome — quiet, neutral
        standard:
          'bg-os-ink-900 border border-os-line-dark hover:border-os-line-dark-hover',

        // Hoverable card — same as standard but lifts on hover
        hover:
          'bg-os-ink-900 border border-os-line-dark hover:border-os-line-dark-hover hover:bg-os-ink-800',

        // Elevated card — slightly raised tone
        elevated:
          'bg-os-ink-800 border border-os-line-dark-hover',

        // Flat / minimal — base chrome
        flat:
          'bg-os-ink-950 border border-os-line-dark',

        // Brand-accented card — uses brand stroke on hover
        accent:
          'bg-os-ink-900 border border-os-line-dark hover:border-stroke-brand',

        // Window-style card (matches Window.tsx chrome)
        window:
          'bg-os-ink-950 border border-os-line-dark shadow-os-window',

        // Modal panel
        modal:
          'bg-os-ink-950 border border-os-line-dark shadow-os-window',

        // Floating menu / context overlay
        menu:
          'bg-os-ink-950 border border-os-line-dark shadow-os-floating',

        // Light card on canvas surfaces
        light:
          'bg-os-canvas-raised border border-os-line-light hover:border-os-line-light-hover text-os-text-strong',
      },

      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },

      rounded: {
        none: 'rounded-none',
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'standard',
      padding: 'md',
      rounded: 'lg',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, rounded, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, rounded, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

/** Card header — vertical stack of title and description. */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

/** Card title — uses os-type-title-4 by default. */
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('os-type-title-4 text-os-text-inverse', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

/** Card description — uses os-type-caption with muted color. */
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('os-type-caption text-os-text-inverse/50', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

/** Card body — main content area. */
const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props} />
  )
)
CardBody.displayName = 'CardBody'

/** Alias for CardBody for consistency with shadcn-style APIs. */
const CardContent = CardBody

/** Card footer — bottom action area. */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

/** Thin 1px divider inside a card. */
const CardDivider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('h-px bg-os-line-dark my-4', className)} {...props} />
  )
)
CardDivider.displayName = 'CardDivider'

/** Compact icon container. */
export interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}
const CardIcon = React.forwardRef<HTMLDivElement, CardIconProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const sizes = { sm: 'w-12 h-12', md: 'w-16 h-16', lg: 'w-24 h-24' }
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center mb-4',
          'bg-os-ink-800 border border-os-line-dark rounded-md',
          'text-os-text-inverse',
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardIcon.displayName = 'CardIcon'

/** Status badge — small pill with semantic feedback color. */
export interface CardBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
}
const CardBadge = React.forwardRef<HTMLSpanElement, CardBadgeProps>(
  ({ className, variant = 'neutral', ...props }, ref) => {
    const variants = {
      brand: 'bg-brand-subtle text-fg-brand border-stroke-brand',
      success: 'bg-success-subtle text-fg-success border-stroke-success',
      info: 'bg-os-ink-800 text-fg-info border-stroke-info',
      warning: 'bg-os-ink-800 text-fg-warning border-stroke-warning',
      error: 'bg-error-subtle text-fg-error border-stroke-error',
      neutral: 'bg-os-ink-800 text-os-text-inverse/70 border-os-line-dark-hover',
    }
    return (
      <span
        ref={ref}
        className={cn(
          'os-type-caption px-2 py-0.5 border rounded inline-flex items-center gap-1',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
CardBadge.displayName = 'CardBadge'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardContent,
  CardFooter,
  CardDivider,
  CardIcon,
  CardBadge,
  cardVariants,
}
