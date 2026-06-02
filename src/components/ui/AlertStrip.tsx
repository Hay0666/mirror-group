import { cn } from '@/lib/utils'

type AlertVariant = 'critical' | 'warning' | 'info'

interface AlertStripProps {
  variant?: AlertVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<AlertVariant, string> = {
  critical: 'bg-signal text-void border-signal',
  warning: 'bg-caution/20 text-caution border-caution',
  info: 'bg-transparent text-data border-wire',
}

export function AlertStrip({ variant = 'info', children, className }: AlertStripProps) {
  return (
    <div
      className={cn(
        'w-full border px-4 py-2 font-mono text-xs tracking-wide rounded-[2px]',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}
