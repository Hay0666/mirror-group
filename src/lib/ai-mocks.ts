// ============================================================
// MirrorGroup — AI Mock Data Library
// Deep, realistic pre-generated responses for both endpoints.
// These are NOT placeholders — they are fully-formed outputs
// that look identical to live AI responses, used as fallback.
// ============================================================

import type { BehaviorProfile, AIRecommendation } from '@/types'

// ─── Cohort Behavior Mocks ───────────────────────────────────
// Keyed by patience bracket × tech bracket for deterministic selection.
// Format: `${patienceBracket}_${techBracket}_${confidenceBracket}`

export const COHORT_BEHAVIOR_MOCKS: BehaviorProfile[] = [
  // Low patience, low tech
  {
    abandonmentTriggers: [
      'Any screen requiring more than one form field before reaching value',
      'Navigation labels that use product jargon instead of plain language',
      'Loading states that exceed 2 seconds without visual feedback',
    ],
    frictionSensitivity: { screen: 78, decision: 92, friction: 100, end: 0 },
    expectedCompletionRateMin: 12,
    expectedCompletionRateMax: 28,
    behavioralSummary:
      'Abandons immediately at complexity; requires single-action screens and plain-language labels to sustain engagement.',
  },
  // Low patience, high tech
  {
    abandonmentTriggers: [
      'Primary CTA not reachable within 3 nodes from entry',
      'Confirmation dialogs on non-destructive actions',
      'Any flow requiring re-entry of previously provided data',
    ],
    frictionSensitivity: { screen: 55, decision: 88, friction: 95, end: 0 },
    expectedCompletionRateMin: 35,
    expectedCompletionRateMax: 62,
    behavioralSummary:
      'Technically fluent but ruthlessly impatient; drops off when flows add unnecessary steps between intent and outcome.',
  },
  // Medium patience, medium tech
  {
    abandonmentTriggers: [
      'Decision nodes with more than two branching paths',
      'Error messages that do not specify a recovery action',
      'Feature gates that appear after the user has invested time in the flow',
    ],
    frictionSensitivity: { screen: 48, decision: 65, friction: 80, end: 0 },
    expectedCompletionRateMin: 45,
    expectedCompletionRateMax: 68,
    behavioralSummary:
      'Moderate tolerance for complexity; responds well to clear progress signals and abandons at unclear error recovery paths.',
  },
  // High patience, low tech
  {
    abandonmentTriggers: [
      'Screens without visible help text or contextual tooltips',
      'Icon-only buttons with no label fallback',
      'Any screen that changes layout on interaction without explanation',
    ],
    frictionSensitivity: { screen: 62, decision: 70, friction: 88, end: 0 },
    expectedCompletionRateMin: 30,
    expectedCompletionRateMax: 55,
    behavioralSummary:
      'Patient but easily disoriented by unfamiliar patterns; needs explicit labeling and confirmation at every step.',
  },
  // High patience, high tech
  {
    abandonmentTriggers: [
      'Circular loops with no visible exit path',
      'Dead-end nodes that provide no onward navigation',
      'Flows that do not surface keyboard navigation affordances',
    ],
    frictionSensitivity: { screen: 22, decision: 35, friction: 70, end: 0 },
    expectedCompletionRateMin: 72,
    expectedCompletionRateMax: 91,
    behavioralSummary:
      'High tolerance and technical fluency; generates friction only on structurally broken flows and accessibility failures.',
  },
  // Low confidence
  {
    abandonmentTriggers: [
      'Decision nodes that present irreversible choices without undo affordance',
      'Progress indicators that reset unexpectedly',
      'Any ambiguous label on a destructive or financial action',
    ],
    frictionSensitivity: { screen: 50, decision: 94, friction: 85, end: 0 },
    expectedCompletionRateMin: 18,
    expectedCompletionRateMax: 42,
    behavioralSummary:
      'Paralyzed by decision points perceived as irreversible; requires explicit undo paths and low-stakes framing to proceed.',
  },
  // Very custom / quirky
  {
    abandonmentTriggers: [
      'Any screen with more than 3 interactive elements visible at once',
      'Flows that do not confirm the user\'s previous action before advancing',
      'Missing visual hierarchy between primary and secondary actions',
    ],
    frictionSensitivity: { screen: 68, decision: 72, friction: 90, end: 0 },
    expectedCompletionRateMin: 28,
    expectedCompletionRateMax: 51,
    behavioralSummary:
      'Cognitively conservative; prefers one-thing-at-a-time flows with explicit confirmation between each step.',
  },
  // Power-user with quirks
  {
    abandonmentTriggers: [
      'Rate limits or artificial delays inserted into the critical path',
      'Paywall screens positioned before demonstrated value delivery',
    ],
    frictionSensitivity: { screen: 30, decision: 40, friction: 75, end: 0 },
    expectedCompletionRateMin: 60,
    expectedCompletionRateMax: 88,
    behavioralSummary:
      'Experienced navigator who tolerates complexity but rejects manipulation patterns and artificial friction.',
  },
]

