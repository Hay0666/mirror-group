import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ToggleSwitch } from '@/components/ui/misc'
import { telemetry } from '@/lib/telemetry'
import type { CohortProfile } from '@/types'
import { cn } from '@/lib/utils'

const precision = [0.25, 0.46, 0.45, 0.94] as const

interface CohortCardProps {
  cohort: CohortProfile
}

export function CohortCard({ cohort }: CohortCardProps) {
  const { toggleCohortAssignment, setExpandedCohortId, expandedCohortId } = useSettingsStore()
  const isExpanded = expandedCohortId === cohort.id

  const handleToggle = (checked: boolean) => {
    toggleCohortAssignment(cohort.id)
    telemetry.cohortAssigned(cohort.archetype, cohort.archetype === 'CUSTOM')
    if (typeof pendo !== 'undefined') {
      pendo.track('cohort_assigned', {
        cohort_archetype: cohort.archetype,
        is_custom_cohort: cohort.archetype === 'CUSTOM',
      })
    }
  }

  return (
    <div
      className={cn(
        'bg-slate-light border rounded-[2px] transition-all',
        cohort.assignedToRun ? 'border-signal/50' : 'border-wire',
      )}
    >
      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-xs text-data truncate">{cohort.name}</span>
            <Badge variant="neutral" className="text-[8px] shrink-0">
              {cohort.archetype.replace('_', ' ')}
            </Badge>
          </div>
          {cohort.behaviorProfile?.behavioralSummary && (
            <p className="font-sans text-[10px] text-ghost leading-snug line-clamp-2">
              {cohort.behaviorProfile.behavioralSummary}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ToggleSwitch
            checked={cohort.assignedToRun}
            onChange={handleToggle}
            id={`cohort-toggle-${cohort.id}`}
          />
        </div>
      </div>

      {/* Parameters */}
      <div className="px-3 pb-2 flex flex-col gap-2">
        <ProgressBar label="Patience Index" value={cohort.patienceIndex} variant="completion" showValue />
        <ProgressBar label="Tech Literacy" value={cohort.techLiteracy} variant="completion" showValue />
        <ProgressBar label="Decision Confidence" value={cohort.decisionConfidence} variant="completion" showValue />
      </div>

      {/* Expand for behavior profile */}
      <button
        onClick={() => setExpandedCohortId(isExpanded ? null : cohort.id)}
        className="w-full px-3 py-1.5 border-t border-wire flex items-center justify-between text-ghost hover:text-data transition-colors"
      >
        <span className="font-mono text-[10px] tracking-[0.08em] uppercase">Behavior Profile</span>
        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {isExpanded && cohort.behaviorProfile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: precision }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-2 flex flex-col gap-2">
              <div>
                <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost block mb-1">
                  Abandonment Triggers
                </span>
                <ul className="flex flex-col gap-1">
                  {cohort.behaviorProfile.abandonmentTriggers.map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-signal text-[10px] mt-0.5 shrink-0">▸</span>
                      <span className="font-sans text-[10px] text-ghost">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-3">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost block">Completion</span>
                  <span className="font-mono text-xs tabular-nums text-data">
                    {cohort.behaviorProfile.expectedCompletionRateMin}–{cohort.behaviorProfile.expectedCompletionRateMax}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
