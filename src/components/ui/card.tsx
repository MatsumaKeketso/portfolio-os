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
  // Base styles
  'relative transition-all duration-300',
  {
    variants: {
      variant: {
        // Desktop icon hover card style (Netflix-inspired with new colors)
        hover:
          'bg-gradient-to-b from-gray-900 via-gray-900 to-black overflow-hidden shadow-2xl border border-gray-700/50 hover:border-gray-600/70 hover:scale-[1.02]',

        // Standard glassmorphism card
        standard:
          'bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/30 shadow-lg',

        // Elevated card with stronger shadow
        elevated:
          'bg-gradient-to-b from-system-surface-raised to-system-surface-base border border-white/10 shadow-elevated hover:shadow-2xl',

        // Flat card with minimal styling
        flat:
          'bg-system-surface-base border border-white/8 hover:border-white/12 shadow-sm',

        // Accent card with primary color
        accent:
          'bg-gradient-to-br from-primary-900/20 to-tertiary-900/20 border border-primary-500/30 shadow-glow-primary',

        // Window chrome (for compatibility)
        window:
          'bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-window',

        // Modal/Panel style (for compatibility)
        modal:
          'bg-gray-800/95 backdrop-blur-2xl border border-gray-700/50 shadow-2xl',

        // Desktop icon card (for compatibility)
        icon: 'bg-gray-900/95 backdrop-blur-lg border border-white/20 shadow-glass',

        // Context menu (for compatibility)
        menu: 'bg-white dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-md',
      },

      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },

      rounded: {
        none: 'rounded-none',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'window',
      padding: 'md',
      rounded: 'lg',
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
  ({ className, variant, padding, rounded, borderGlow = false, glowColor, glowSize, ...props }, ref) => {
    const card = (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, rounded, className }))}
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
    className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
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
 * Colorful gradient bar at the top of hover cards
 */
const CardAccent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'primary' | 'tertiary' | 'mixed' }
>(({ className, variant = 'mixed', ...props }, ref) => {
  const gradients = {
    primary: 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500',
    tertiary: 'bg-gradient-to-r from-tertiary-500 via-tertiary-600 to-tertiary-500',
    mixed: 'bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'absolute top-0 left-0 right-0 h-1',
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
 * Gradient divider line (desktop icon style)
 */
const CardDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-4',
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
      <div className={cn('absolute inset-0 blur-2xl', glowColors[glowColor])} />

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
