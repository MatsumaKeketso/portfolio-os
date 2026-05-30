import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Input — text input primitive aligned with the Generative Studio /
 * Product Mono direction.
 *
 * The 2026-05-30 ui/ reconciliation pass replaced the legacy "Aceternity"
 * and "Cyberpunk" treatments with OS ink/line/stroke tokens defined in
 * `src/index.css` and described in `docs/DESIGN_SYSTEM.md`.
 *
 * Most apps should reach for the AppShell input class helpers first
 * (`appInputClass`, `appSelectClass`) or `ControlInput`/`ControlSelect`
 * from `ui/control.tsx` for icon-prefixed inputs. Use `<Input>` directly
 * when a standalone form input is needed outside the AppShell contract.
 *
 * @example Dark chrome input (forms on dark surfaces)
 * <Input variant="solid" placeholder="Search…" />
 *
 * @example Light input (forms on canvas surfaces)
 * <Input variant="light" placeholder="Search…" />
 */

const inputVariants = cva(
  'os-focus-ring flex w-full file:border-0 file:bg-transparent file:text-sm file:font-medium ' +
    'placeholder:text-os-text-inverse/30 focus-visible:outline-none ' +
    'disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150',
  {
    variants: {
      variant: {
        // Default — dark chrome input (forms on dark surfaces)
        solid:
          'bg-os-ink-800 border border-os-line-dark text-os-text-inverse focus:border-stroke-brand',

        // Subtle — slightly lighter chrome (StartMenu search, popovers)
        glass:
          'bg-os-ink-700 border border-os-line-dark text-os-text-inverse focus:border-stroke-brand',

        // Search variant — leaves room for a leading icon
        search:
          'bg-os-ink-700 border border-os-line-dark text-os-text-inverse pl-10 focus:border-stroke-brand',

        // Light — input on canvas surfaces (Settings, CV)
        light:
          'bg-os-canvas border border-os-line-light text-os-text-strong placeholder:text-os-text-faint ' +
            'focus:border-stroke-brand',
      },

      size: {
        sm: 'h-8 px-3 py-1.5 text-xs rounded',
        md: 'h-10 px-4 py-2 text-sm rounded-md',
        lg: 'h-12 px-4 py-3 text-base rounded-md',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type = 'text', ...props }, ref) => (
    <input
      type={type}
      className={cn(inputVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input, inputVariants }
