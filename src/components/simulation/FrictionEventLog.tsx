import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulationStore } from '@/store/simulationStore'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/misc'
import { cn } from '@/lib/utils'

const precision = [0.25, 0.46, 0.45, 0.94] as const

export function FrictionEventLog() {
  const events = useSimulationStore((s) => s.liveEvents)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-wire shrink-0">
        <SectionHeader title="Friction Event Log" subtitle={`${events.length} event${events.length !== 1 ? 's' : ''} recorded`} />
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost/30">
            No events. Run simulation to generate friction data.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence initial={false}>
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: precision }}
                className="px-3 py-2 border-b border-wire/40 flex flex-col gap-1 hover:bg-slate-light/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] tabular-nums text-ghost">
                      {String(event.step).padStart(3, '0')}
                    </span>
                    <Badge variant={event.severity}>{event.cohortName.split(' ').slice(-1)[0]}</Badge>
                  </div>
                  <span
                    className={cn(
                      'font-mono text-xs font-bold tabular-nums',
                      event.frictionScore >= 70
                        ? 'text-signal'
                        : event.frictionScore >= 40
                        ? 'text-caution'
                        : 'text-success',
                    )}
                  >
                    {event.frictionScore}
                  </span>
                </div>
                <span className="font-mono text-xs text-data">{event.nodeName}</span>
                <p className="font-sans text-[10px] text-ghost leading-snug">{event.description}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
