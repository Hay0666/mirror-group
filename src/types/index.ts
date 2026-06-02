// ============================================================
// MirrorGroup — Core Type Definitions
// All shared TypeScript interfaces for the entire application
// ============================================================

// --- Node & Edge Types ---

export type NodeType = 'screen' | 'decision' | 'friction' | 'end'
export type ScreenCategory = 'Onboarding' | 'Feature' | 'Paywall' | 'Error' | 'Success'
export type EndVariant = 'success' | 'drop-off'
export type FrictionSeverity = 'critical' | 'warning' | 'pass'

export interface FlowNodeData {
  label: string
  description?: string
  expectedAction?: string
  // ScreenNode
  screenCategory?: ScreenCategory
  // DecisionNode
  yesLabel?: string
  noLabel?: string
  // FrictionNode
  frictionScore?: number
  frictionSeverity?: FrictionSeverity
  parentNodeId?: string
  // EndNode
  endVariant?: EndVariant
  // Post-simulation overlays
  simulatedFrictionScore?: number
  traversalCount?: number
}

export interface FlowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: FlowNodeData
  selected?: boolean
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  label?: string
  // Post-simulation
  traversalPercentage?: number
  animated?: boolean
}

// --- Cohort Types ---

export type CohortArchetype =
  | 'IMPATIENT_EXECUTIVE'
  | 'ANXIOUS_FIRST_TIMER'
  | 'POWER_USER'
  | 'LOW_BANDWIDTH'
  | 'CUSTOM'

export interface BehaviorProfile {
  abandonmentTriggers: string[]
  frictionSensitivity: Record<NodeType, number> // 0-100
  expectedCompletionRateMin: number // 0-100
  expectedCompletionRateMax: number // 0-100
  behavioralSummary: string
}

export interface CohortProfile {
  id: string
  name: string
  archetype: CohortArchetype
  patienceIndex: number      // 0-100
  techLiteracy: number       // 0-100
  decisionConfidence: number // 0-100
  behavioralQuirks?: string
  behaviorProfile?: BehaviorProfile
  assignedToRun: boolean
}

// --- Simulation Types ---

export type SimulationStatus = 'IDLE' | 'CONFIGURING' | 'RUNNING' | 'COMPLETE'

export interface FrictionEvent {
  id: string
  step: number           // simulation step (not wall-clock)
  cohortId: string
  cohortName: string
  cohortArchetype: CohortArchetype
  nodeId: string
  nodeName: string
  nodeType: NodeType
  frictionScore: number  // 0-100
  severity: FrictionSeverity
  description: string
  timestamp: number      // ms since sim start
}

export interface NodeSimulationResult {
  nodeId: string
  nodeName: string
  nodeType: NodeType
  avgFrictionScore: number
  cohortScores: Record<string, number>  // cohortId -> score
  worstCohortId: string
  bestCohortId: string
  traversalCount: number
  dropOffCount: number
  status: FrictionSeverity
}

export interface CohortSimulationResult {
  cohortId: string
  cohortName: string
  archetype: CohortArchetype
  completionRate: number    // 0-100
  dropOffNodeId: string | null
  dropOffNodeName: string | null
  frictionEvents: FrictionEvent[]
  pathTaken: string[]       // ordered node ids
}

export interface CriticalPathNode {
  nodeId: string
  nodeName: string
  frictionScore: number
  isHighest: boolean
}

export interface SimulationRun {
  id: string
  startedAt: number
  completedAt?: number
  status: SimulationStatus
  cohortIds: string[]
  nodeResults: NodeSimulationResult[]
  cohortResults: CohortSimulationResult[]
  frictionEvents: FrictionEvent[]
  criticalPath: CriticalPathNode[]
  overallCompletionRate: number
  highestFrictionScore: number
  recommendations?: AIRecommendation[]
}

// --- AI Types ---

export interface AIRecommendation {
  nodeName: string
  suggestedChange: string
  benefitedCohorts: string[]
}

// --- Telemetry Types ---

export interface TelemetryPayload {
  event: string
  properties: Record<string, string | number | boolean>
  timestamp: number
}
