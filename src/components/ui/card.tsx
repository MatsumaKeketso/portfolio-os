import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { BorderGlow } from '../aceternity/ui/border-glow'

/**
 * Card component with Aceternity UI styling
 * Provides multiple glass-morphism and solid variants for PortfolioOS
 *
 * @example Window chrome card
 * <Card variant="window">
 *   <CardHeader>Window Title</CardHeader>
 *   <CardBody>Content</CardBody>
 * </Card>
 *
 * @example Desktop icon card
 * <Card variant="icon" padding="sm">
 *   <Icon />
 *   <span>App Name</span>
 * </Card>
 */

const cardVariants = cva(
  // Base styles
  'transition-all',
  {
    variants: {
      variant: {
        // Window chrome (primary card style)
        window:
          'bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-window',

        // Modal/Panel style (AdminPanel, StartMenu)
        modal:
          'bg-gray-800/95 backdrop-blur-2xl border border-gray-700/50 shadow-2xl',

        // Desktop icon card
        icon: 'bg-gray-900/95 backdrop-blur-lg border border-white/20 shadow-glass',

        // Context menu
        menu: 'bg-white dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-md',

        // Elevated card (dropdowns, tooltips)
        elevated:
          'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-elevated',
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

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardBody,
  cardVariants,
}
