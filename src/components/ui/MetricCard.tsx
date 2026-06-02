import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  delta?: number
  unit?: string
  frictionBar?: number // 0-100, if present shows a progress bar
  className?: string
}

export function MetricCard({ label, value, delta, unit, frictionBar, className }: MetricCardProps) {
  return (
    <div className={cn('bg-slate-mid border border-wire rounded-[2px] p-3 flex flex-col gap-1.5', className)}>
      <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold text-data tabular-nums">{value}</span>
        {unit && <span className="font-mono text-xs text-ghost">{unit}</span>}
      </div>
      {delta !== undefined && (
        <span className={cn('font-mono text-xs tabular-nums', delta >= 0 ? 'text-success' : 'text-signal')}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
        </span>
      )}
      {frictionBar !== undefined && (
        <div className="h-[4px] bg-wire rounded-[2px] overflow-hidden mt-1">
          <div
            className={cn('h-full rounded-[2px] transition-all duration-500', frictionBar > 70 ? 'bg-signal' : frictionBar > 40 ? 'bg-caution' : 'bg-success')}
            style={{ width: `${frictionBar}%` }}
          />
        </div>
      )}
    </div>
  )
}
