import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { CohortProfile, CohortArchetype } from '@/types'

const DEFAULT_COHORTS: CohortProfile[] = [
  {
    id: 'cohort-impatient',
    name: 'THE IMPATIENT EXECUTIVE',
    archetype: 'IMPATIENT_EXECUTIVE',
    patienceIndex: 15,
    techLiteracy: 85,
    decisionConfidence: 90,
    assignedToRun: false,
    behaviorProfile: {
      abandonmentTriggers: [
        'More than 2 decisions before reaching value',
        'More than 3 form fields on any single screen',
        'Primary CTA not reachable within 4 nodes',
      ],
      frictionSensitivity: { screen: 70, decision: 90, friction: 100, end: 0 },
      expectedCompletionRateMin: 30,
      expectedCompletionRateMax: 60,
      behavioralSummary: 'Abandons flows that delay value delivery. Intolerant of friction at decision points.',
    },
  },
  {
    id: 'cohort-anxious',
    name: 'THE ANXIOUS FIRST-TIMER',
    archetype: 'ANXIOUS_FIRST_TIMER',
    patienceIndex: 70,
    techLiteracy: 30,
    decisionConfidence: 25,
    assignedToRun: false,
    behaviorProfile: {
      abandonmentTriggers: [
        'Any ambiguous label or instruction',
        'Error states with no recovery path',
        'Missing tooltips on complex actions',
      ],
      frictionSensitivity: { screen: 60, decision: 85, friction: 100, end: 0 },
      expectedCompletionRateMin: 20,
      expectedCompletionRateMax: 50,
      behavioralSummary: 'Reads everything, trusts nothing. High friction on ambiguity. Abandons at unrecoverable errors.',
    },
  },
  {
    id: 'cohort-power',
    name: 'THE POWER USER',
    archetype: 'POWER_USER',
    patienceIndex: 80,
    techLiteracy: 95,
    decisionConfidence: 85,
    assignedToRun: false,
    behaviorProfile: {
      abandonmentTriggers: [
        'Missing edges or dead-end nodes',
        'Circular loops with no exit',
        'Objectively broken flow structure',
      ],
      frictionSensitivity: { screen: 20, decision: 30, friction: 80, end: 0 },
      expectedCompletionRateMin: 70,
      expectedCompletionRateMax: 95,
      behavioralSummary: 'Sanity baseline. Only flags structural failures. High tolerance for complexity.',
    },
  },
  {
    id: 'cohort-lowbw',
    name: 'THE LOW-BANDWIDTH USER',
    archetype: 'LOW_BANDWIDTH',
    patienceIndex: 50,
    techLiteracy: 55,
    decisionConfidence: 60,
    assignedToRun: false,
    behaviorProfile: {
      abandonmentTriggers: [
        'More than 7 nodes between entry and value',
        'Sequential loading states',
        'Flows requiring high cognitive load',
      ],
      frictionSensitivity: { screen: 50, decision: 65, friction: 90, end: 0 },
      expectedCompletionRateMin: 40,
      expectedCompletionRateMax: 70,
      behavioralSummary: 'Penalizes long flows and sequential waits. Drops off when cognitive load accumulates.',
    },
  },
]

interface SettingsStore {
  cohorts: CohortProfile[]
  showCustomCohortModal: boolean
  expandedCohortId: string | null

  toggleCohortAssignment: (id: string) => void
  addCustomCohort: (cohort: Omit<CohortProfile, 'id' | 'archetype' | 'assignedToRun'>) => void
  updateCohort: (id: string, updates: Partial<CohortProfile>) => void
  setShowCustomCohortModal: (show: boolean) => void
  setExpandedCohortId: (id: string | null) => void
  getAssignedCohorts: () => CohortProfile[]
  reset: () => void
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  cohorts: DEFAULT_COHORTS,
  showCustomCohortModal: false,
  expandedCohortId: null,

  toggleCohortAssignment: (id) => {
    set((s) => ({
      cohorts: s.cohorts.map((c) => (c.id === id ? { ...c, assignedToRun: !c.assignedToRun } : c)),
    }))
  },

  addCustomCohort: (cohort) => {
    const newCohort: CohortProfile = {
      ...cohort,
      id: uuidv4(),
      archetype: 'CUSTOM' as CohortArchetype,
      assignedToRun: false,
    }
    set((s) => ({ cohorts: [...s.cohorts, newCohort] }))
    return newCohort
  },

  updateCohort: (id, updates) => {
    set((s) => ({
      cohorts: s.cohorts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  },

  setShowCustomCohortModal: (show) => set({ showCustomCohortModal: show }),
  setExpandedCohortId: (id) => set({ expandedCohortId: id }),

  getAssignedCohorts: () => get().cohorts.filter((c) => c.assignedToRun),

  reset: () => {
    set((s) => ({
      cohorts: s.cohorts.map((c) => ({ ...c, assignedToRun: false })),
    }))
  },
}))
