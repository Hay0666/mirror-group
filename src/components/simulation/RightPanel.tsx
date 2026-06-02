import { Plus } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { CohortCard } from '@/components/cohorts/CohortCard'
import { CustomCohortModal } from '@/components/cohorts/CustomCohortModal'
import { FrictionEventLog } from '@/components/simulation/FrictionEventLog'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/misc'
import { MetricCard } from '@/components/ui/MetricCard'
import { useSimulationStore } from '@/store/simulationStore'

export function RightPanel() {
  const { cohorts, setShowCustomCohortModal } = useSettingsStore()
  const { currentRun, status } = useSimulationStore()
  const assignedCount = cohorts.filter((c) => c.assignedToRun).length

  return (
    <div
      className="flex flex-col h-full bg-slate-deep border-l border-wire"
      style={{ width: '380px', minWidth: '320px' }}
    >
      {/* ── COHORT ROSTER — takes all remaining space, scrolls internally ── */}
      <div id="cohort-roster" className="flex flex-col flex-1 overflow-y-auto min-h-0">
        {/* Sticky header */}
        <div className="px-3 py-2.5 border-b border-wire flex items-center justify-between sticky top-0 bg-slate-deep z-10">
          <SectionHeader
            title="Cohort Roster"
            subtitle={`${assignedCount} of ${cohorts.length} assigned`}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomCohortModal(true)}
            className="!text-[10px] gap-1"
          >
            <Plus size={10} />
            CUSTOM
          </Button>
        </div>

        {/* Scrollable cards */}
        <div className="px-3 py-2 flex flex-col gap-2">
          {cohorts.map((cohort) => (
            <CohortCard key={cohort.id} cohort={cohort} />
          ))}
        </div>
      </div>

      {/* ── SIMULATION METRICS — fixed, only visible post-run ── */}
      {currentRun && status === 'COMPLETE' && (
        <div className="px-3 py-2 grid grid-cols-2 gap-2 border-t border-wire flex-shrink-0">
          <MetricCard
            label="Compl. Rate"
            value={`${currentRun.overallCompletionRate}%`}
            frictionBar={currentRun.overallCompletionRate}
          />
          <MetricCard
            label="Fric. Score"
            value={currentRun.highestFrictionScore}
            frictionBar={currentRun.highestFrictionScore}
          />
        </div>
      )}

      {/* ── FRICTION EVENT LOG — fixed 40% of panel height, always scrollable ── */}
      <div className="h-[40%] flex-shrink-0 border-t border-wire overflow-y-auto">
        <FrictionEventLog />
      </div>

      <CustomCohortModal />
    </div>
  )
}
