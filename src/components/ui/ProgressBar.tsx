import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  variant?: 'friction' | 'completion' | 'neutral'
  size?: 'sm' | 'md'
  label?: string
  showValue?: boolean
  className?: string
}

export function ProgressBar({ value, variant = 'neutral', size = 'sm', label, showValue, className }: ProgressBarProps) {
  const fillColor = variant === 'friction'
    ? value > 70 ? 'bg-signal' : value > 40 ? 'bg-caution' : 'bg-success'
    : variant === 'completion'
    ? value >= 70 ? 'bg-success' : value >= 40 ? 'bg-caution' : 'bg-signal'
    : 'bg-ghost'

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost">{label}</span>}
          {showValue && <span className="font-mono text-[10px] tabular-nums text-data">{value}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-wire rounded-[2px] overflow-hidden', size === 'sm' ? 'h-[4px]' : 'h-[6px]')}>
        <div
          className={cn('h-full rounded-[2px] transition-all duration-700 ease-out', fillColor)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}
