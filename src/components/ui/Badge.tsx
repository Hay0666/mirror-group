import { cn } from '@/lib/utils'
import type { FrictionSeverity } from '@/types'

type BadgeVariant = FrictionSeverity | 'neutral' | 'running'

const variantClasses: Record<BadgeVariant, string> = {
  critical: 'border-signal text-signal bg-signal/10',
  warning: 'border-caution text-caution bg-caution/10',
  pass: 'border-success text-success bg-success/10',
  neutral: 'border-wire text-ghost bg-slate-mid',
  running: 'border-signal text-signal bg-signal/10 animate-pulse',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block font-mono text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 border rounded-[2px]',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

// StatusPill — same as badge with a dot indicator
interface StatusPillProps {
  status: BadgeVariant
  label: string
  className?: string
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const dotColor: Record<BadgeVariant, string> = {
    critical: 'bg-signal',
    warning: 'bg-caution',
    pass: 'bg-success',
    neutral: 'bg-ghost',
    running: 'bg-signal animate-pulse',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 border rounded-[2px]',
        variantClasses[status],
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColor[status])} />
      {label}
    </span>
  )
}
