import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'system'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  loadingText?: string
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-signal text-void hover:bg-orange-500 border border-signal disabled:opacity-40 disabled:cursor-not-allowed',
  ghost: 'bg-transparent text-signal border border-signal hover:bg-signal hover:text-void disabled:opacity-40 disabled:cursor-not-allowed',
  system: 'bg-slate-light text-data border border-wire hover:border-ghost disabled:opacity-40 disabled:cursor-not-allowed',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, loadingText, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-mono font-semibold transition-colors duration-150 rounded-[2px] tracking-wide select-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (loadingText ?? '[ — ]') : children}
      </button>
    )
  },
)
Button.displayName = 'Button'
