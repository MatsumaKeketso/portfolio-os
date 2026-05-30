import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

type IconComponent = React.ComponentType<{ className?: string }>

const controlBase =
  'os-focus-ring flex h-10 items-center rounded-xl border border-os-line-dark bg-os-ink-900 text-sm text-os-text-inverse transition-colors focus-within:border-stroke-brand'

const controlIconClass = 'pointer-events-none h-4 w-4 shrink-0 text-os-text-inverse/35'
const controlInputClass =
  'min-w-0 flex-1 bg-transparent text-sm text-os-text-inverse outline-none placeholder:text-os-text-inverse/30'

export interface ControlInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: IconComponent
  containerClassName?: string
}

export const ControlInput = React.forwardRef<HTMLInputElement, ControlInputProps>(
  ({ icon: Icon, className, containerClassName, ...props }, ref) => (
    <div className={cn(controlBase, 'gap-2 px-3', containerClassName)}>
      {Icon && <Icon className={controlIconClass} />}
      <input ref={ref} className={cn(controlInputClass, className)} {...props} />
    </div>
  )
)
ControlInput.displayName = 'ControlInput'

export interface ControlSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  icon?: IconComponent
  containerClassName?: string
}

export const ControlSelect = React.forwardRef<HTMLSelectElement, ControlSelectProps>(
  ({ icon: Icon, className, containerClassName, children, ...props }, ref) => (
    <div className={cn(controlBase, 'relative', containerClassName)}>
      {Icon && (
        <Icon className={cn(controlIconClass, 'absolute left-3 top-1/2 -translate-y-1/2')} />
      )}
      <select
        ref={ref}
        className={cn(
          'h-full w-full appearance-none rounded-xl bg-transparent py-0 pl-9 pr-9 text-sm text-os-text-inverse outline-none',
          !Icon && 'pl-3',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className={cn(controlIconClass, 'absolute right-3 top-1/2 -translate-y-1/2')} />
    </div>
  )
)
ControlSelect.displayName = 'ControlSelect'

export interface AnchoredPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'right'
}

export const anchoredPanelClass =
  'absolute top-[calc(100%+10px)] z-40 w-[min(520px,calc(100vw-48px))]'

export const AnchoredPanel = React.forwardRef<HTMLDivElement, AnchoredPanelProps>(
  ({ align = 'right', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        anchoredPanelClass,
        align === 'right' ? 'right-0' : 'left-0',
        className
      )}
      {...props}
    />
  )
)
AnchoredPanel.displayName = 'AnchoredPanel'
