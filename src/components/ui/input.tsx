import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Input component with Aceternity UI styling
 * Provides multiple variants for different contexts in GenOS
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
  // Base styles (applied to all variants) - Cyberpunk focus treatment
  'flex w-full text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]',
  {
    variants: {
      variant: {
        // Dark chrome input (StartMenu, AdminPanel, dark surfaces)
        glass:
          'bg-os-ink-700 border border-os-line-dark text-white focus:border-stroke-brand',

        // Solid dark input (standard forms on dark surfaces)
        solid:
          'bg-os-ink-800 border border-os-line-dark text-white focus:border-stroke-brand',

        // Light surface input (CV, Settings content areas)
        light:
          'bg-white border border-os-line-light text-os-text-strong placeholder:text-os-text-faint focus:border-os-ink-950 focus:ring-1 focus:ring-os-ink-950',

        // Search variant with left icon space
        search:
          'bg-os-ink-700 border border-os-line-dark text-white pl-10 focus:border-stroke-brand',
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
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> { }

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
