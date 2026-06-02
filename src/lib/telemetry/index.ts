// ============================================================
// MirrorGroup — Telemetry Module
// Centralized Novus.ai SDK stub. All event dispatch goes here.
// Components NEVER call SDK directly.
// ============================================================

import type { TelemetryPayload } from '@/types'

const API_KEY = import.meta.env.VITE_NOVUS_API_KEY as string | undefined

// --- Novus.ai SDK Stub ---
// Swap this object's methods for the real SDK when available.
const NovusSDK = {
  initialized: false,

  init(apiKey: string | undefined) {
    if (!apiKey) {
      console.warn('[MirrorGroup Telemetry] VITE_NOVUS_API_KEY not set. Events will be logged to console only.')
    }
    this.initialized = true
    console.info('[MirrorGroup Telemetry] SDK initialized.', { apiKey: apiKey ? '***' : 'MISSING' })
  },

  track(payload: TelemetryPayload) {
    // Replace this with: novus.track(payload.event, payload.properties)
    console.groupCollapsed(`[Novus.ai] ${payload.event}`)
    console.table(payload.properties)
    console.groupEnd()
  },
}

// --- Initialize at import time ---
NovusSDK.init(API_KEY)

// --- Central dispatch ---
function dispatch(event: string, properties: Record<string, string | number | boolean>) {
  const payload: TelemetryPayload = {
    event,
    properties,
    timestamp: Date.now(),
  }
  NovusSDK.track(payload)
}

// --- Event taxonomy (9 events per spec) ---

export const telemetry = {
  flowNodeAdded(nodeType: string, totalNodes: number) {
    dispatch('flow_node_added', {
      node_type: nodeType,
      total_nodes_in_flow: totalNodes,
    })
  },

  flowNodeConnected(sourceType: string, targetType: string, totalEdges: number) {
    dispatch('flow_node_connected', {
      source_node_type: sourceType,
      target_node_type: targetType,
      total_edges_in_flow: totalEdges,
    })
  },

  cohortAssigned(archetype: string, isCustom: boolean) {
    dispatch('cohort_assigned', {
      cohort_archetype: archetype,
      is_custom_cohort: isCustom,
    })
  },

  simulationStarted(nodeCount: number, edgeCount: number, cohortCount: number, hasDecisionNodes: boolean) {
    dispatch('simulation_started', {
      node_count: nodeCount,
      edge_count: edgeCount,
      cohort_count: cohortCount,
      has_decision_nodes: hasDecisionNodes,
    })
  },

  simulationCompleted(
    durationMs: number,
    totalFrictionEvents: number,
    highestFrictionScore: number,
    overallCompletionRate: number,
  ) {
    dispatch('simulation_completed', {
      duration_ms: durationMs,
      total_friction_events: totalFrictionEvents,
      highest_friction_score: highestFrictionScore,
      overall_completion_rate: overallCompletionRate,
    })
  },

  frictionEventSurfaced(nodeType: string, archetype: string, frictionScore: number, severity: string) {
    dispatch('friction_event_surfaced', {
      node_type: nodeType,
      cohort_archetype: archetype,
      friction_score: frictionScore,
      friction_severity: severity,
    })
  },

  cohortCreatedCustom(patienceIndex: number, techLiteracy: number, decisionConfidence: number) {
    dispatch('cohort_created_custom', {
      patience_index: patienceIndex,
      tech_literacy: techLiteracy,
      decision_confidence: decisionConfidence,
    })
  },

  canvasCleared(nodesLost: number, edgesLost: number) {
    dispatch('canvas_cleared', {
      nodes_lost: nodesLost,
      edges_lost: edgesLost,
    })
  },

  flowExported(format: string, nodeCount: number) {
    dispatch('flow_exported', {
      format,
      node_count: nodeCount,
    })
  },
}
