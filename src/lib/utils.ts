import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for conflicting classes
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', 'px-4') // => 'py-1 bg-blue-500 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Glass-morphism utility for consistent backdrop blur effects
 * Used across windows, modals, taskbar, and desktop elements
 *
 * @param variant - The glass effect intensity and color
 * @returns Tailwind classes for glass-morphism effect
 *
 * @example
 * <div className={glassEffect('dark')}>Window</div>
 * <div className={glassEffect('light')}>Icon Panel</div>
 */
export function glassEffect(variant: 'dark' | 'darker' | 'light' = 'dark') {
  return cn(
    'backdrop-blur-xl border',
    {
      'bg-gray-900/95 border-gray-700/50': variant === 'dark',
      'bg-gray-800/95 border-gray-600/50': variant === 'darker',
      'bg-white/10 border-white/20': variant === 'light',
    }
  )
}

/**
 * Hover glow effect utility for interactive elements
 * Adds shadow-based glow on hover for premium feel
 *
 * @param color - The glow color variant
 * @returns Tailwind classes for hover glow effect
 *
 * @example
 * <button className={cn('px-4 py-2', hoverGlow('blue'))}>Click me</button>
 */
export function hoverGlow(color: 'blue' | 'purple' | 'green' = 'blue') {
  return cn(
    'transition-all duration-300',
    {
      'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]': color === 'blue',
      'hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]': color === 'purple',
      'hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]': color === 'green',
    }
  )
}