// ─── Recommendation Mocks ────────────────────────────────────
// Pools of recommendation templates. Selected and personalized
// at call time using actual node names from the simulation run.

export interface RecommendationTemplate {
  nodeNameKey: 'highest' | 'second' | 'third'
  suggestedChangeTemplate: string
  benefitedArchetypes: string[]
}

export const RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  {
    nodeNameKey: 'highest',
    suggestedChangeTemplate:
      'Reduce the decision load at this node by pre-selecting the most common user path as the default — cohorts are dropping here because the choice feels consequential, not navigational.',
    benefitedArchetypes: ['IMPATIENT_EXECUTIVE', 'ANXIOUS_FIRST_TIMER'],
  },
  {
    nodeNameKey: 'highest',
    suggestedChangeTemplate:
      'Add an inline progress indicator before this screen so users understand how many steps remain — friction here is driven by uncertainty about flow length, not the content itself.',
    benefitedArchetypes: ['ANXIOUS_FIRST_TIMER', 'LOW_BANDWIDTH'],
  },
  {
    nodeNameKey: 'second',
    suggestedChangeTemplate:
      'Consolidate this screen with its predecessor — the two-step split is adding cognitive overhead without delivering incremental value, and impatient cohorts are abandoning between them.',
    benefitedArchetypes: ['IMPATIENT_EXECUTIVE', 'POWER_USER'],
  },
  {
    nodeNameKey: 'second',
    suggestedChangeTemplate:
      'Rewrite the primary CTA label on this screen to state the outcome, not the action — replace verb-only labels with outcome framing to reduce decision confidence friction.',
    benefitedArchetypes: ['ANXIOUS_FIRST_TIMER', 'LOW_BANDWIDTH'],
  },
  {
    nodeNameKey: 'third',
    suggestedChangeTemplate:
      'Add a recovery path from this node\'s error state — currently there is no visible way back, which causes complete abandonment from first-timer cohorts rather than a retry.',
    benefitedArchetypes: ['ANXIOUS_FIRST_TIMER', 'LOW_BANDWIDTH'],
  },
  {
    nodeNameKey: 'third',
    suggestedChangeTemplate:
      'Move value delivery earlier in the flow — this node appears too far from the entry point for low-patience cohorts to reach; consider surfacing a preview of the outcome at entry.',
    benefitedArchetypes: ['IMPATIENT_EXECUTIVE', 'LOW_BANDWIDTH'],
  },
]

// ─── Selector functions ───────────────────────────────────────

/**
 * Select a mock BehaviorProfile deterministically based on cohort parameters.
 * Uses weighted bracket matching so high/low values map to thematically appropriate mocks.
 */
export function selectMockBehaviorProfile(params: {
  patienceIndex: number
  techLiteracy: number
  decisionConfidence: number
}): BehaviorProfile {
  const { patienceIndex, techLiteracy, decisionConfidence } = params

  // Confidence-first routing
  if (decisionConfidence < 30) return COHORT_BEHAVIOR_MOCKS[5]
  // Low patience × low tech
  if (patienceIndex < 35 && techLiteracy < 40) return COHORT_BEHAVIOR_MOCKS[0]
  // Low patience × high tech
  if (patienceIndex < 35 && techLiteracy >= 70) return COHORT_BEHAVIOR_MOCKS[1]
  // High patience × low tech
  if (patienceIndex >= 65 && techLiteracy < 40) return COHORT_BEHAVIOR_MOCKS[3]
  // High patience × high tech
  if (patienceIndex >= 65 && techLiteracy >= 70) return COHORT_BEHAVIOR_MOCKS[4]
  // Power-user profile
  if (patienceIndex >= 70 && techLiteracy >= 80 && decisionConfidence >= 75) return COHORT_BEHAVIOR_MOCKS[7]
  // Quirky / cognitive
  if (decisionConfidence < 55 && techLiteracy < 60) return COHORT_BEHAVIOR_MOCKS[6]
  // Default: medium
  return COHORT_BEHAVIOR_MOCKS[2]
}

/**
 * Generate 3 mock recommendations using actual node names from the simulation run.
 * Picks from template pool and injects real node names for authenticity.
 */
export function selectMockRecommendations(
  nodeNames: { highest: string; second: string; third: string },
  cohortNames: string[],
): AIRecommendation[] {
  // Pick 3 non-duplicate templates
  const picked = [
    RECOMMENDATION_TEMPLATES[0],
    RECOMMENDATION_TEMPLATES[3],
    RECOMMENDATION_TEMPLATES[4],
  ]

  return picked.map((t) => {
    const nodeName = nodeNames[t.nodeNameKey] ?? nodeNames.highest
    // Map archetype keys to actual cohort names from the run
    const benefitedCohorts = cohortNames.filter((name) =>
      t.benefitedArchetypes.some((arch) =>
        name.toUpperCase().includes(arch.replace('_', ' ').split('_')[0]),
      ),
    )
    return {
      nodeName,
      suggestedChange: t.suggestedChangeTemplate,
      benefitedCohorts: benefitedCohorts.length > 0 ? benefitedCohorts : cohortNames.slice(0, 2),
    }
  })
}
