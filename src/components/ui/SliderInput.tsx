import { cn } from '@/lib/utils'

interface SliderInputProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  className?: string
  description?: string
}

export function SliderInput({ label, value, min = 0, max = 100, step = 1, onChange, className, description }: SliderInputProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs tracking-[0.08em] uppercase text-ghost">{label}</span>
        <span className="font-mono text-sm tabular-nums text-data font-semibold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[4px] bg-wire rounded-[2px] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-[2px] [&::-webkit-slider-thumb]:bg-signal [&::-webkit-slider-thumb]:cursor-pointer"
        style={{
          background: `linear-gradient(to right, #FF6B2B ${value}%, #3A424F ${value}%)`,
        }}
      />
      {description && <p className="text-xs text-ghost">{description}</p>}
    </div>
  )
}
