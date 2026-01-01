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
  // Base styles (applied to all variants)
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // === PRIMARY BUTTON (Red - Main Actions) ===
        primary:
          'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-glow-primary-hover active:scale-95',

        // === SECONDARY BUTTON (White/Gray - Neutral Actions) ===
        secondary:
          'bg-secondary-700 text-white border border-secondary-600 hover:bg-secondary-600 hover:border-secondary-500 shadow-sm',

        // === TERTIARY BUTTON (Orange - Accent Actions) ===
        tertiary:
          'bg-gradient-to-r from-tertiary-500 to-tertiary-600 text-white hover:from-tertiary-600 hover:to-tertiary-700 shadow-md hover:shadow-glow-tertiary-hover active:scale-95',

        // === SYSTEM BUTTONS (UI Chrome) ===
        // Window chrome buttons (minimal, glass effect)
        ghost: 'hover:bg-white/10 text-white',

        // Close button (danger on hover)
        ghostDanger: 'hover:bg-primary-500 text-white',

        // Taskbar buttons (with active state)
        taskbar:
          'hover:bg-white/10 text-white data-[active=true]:bg-white/20 data-[active=true]:border-b-2 data-[active=true]:border-primary-500 relative',

        // === SEMANTIC BUTTONS ===
        // Danger buttons (destructive actions)
        danger:
          'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-glow-primary active:scale-95',

        // Success buttons (positive actions)
        success:
          'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-glow-green active:scale-95',

        // Outline variant (secondary style)
        outline:
          'border-2 border-secondary-400 text-secondary-50 hover:bg-secondary-800 hover:border-secondary-300',

        // Context menu items
        menuItem:
          'w-full justify-start hover:bg-primary-50 dark:hover:bg-primary-600/20 text-gray-700 dark:text-gray-200 rounded-none',
      },

      size: {
        // Icon buttons (window controls)
        icon: 'w-8 h-8 rounded',

        // Larger icon buttons (taskbar)
        iconLg: 'w-10 h-10 rounded',

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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
