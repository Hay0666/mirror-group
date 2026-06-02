import { create } from 'zustand'

export const TUTORIAL_STEPS = [
  'ADD_SCREEN',       // 0 – click Add Screen, wait for node
  'LABEL_SCREEN',     // 1 – open edit panel, name the node
  'ADD_DECISION',     // 2 – click Add Decision, wait for node
  'LABEL_DECISION',   // 3 – open edit panel, configure decision
  'CONNECT_FLOW',     // 4 – drag edge: Screen → Decision
  'ADD_END',          // 5 – click Add End, wait for node
  'LABEL_END',        // 6 – open edit panel, configure end
  'CONNECT_END',      // 7 – drag edge: Decision YES → End
  'ASSIGN_COHORT',    // 8 – toggle any cohort on
  'RUN_SIMULATION',   // 9 – highlight Run button (free advance)
] as const

export type TutorialStep = (typeof TUTORIAL_STEPS)[number]

interface TutorialStore {
  isActive: boolean
  stepIndex: number
  /** snapshot counts taken when tutorial starts, so we detect *net-new* additions */
  baselineScreenCount: number
  baselineDecisionCount: number
  baselineEndCount: number
  baselineEdgeCount: number

  start: (screenCount: number, decisionCount: number, endCount: number, edgeCount: number) => void
  advance: () => void
  stop: () => void
}

export const useTutorialStore = create<TutorialStore>((set, get) => ({
  isActive: false,
  stepIndex: 0,
  baselineScreenCount: 0,
  baselineDecisionCount: 0,
  baselineEndCount: 0,
  baselineEdgeCount: 0,

  start: (screenCount, decisionCount, endCount, edgeCount) =>
    set({
      isActive: true,
      stepIndex: 0,
      baselineScreenCount: screenCount,
      baselineDecisionCount: decisionCount,
      baselineEndCount: endCount,
      baselineEdgeCount: edgeCount,
    }),

  advance: () => {
    const { stepIndex } = get()
    if (stepIndex >= TUTORIAL_STEPS.length - 1) {
      set({ isActive: false, stepIndex: 0 })
    } else {
      set({ stepIndex: stepIndex + 1 })
    }
  },

  stop: () => set({ isActive: false, stepIndex: 0 }),
}))
