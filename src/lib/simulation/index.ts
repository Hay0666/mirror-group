// ============================================================
// MirrorGroup — Simulation Engine
// Pure TypeScript traversal logic. No React. No side effects.
// Deterministic: same inputs → same outputs.
// ============================================================

import { v4 as uuidv4 } from 'uuid'
import type {
  FlowNode,
  FlowEdge,
  CohortProfile,
  SimulationRun,
  FrictionEvent,
  NodeSimulationResult,
  CohortSimulationResult,
  CriticalPathNode,
  FrictionSeverity,
} from '@/types'

export interface FlowGraph {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

// Seeded pseudo-random (deterministic)
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function getSeverity(score: number): FrictionSeverity {
  if (score >= 70) return 'critical'
  if (score >= 40) return 'warning'
  return 'pass'
}

function computeScreenFriction(node: FlowNode, cohort: CohortProfile, rand: () => number): number {
  const base = (100 - cohort.patienceIndex) * 0.4 + (100 - cohort.techLiteracy) * 0.3
  const jitter = rand() * 20 - 10 // ±10
  return Math.max(0, Math.min(100, base + jitter))
}

function computeDecisionDropOff(cohort: CohortProfile, rand: () => number): boolean {
  const dropProb = (100 - cohort.decisionConfidence) / 100
  return rand() < dropProb * 0.6 // scale down so not every decision drops
}

function getEntryNode(graph: FlowGraph): FlowNode | null {
  const targetIds = new Set(graph.edges.map((e) => e.target))
  return graph.nodes.find((n) => !targetIds.has(n.id) && n.type !== 'friction') ?? null
}

function getNextNodes(graph: FlowGraph, nodeId: string, handle?: string | null): FlowNode[] {
  const outEdges = graph.edges.filter(
    (e) => e.source === nodeId && (handle == null || e.sourceHandle === handle || e.sourceHandle == null),
  )
  return outEdges
    .map((e) => graph.nodes.find((n) => n.id === e.target))
    .filter((n): n is FlowNode => n != null && n.type !== 'friction')
}

function traverseForCohort(
  graph: FlowGraph,
  cohort: CohortProfile,
  simStart: number,
): { events: FrictionEvent[]; path: string[]; completed: boolean; dropOffNodeId: string | null } {
  const seed = cohort.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const rand = seededRandom(seed)

  const events: FrictionEvent[] = []
  const path: string[] = []
  let step = 0

  let current: FlowNode | null = getEntryNode(graph)
  if (!current) return { events, path, completed: false, dropOffNodeId: null }

  const visited = new Set<string>()

  while (current && step < 50) {
    if (visited.has(current.id)) break // cycle guard
    visited.add(current.id)
    path.push(current.id)
    step++

    if (current.type === 'end') {
      return { events, path, completed: current.data.endVariant === 'success', dropOffNodeId: null }
    }

    if (current.type === 'screen') {
      const score = computeScreenFriction(current, cohort, rand)
      const severity = getSeverity(score)
      if (score > 20) {
        events.push({
          id: uuidv4(),
          step,
          cohortId: cohort.id,
          cohortName: cohort.name,
          cohortArchetype: cohort.archetype,
          nodeId: current.id,
          nodeName: current.data.label,
          nodeType: 'screen',
          frictionScore: Math.round(score),
          severity,
          description: generateFrictionDescription(current.data.label, cohort, score),
          timestamp: simStart + step * 300,
        })
      }
      const nexts = getNextNodes(graph, current.id)
      current = nexts[0] ?? null
    } else if (current.type === 'decision') {
      const dropsOff = computeDecisionDropOff(cohort, rand)
      if (dropsOff) {
        events.push({
          id: uuidv4(),
          step,
          cohortId: cohort.id,
          cohortName: cohort.name,
          cohortArchetype: cohort.archetype,
          nodeId: current.id,
          nodeName: current.data.label,
          nodeType: 'decision',
          frictionScore: 85,
          severity: 'critical',
          description: `Cohort abandoned at decision "${current.data.label}" — confidence threshold exceeded.`,
          timestamp: simStart + step * 300,
        })
        return { events, path, completed: false, dropOffNodeId: current.id }
      }
      // Take YES path preferentially
      const yesNodes = getNextNodes(graph, current.id, 'yes')
      const anyNodes = getNextNodes(graph, current.id)
      current = yesNodes[0] ?? anyNodes[0] ?? null
    } else {
      const nexts = getNextNodes(graph, current.id)
      current = nexts[0] ?? null
    }
  }

  // Ran out of nodes — check if last node was an end
  const lastNode = path.length > 0 ? graph.nodes.find((n) => n.id === path[path.length - 1]) : null
  return {
    events,
    path,
    completed: lastNode?.type === 'end' && lastNode.data.endVariant === 'success',
    dropOffNodeId: null,
  }
}

function generateFrictionDescription(nodeName: string, cohort: CohortProfile, score: number): string {
  if (cohort.archetype === 'IMPATIENT_EXECUTIVE') {
    return score > 70
      ? `"${nodeName}" delays value delivery. Executive cohort abandonment risk: HIGH.`
      : `Minor friction at "${nodeName}" — tolerable for Executive archetype.`
  }
  if (cohort.archetype === 'ANXIOUS_FIRST_TIMER') {
    return score > 70
      ? `Ambiguity at "${nodeName}" causes decision paralysis in First-Timer cohort.`
      : `Moderate hesitation at "${nodeName}" — label clarity may reduce friction.`
  }
  if (cohort.archetype === 'LOW_BANDWIDTH') {
    return score > 70
      ? `"${nodeName}" exceeds cognitive load threshold for Low-Bandwidth cohort.`
      : `Manageable load at "${nodeName}" for Low-Bandwidth archetype.`
  }
  return score > 70
    ? `High friction at "${nodeName}" — structural issue detected.`
    : `Standard friction at "${nodeName}".`
}

function findCriticalPath(graph: FlowGraph, nodeResults: NodeSimulationResult[]): CriticalPathNode[] {
  const entry = getEntryNode(graph)
  if (!entry) return []

  const path: CriticalPathNode[] = []
  const visited = new Set<string>()
  let current: FlowNode | null = entry

  while (current && !visited.has(current.id)) {
    visited.add(current.id)
    const result = nodeResults.find((r) => r.nodeId === current!.id)
    path.push({
      nodeId: current.id,
      nodeName: current.data.label,
      frictionScore: result?.avgFrictionScore ?? 0,
      isHighest: false,
    })
    const nexts = getNextNodes(graph, current.id)
    current = nexts[0] ?? null
  }

  // Mark highest
  if (path.length > 0) {
    const maxScore = Math.max(...path.map((p) => p.frictionScore))
    path.forEach((p) => {
      p.isHighest = p.frictionScore === maxScore
    })
  }

  return path
}

export async function runSimulation(
  graph: FlowGraph,
  cohorts: CohortProfile[],
  onEvent: (event: FrictionEvent) => void,
  onProgress: (pct: number) => void,
): Promise<SimulationRun> {
  const runId = uuidv4()
  const startedAt = Date.now()
  const allEvents: FrictionEvent[] = []
  const cohortResults: CohortSimulationResult[] = []

  for (let ci = 0; ci < cohorts.length; ci++) {
    const cohort = cohorts[ci]
    const { events, path, completed, dropOffNodeId } = traverseForCohort(graph, cohort, startedAt)

    for (const evt of events) {
      allEvents.push(evt)
      onEvent(evt)
      // Simulate async delay for real-time feel
      await new Promise((r) => setTimeout(r, 80))
    }

    const dropOffNode = dropOffNodeId ? graph.nodes.find((n) => n.id === dropOffNodeId) : null
    cohortResults.push({
      cohortId: cohort.id,
      cohortName: cohort.name,
      archetype: cohort.archetype,
      completionRate: completed ? 100 : Math.round((path.length / Math.max(graph.nodes.filter(n => n.type !== 'friction').length, 1)) * 60),
      dropOffNodeId,
      dropOffNodeName: dropOffNode?.data.label ?? null,
      frictionEvents: events,
      pathTaken: path,
    })

    onProgress(Math.round(((ci + 1) / cohorts.length) * 100))
  }

  // Aggregate node results
  const nodeResults: NodeSimulationResult[] = graph.nodes
    .filter((n) => n.type !== 'friction')
    .map((node) => {
      const cohortScores: Record<string, number> = {}
      let totalScore = 0
      let count = 0

      for (const cr of cohortResults) {
        const evt = cr.frictionEvents.find((e) => e.nodeId === node.id)
        const score = evt?.frictionScore ?? 0
        cohortScores[cr.cohortId] = score
        totalScore += score
        count++
      }

      const avg = count > 0 ? Math.round(totalScore / count) : 0
      const scores = Object.entries(cohortScores)
      const worstEntry = scores.sort((a, b) => b[1] - a[1])[0]
      const bestEntry = scores.sort((a, b) => a[1] - b[1])[0]

      return {
        nodeId: node.id,
        nodeName: node.data.label,
        nodeType: node.type,
        avgFrictionScore: avg,
        cohortScores,
        worstCohortId: worstEntry?.[0] ?? '',
        bestCohortId: bestEntry?.[0] ?? '',
        traversalCount: cohortResults.filter((cr) => cr.pathTaken.includes(node.id)).length,
        dropOffCount: cohortResults.filter((cr) => cr.dropOffNodeId === node.id).length,
        status: getSeverity(avg),
      }
    })

  const criticalPath = findCriticalPath(graph, nodeResults)
  const overallCompletion =
    cohortResults.length > 0
      ? Math.round(cohortResults.reduce((s, r) => s + r.completionRate, 0) / cohortResults.length)
      : 0
  const highestFriction = allEvents.length > 0 ? Math.max(...allEvents.map((e) => e.frictionScore)) : 0

  return {
    id: runId,
    startedAt,
    completedAt: Date.now(),
    status: 'COMPLETE',
    cohortIds: cohorts.map((c) => c.id),
    nodeResults,
    cohortResults,
    frictionEvents: allEvents,
    criticalPath,
    overallCompletionRate: overallCompletion,
    highestFrictionScore: highestFriction,
  }
}
