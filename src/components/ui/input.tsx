import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Input component with Aceternity UI styling
 * Provides multiple variants for different contexts in PortfolioOS
 *
 * @example Glass-morphism input (StartMenu search)
 * <Input variant="glass" placeholder="Search apps..." />
 *
 * @example Solid input (forms)
 * <Input variant="solid" type="text" />
 *
 * @example Search input with icon spacing
 * <Input variant="search" placeholder="Search..." />
 */

const inputVariants = cva(
  // Base styles (applied to all variants)
  'flex w-full rounded-md text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        // Glass-morphism input (StartMenu, AdminPanel)
        glass:
          'bg-gray-700/50 border border-gray-600/50 text-white backdrop-blur-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500',

        // Solid input (standard forms)
        solid:
          'bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',

        // Light theme input
        light:
          'bg-white border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',

        // Search variant with icon spacing
        search:
          'bg-gray-700/50 border border-gray-600/50 text-white pl-10 backdrop-blur-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
      },

      size: {
        sm: 'h-8 px-3 py-1.5 text-xs',
        md: 'h-10 px-4 py-2.5 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'glass',
      size: 'md',
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

/**
 * Input component
 *
 * @param variant - The input style variant
 * @param size - The input size
 * @param className - Additional classes to apply
 * @param type - Input type (text, email, password, etc.)
 * @param ...props - All other input HTML attributes
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }
