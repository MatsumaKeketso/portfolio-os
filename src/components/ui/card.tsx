import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { BorderGlow } from '../aceternity/ui/border-glow'

/**
 * Card component with Framer-inspired styling
 * Provides multiple glass-morphism and solid variants for GenOS
 *
 * @example Hover card (desktop icon style)
 * <Card variant="hover">
 *   <CardAccent />
 *   <CardContent>Content</CardContent>
 * </Card>
 *
 * @example Standard glassmorphism card
 * <Card variant="standard">
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *   </CardHeader>
 *   <CardBody>Content</CardBody>
 * </Card>
 *
 * @example Window chrome card
 * <Card variant="window">
 *   <CardHeader>Window Title</CardHeader>
 *   <CardBody>Content</CardBody>
 * </Card>
 */

const cardVariants = cva(
  // Base styles - Cyberpunk easing
  'relative transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
  {
    variants: {
      variant: {
        // Desktop icon style card
        hover:
          'bg-os-ink-900 border border-os-line-dark hover:border-os-line-dark-hover hover:bg-os-ink-800 hover:translate-y-[-2px] overflow-hidden',

        // Standard panel
        standard:
          'bg-os-ink-900 border border-os-line-dark hover:border-os-line-dark-hover hover:bg-os-ink-800 hover:translate-y-[-1px]',

        // Elevated panel
        elevated:
          'bg-os-ink-900 border border-os-line-dark hover:border-os-line-dark-hover hover:translate-y-[-2px]',

        // Flat minimal surface
        flat:
          'bg-os-ink-950 border border-os-line-dark hover:border-os-line-dark-hover',

        // Accent panel
        accent:
          'bg-os-ink-900 border border-os-line-dark-hover hover:border-stroke-brand hover:translate-y-[-1px]',

        // Window main container
        window:
          'bg-os-ink-950 border border-os-line-dark shadow-os-window',

        // Modal elevated dialog
        modal:
          'bg-os-ink-950 border border-os-line-dark shadow-os-window',

        // Icon container
        icon:
          'bg-os-ink-900 border border-os-line-dark',

        // Menu context panel
        menu:
          'bg-os-ink-950 border border-os-line-dark shadow-os-floating',
      },

      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },

      rounded: {
        none: 'rounded-none',    // Cyberpunk default
        md: 'rounded-none',      // Override to sharp for Cyberpunk
        lg: 'rounded-none',      // Override to sharp for Cyberpunk
        xl: 'rounded-none',      // Override to sharp for Cyberpunk
      },
    },
    defaultVariants: {
      variant: 'window',
      padding: 'md',
      rounded: 'none',           // Force sharp for Cyberpunk
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  borderGlow?: boolean
  glowColor?: string
  glowSize?: number
}

/**
 * Card component
 *
 * @param variant - The card style variant
 * @param padding - The card padding
 * @param rounded - The card border radius
 * @param borderGlow - Enable cursor-following border glow effect
 * @param glowColor - Color of the glow effect
 * @param glowSize - Size of the glow effect in pixels
 * @param className - Additional classes to apply
 * @param children - Card content
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, rounded, borderGlow = false, glowColor, glowSize, style, ...props }, ref) => {
    // Variants that get angled corners (Star Citizen HUD style)
    const hasAngledCorners = variant && ['hover', 'standard', 'elevated', 'accent', 'modal'].includes(variant)

    const clipPathStyle = hasAngledCorners
      ? {
          clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
          ...style,
        }
      : style

    const card = (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, rounded, className }))}
        style={clipPathStyle}
        {...props}
      />
    )

    if (borderGlow) {
      return (
        <BorderGlow
          glowColor={glowColor}
          glowSize={glowSize}
          borderRadius={rounded === 'none' ? '0' : rounded === 'md' ? '0.5rem' : rounded === 'lg' ? '0.75rem' : '1rem'}
        >
          {card}
        </BorderGlow>
      )
    }

    return card
  }
)
Card.displayName = 'Card'

/**
 * Card Header component
 * Used for card titles and top sections
 *
 * @example
 * <CardHeader>
 *   <CardTitle>Title</CardTitle>
 *   <CardDescription>Description</CardDescription>
 * </CardHeader>
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

/**
 * Card Title component
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

/**
 * Card Description component
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-white/40', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

/**
 * Card Body component
 * Main content area of the card
 */
const CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
))
CardBody.displayName = 'CardBody'

/**
 * Card Footer component
 * Used for actions and bottom sections
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

/**
 * Card Accent Bar
 * HUD top data strip (no glow, just thin line)
 */
const CardAccent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'primary' | 'tertiary' | 'mixed' }
>(({ className, variant = 'mixed', ...props }, ref) => {
  const gradients = {
    primary: 'bg-gradient-to-r from-transparent via-primary-500/60 to-transparent',
    tertiary: 'bg-gradient-to-r from-transparent via-tertiary-500/60 to-transparent',
    mixed: 'bg-gradient-to-r from-primary-500/40 via-tertiary-500/60 to-primary-500/40',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'absolute top-0 left-0 right-0 h-[1px]',  // Thin data indicator line
        gradients[variant],
        className
      )}
      {...props}
    />
  );
});
CardAccent.displayName = 'CardAccent';

/**
 * Card Divider
 * HUD section divider (subtle, no glow)
 */
const CardDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'h-px bg-os-line-dark my-4',
      className
    )}
    {...props}
  />
));
CardDivider.displayName = 'CardDivider';

/**
 * Card Icon
 * Icon container with glow effect
 */
const CardIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    glowColor?: 'primary' | 'tertiary' | 'mixed';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, glowColor = 'mixed', size = 'md', children, ...props }, ref) => {
  const glowColors = {
    primary: 'bg-gradient-to-br from-primary-500/30 to-primary-600/30',
    tertiary: 'bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/30',
    mixed: 'bg-gradient-to-br from-primary-500/30 to-tertiary-500/30',
  };

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div ref={ref} className={cn('relative flex items-center justify-center mb-4', className)} {...props}>
      {/* Glow effect */}
      <div className={cn('absolute inset-0', glowColors[glowColor])} />

      {/* Icon */}
      <div className={cn('relative z-10 text-white drop-shadow-lg flex items-center justify-center', sizes[size])}>
        {children}
      </div>
    </div>
  );
});
CardIcon.displayName = 'CardIcon';

/**
 * Card Badge
 * Pill-shaped badge (desktop icon style)
 */
const CardBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'primary' | 'tertiary' | 'success' | 'info';
  }
>(({ className, variant = 'primary', ...props }, ref) => {
  const variants = {
    primary:
      'bg-primary-500/15 text-primary-300 border-primary-500/30',
    tertiary:
      'bg-tertiary-500/15 text-tertiary-300 border-tertiary-500/30',
    success:
      'bg-green-500/15 text-green-300 border-green-500/30',
    info:
      'bg-blue-500/15 text-blue-300 border-blue-500/30',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'px-2.5 py-1 border rounded-full text-xs font-medium inline-flex items-center gap-1.5',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
CardBadge.displayName = 'CardBadge';

/**
 * Card Content
 * Alias for CardBody for consistency with new naming
 */
const CardContent = CardBody;

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardBody,
  CardContent,
  CardAccent,
  CardDivider,
  CardIcon,
  CardBadge,
  cardVariants,
}
