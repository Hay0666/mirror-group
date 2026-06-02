import { cn } from '@/lib/utils'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
  id?: string
}

export function ToggleSwitch({ checked, onChange, label, className, id }: ToggleSwitchProps) {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer select-none', className)}>
      <div
        role="switch"
        id={id}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-8 h-4 rounded-[2px] transition-colors duration-150 border',
          checked ? 'bg-signal border-signal' : 'bg-slate-mid border-wire',
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-3 h-3 rounded-[2px] bg-void transition-transform duration-150',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </div>
      {label && <span className="font-mono text-xs text-ghost tracking-[0.04em]">{label}</span>}
    </label>
  )
}

interface MonoLabelProps {
  children: React.ReactNode
  className?: string
  as?: 'span' | 'p' | 'div'
}

export function MonoLabel({ children, className, as: Tag = 'span' }: MonoLabelProps) {
  return (
    <Tag className={cn('font-mono text-[10px] tracking-[0.08em] uppercase text-ghost', className)}>
      {children}
    </Tag>
  )
}

interface DividerProps {
  className?: string
  label?: string
}

export function Divider({ className, label }: DividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1 h-px bg-wire" />
        <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost">{label}</span>
        <div className="flex-1 h-px bg-wire" />
      </div>
    )
  }
  return <div className={cn('h-px w-full bg-wire', className)} />
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="font-mono font-bold text-xs tracking-[0.08em] uppercase text-ghost">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-ghost/60 font-sans">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface TooltipPanelProps {
  content: string
  children: React.ReactNode
  className?: string
}

export function TooltipPanel({ content, children, className }: TooltipPanelProps) {
  return (
    <div className={cn('relative group inline-block', className)}>
      {children}
      <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 px-2 py-1 bg-slate-light border border-wire text-xs font-mono text-data rounded-[2px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
        {content}
      </div>
    </div>
  )
}
