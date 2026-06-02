import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulationStore } from '@/store/simulationStore'
import { useFlowStore } from '@/store/flowStore'
import { useSettingsStore } from '@/store/settingsStore'
import { Button } from '@/components/ui/Button'
import { StatusPill } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { GuidedTutorial } from '@/components/ui/GuidedTutorial'
import { runSimulation } from '@/lib/simulation'
import { telemetry } from '@/lib/telemetry'
import { v4 as uuidv4 } from 'uuid'
import type { FlowNode, FlowEdge } from '@/types'

const precision = [0.25, 0.46, 0.45, 0.94] as const
const SPINNER_FRAMES = ['[ — ]', '[ \\ ]', '[ | ]', '[ / ]']

export function SimulationHeader() {
  const { status, setStatus, setCurrentRun, addLiveEvent, setProgress, progress, currentRun, setShowFrictionMatrix } = useSimulationStore()
  const { nodes, edges, updateNodesPostSim, updateEdgesPostSim } = useFlowStore()
  const { getAssignedCohorts } = useSettingsStore()

  const [spinnerIdx, setSpinnerIdx] = useState(0)
  const [completeFlash, setCompleteFlash] = useState(false)
  const spinnerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const assignedCohorts = getAssignedCohorts()
  const connectedNodes = nodes.filter((n) => n.type !== 'friction')
  const edgeCount = edges.length
  const canRun = assignedCohorts.length > 0 && connectedNodes.length >= 3 && status === 'IDLE' || status === 'COMPLETE' || status === 'CONFIGURING'

  // ASCII Spinner
  useEffect(() => {
    if (status === 'RUNNING') {
      spinnerRef.current = setInterval(() => {
        setSpinnerIdx((i) => (i + 1) % SPINNER_FRAMES.length)
      }, 150)
    } else {
      if (spinnerRef.current) clearInterval(spinnerRef.current)
    }
    return () => { if (spinnerRef.current) clearInterval(spinnerRef.current) }
  }, [status])

  const handleRun = async () => {
    if (status === 'RUNNING') return
    const cohorts = getAssignedCohorts()
    if (cohorts.length === 0) return

    const hasDecisions = nodes.some((n) => n.type === 'decision')
    telemetry.simulationStarted(connectedNodes.length, edgeCount, cohorts.length, hasDecisions)

    setStatus('RUNNING')
    setProgress(0)
    // Remove old friction nodes
    const cleanNodes = nodes.filter((n) => n.type !== 'friction')
    const cleanEdges = edges.filter((e) => !e.id.startsWith('friction-'))

    const graph = { nodes: cleanNodes, edges: cleanEdges }

    try {
      const result = await runSimulation(
        graph,
        cohorts,
        (event) => {
          addLiveEvent(event)
          telemetry.frictionEventSurfaced(event.nodeType, event.cohortArchetype, event.frictionScore, event.severity)
        },
        setProgress,
      )

      // Apply post-simulation overlays
      updateNodesPostSim(
        result.nodeResults.map((nr) => ({
          id: nr.nodeId,
          simulatedFrictionScore: nr.avgFrictionScore,
        })),
      )

      // Add friction nodes for high-score screens
      const frictionNodeAdditions: FlowNode[] = result.nodeResults
        .filter((nr) => nr.avgFrictionScore > 80 && nr.nodeType === 'screen')
        .map((nr) => {
          const parentNode = cleanNodes.find((n) => n.id === nr.nodeId)
          return {
            id: `friction-${nr.nodeId}`,
            type: 'friction' as const,
            position: {
              x: (parentNode?.position.x ?? 0) + 20,
              y: (parentNode?.position.y ?? 0) + 90,
            },
            data: {
              label: `${nr.nodeName} — Friction`,
              frictionScore: nr.avgFrictionScore,
              frictionSeverity: nr.status,
              parentNodeId: nr.nodeId,
            },
          }
        })

      // Update edges with traversal percentages
      const totalCohorts = cohorts.length
      updateEdgesPostSim(
        edges.map((edge) => {
          const traversals = result.cohortResults.filter((cr) =>
            cr.pathTaken.includes(edge.source) && cr.pathTaken.includes(edge.target),
          ).length
          return { id: edge.id, traversalPercentage: Math.round((traversals / totalCohorts) * 100) }
        }),
      )

      const { setNodes: setFlowNodes } = useFlowStore.getState()
      setFlowNodes([...cleanNodes, ...frictionNodeAdditions])

      setCurrentRun(result)
      setStatus('COMPLETE')
      setCompleteFlash(true)

      telemetry.simulationCompleted(
        result.completedAt! - result.startedAt,
        result.frictionEvents.length,
        result.highestFrictionScore,
        result.overallCompletionRate,
      )

      setTimeout(() => setCompleteFlash(false), 1500)
    } catch (err) {
      console.error('[Simulation Error]', err)
      setStatus('IDLE')
    }
  }

  const statusVariant =
    status === 'RUNNING' ? 'running' :
    status === 'COMPLETE' ? 'pass' :
    status === 'CONFIGURING' ? 'warning' : 'neutral'

  const statusLabel =
    status === 'IDLE' ? (assignedCohorts.length === 0 ? 'AWAITING COHORT' : 'READY') :
    status === 'CONFIGURING' ? 'CONFIGURING' :
    status === 'RUNNING' ? 'RUNNING' : 'COMPLETE'

  return (
    <div className="h-14 bg-slate-mid border-b border-wire flex items-center justify-between px-4 gap-4 shrink-0 z-30 relative">
      {/* Wordmark + Tutorial CTA */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono font-bold text-base text-data tracking-wide">
          MIRROR<span className="text-signal">GROUP</span>
        </span>
        <div className="h-4 w-px bg-wire" />
        <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost">
          Synthetic Beta Simulator
        </span>
        <div className="h-4 w-px bg-wire" />
        <GuidedTutorial />
      </div>

      {/* Center status */}
      <div className="flex flex-col items-center gap-1 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: precision }}
          >
            <StatusPill status={statusVariant} label={statusLabel} />
          </motion.div>
        </AnimatePresence>
        {status === 'RUNNING' && (
          <ProgressBar value={progress} variant="completion" className="w-48" />
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 shrink-0">
        {status === 'COMPLETE' && currentRun && (
          <Button variant="ghost" size="sm" onClick={() => setShowFrictionMatrix(true)}>
            VIEW FULL REPORT
          </Button>
        )}

        <Button
          id="run-simulation-btn"
          variant="primary"
          size="md"
          disabled={assignedCohorts.length === 0 || connectedNodes.length < 3 || status === 'RUNNING'}
          onClick={handleRun}
          className={completeFlash ? '!bg-success !border-success' : ''}
        >
          {status === 'RUNNING'
            ? SPINNER_FRAMES[spinnerIdx]
            : status === 'COMPLETE' && completeFlash
            ? 'COMPLETE'
            : 'RUN SIMULATION'}
        </Button>
      </div>
    </div>
  )
}
