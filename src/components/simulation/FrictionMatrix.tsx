import { useState, useEffect } from 'react'
import { ModalShell } from '@/components/ui/ModalShell'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { AlertStrip } from '@/components/ui/AlertStrip'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/misc'
import { useSimulationStore } from '@/store/simulationStore'
import { useSettingsStore } from '@/store/settingsStore'
import { generateRecommendations } from '@/lib/ai'
import type { NodeSimulationResult, AIRecommendation } from '@/types'
import { cn } from '@/lib/utils'

interface FrictionMatrixProps {
  open: boolean
  onClose: () => void
}

interface NodeTableRow extends NodeSimulationResult {
  id: string
}

export function FrictionMatrix({ open, onClose }: FrictionMatrixProps) {
  const run = useSimulationStore((s) => s.currentRun)
  const cohorts = useSettingsStore((s) => s.cohorts)
  const [recs, setRecs] = useState<AIRecommendation[] | null>(null)
  const [recsLoading, setRecsLoading] = useState(false)
  const [recsUsingMock, setRecsUsingMock] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useEffect(() => {
    if (open && run && !recs) {
      setRecsLoading(true)
      setRecsUsingMock(false)
      generateRecommendations(run, cohorts)
        .then((result) => {
          setRecs(result.data)
          setRecsUsingMock(result.usingMock)
          if (typeof pendo !== 'undefined') {
            pendo.track('ai_recommendations_generated', {
              recommendation_count: result.data?.length ?? 0,
              used_mock_ai: result.usingMock,
              simulation_completion_rate: run.overallCompletionRate,
              highest_friction_score: run.highestFrictionScore,
              node_count: run.nodeResults.length,
            })
          }
        })
        .catch(() => setRecs(null))
        .finally(() => setRecsLoading(false))
    }
  }, [open, run])

  if (!run) return null

  const nodeTableRows: NodeTableRow[] = run.nodeResults.map((r) => ({ ...r, id: r.nodeId }))

  const columns: DataTableColumn<NodeTableRow>[] = [
    { key: 'nodeName', label: 'Node Name', sortable: true },
    {
      key: 'nodeType', label: 'Type', mono: true,
      render: (v) => <Badge variant="neutral">{String(v).toUpperCase()}</Badge>,
    },
    {
      key: 'avgFrictionScore', label: 'Avg Friction', sortable: true, mono: true, align: 'right',
      render: (v) => {
        const score = Number(v)
        return (
          <span className={cn('font-mono text-xs font-bold tabular-nums', score >= 70 ? 'text-signal' : score >= 40 ? 'text-caution' : 'text-success')}>
            {score}
          </span>
        )
      },
    },
    {
      key: 'status', label: 'Status', mono: true,
      render: (v) => <Badge variant={v as 'critical' | 'warning' | 'pass'}>{String(v).toUpperCase()}</Badge>,
    },
    { key: 'traversalCount', label: 'Traversals', sortable: true, mono: true, align: 'right' },
    { key: 'dropOffCount', label: 'Drop-offs', sortable: true, mono: true, align: 'right' },
  ]

  const aboveThreshold = run.criticalPath.filter((n) => n.frictionScore >= 70).length

  return (
    <ModalShell open={open} onClose={onClose} title="Friction Matrix — Simulation Report" size="full">
      <div className="p-6 flex flex-col gap-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 56px)' }}>
        {/* Top metrics */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Overall Completion', value: `${run.overallCompletionRate}%` },
            { label: 'Highest Friction', value: run.highestFrictionScore },
            { label: 'Total Events', value: run.frictionEvents.length },
            { label: 'Duration', value: `${((run.completedAt! - run.startedAt) / 1000).toFixed(1)}s` },
          ].map((m) => (
            <div key={m.label} className="bg-slate-mid border border-wire rounded-[2px] p-3">
              <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost block">{m.label}</span>
              <span className="font-mono text-2xl font-bold text-data tabular-nums">{m.value}</span>
            </div>
          ))}
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Critical Path */}
          <div className="bg-slate-mid border border-wire rounded-[2px] p-4 flex flex-col gap-3">
            <SectionHeader title="Critical Path" />
            <AlertStrip variant={aboveThreshold > 0 ? 'warning' : 'info'}>
              {aboveThreshold} of {run.criticalPath.length} nodes above friction threshold.
            </AlertStrip>
            <div className="flex flex-col gap-2">
              {run.criticalPath.map((node, i) => (
                <div key={node.nodeId} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className={cn('font-mono text-xs truncate', node.isHighest ? 'text-signal font-bold' : 'text-data')}>
                      {node.nodeName}
                    </span>
                    <span className={cn('font-mono text-xs tabular-nums ml-2 shrink-0', node.frictionScore >= 70 ? 'text-signal' : node.frictionScore >= 40 ? 'text-caution' : 'text-success')}>
                      {node.frictionScore}
                    </span>
                  </div>
                  <div className="h-[4px] bg-wire rounded-[2px] overflow-hidden">
                    <div
                      className={cn('h-full rounded-[2px]', node.isHighest ? 'bg-signal' : node.frictionScore >= 40 ? 'bg-caution' : 'bg-success')}
                      style={{ width: `${node.frictionScore}%` }}
                    />
                  </div>
                  {i < run.criticalPath.length - 1 && (
                    <div className="ml-2 w-px h-2 bg-wire" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Node Friction Breakdown */}
          <div className="bg-slate-mid border border-wire rounded-[2px] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-wire">
              <SectionHeader title="Node Friction Breakdown" />
            </div>
            <DataTable
              columns={columns}
              rows={nodeTableRows}
              selectedId={selectedNodeId ?? undefined}
              onRowClick={(row) => setSelectedNodeId(row.id === selectedNodeId ? null : row.id)}
              emptyMessage="No nodes in this flow."
            />
          </div>

          {/* Cohort Completion Rates */}
          <div className="bg-slate-mid border border-wire rounded-[2px] p-4 flex flex-col gap-3">
            <SectionHeader title="Cohort Completion Rates" />
            <div className="flex flex-col gap-4">
              {run.cohortResults.map((cr) => {
                const rate = cr.completionRate
                const barColor = rate >= 70 ? 'bg-success' : rate >= 40 ? 'bg-caution' : 'bg-signal'
                return (
                  <div key={cr.cohortId} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-xs text-data font-bold truncate">{cr.cohortName}</span>
                      <span className={cn('font-mono text-xs tabular-nums font-bold ml-2 shrink-0', rate >= 70 ? 'text-success' : rate >= 40 ? 'text-caution' : 'text-signal')}>
                        {rate}%
                      </span>
                    </div>
                    <div className="h-[6px] bg-wire rounded-[2px] overflow-hidden">
                      <div
                        className={cn('h-full rounded-[2px] transition-all duration-700', barColor)}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className="font-sans text-[10px] text-ghost">
                      {cr.dropOffNodeName ? `Drop-off: ${cr.dropOffNodeName}` : 'Completed flow'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <SectionHeader title="AI Recommendations" subtitle="Top 3 actionable changes to reduce friction" />
            {recsUsingMock && !recsLoading && recs && (
              <div className="flex items-center gap-1.5 px-2 py-1 border border-wire/50 rounded-[2px] bg-slate-mid shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-caution shrink-0" />
                <span className="font-mono text-[10px] tracking-[0.06em] text-ghost whitespace-nowrap">
                  SIMULATED DATA ENGINE: ACTIVE
                </span>
              </div>
            )}
          </div>
          {recsLoading && (
            <AlertStrip variant="info">
              <span className="font-mono text-xs">Generating recommendations via AI...</span>
            </AlertStrip>
          )}
          {!recsLoading && recs && (
            <div className="grid grid-cols-3 gap-3">
              {recs.map((rec, i) => (
                <div key={i} className="bg-signal/10 border border-signal/40 rounded-[2px] p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-signal">{i + 1}</span>
                    <span className="font-mono text-xs font-bold text-data">{rec.nodeName}</span>
                  </div>
                  <p className="font-sans text-sm text-data leading-relaxed">{rec.suggestedChange}</p>
                  <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-signal/20">
                    {rec.benefitedCohorts.map((c) => (
                      <Badge key={c} variant="neutral" className="text-[8px]">{c.split(' ').slice(-1)[0]}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!recsLoading && !recs && (
            <AlertStrip variant="info">
              <span className="font-mono text-xs">Recommendation engine initializing. Reopen this report to retry.</span>
            </AlertStrip>
          )}
        </div>
      </div>
    </ModalShell>
  )
}
