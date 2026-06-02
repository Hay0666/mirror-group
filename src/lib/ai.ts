// ============================================================
// MirrorGroup — AI Layer (Bulletproof Fallback Architecture)
//
// Call hierarchy:
//   1. Try live Groq API (requires VITE_GROQ_API_KEY)
//      - Uses llama-3.3-70b-versatile for complex reasoning
//      - JSON mode enforced via response_format: { type: "json_object" }
//   2. On any failure (no key, 429, network, parse error) →
//      fall back to mock data from ai-mocks.ts
//   3. Return { data, usingMock: boolean } so the UI can
//      surface the [SIMULATED DATA ENGINE: ACTIVE] indicator
// ============================================================

import Groq from 'groq-sdk'
import type { BehaviorProfile, AIRecommendation, CohortProfile, SimulationRun } from '@/types'
import {
  selectMockBehaviorProfile,
  selectMockRecommendations,
} from '@/lib/ai-mocks'

const API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined

// ─── Internal: Groq client (lazy, one instance) ──────────────

let _client: Groq | null = null

function getClient(): Groq {
  if (!API_KEY || API_KEY === 'your_groq_api_key_here') {
    throw new Error('NO_KEY')
  }
  if (!_client) {
    _client = new Groq({
      apiKey: API_KEY,
      // Required for browser/Vite environments
      dangerouslyAllowBrowser: true,
    })
  }
  return _client
}

// ─── Internal: Groq chat call with JSON mode ─────────────────

async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  const client = getClient() // throws NO_KEY if unconfigured

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    // Groq JSON mode — guarantees a parseable object in the response
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('EMPTY_RESPONSE')

  // With JSON mode enabled the response is already valid JSON —
  // no need to strip markdown fences, but we do it defensively.
  return content.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
}

// ─── Public result types ─────────────────────────────────────

export interface AIResult<T> {
  data: T
  usingMock: boolean
  mockReason?: string
}

// ─── Cohort behavior synthesis ───────────────────────────────

export async function synthesizeCohortBehavior(cohort: {
  name: string
  patienceIndex: number
  techLiteracy: number
  decisionConfidence: number
  behavioralQuirks?: string
}): Promise<AIResult<BehaviorProfile>> {
  // --- Attempt live API ---
  try {
    const system = `You are a UX research AI that models synthetic user behavior profiles.
You MUST respond with ONLY a valid JSON object — no prose, no markdown, no explanation.
The JSON must have exactly this shape:
{
  "abandonmentTriggers": ["string", "string"],
  "frictionSensitivity": { "screen": 0, "decision": 0, "friction": 0, "end": 0 },
  "expectedCompletionRateMin": 0,
  "expectedCompletionRateMax": 0,
  "behavioralSummary": "string"
}
Rules: All numbers 0-100. abandonmentTriggers: 2-4 items. behavioralSummary: one sentence max.`

    const user = `Generate a behavior profile for this synthetic user persona:
Name: ${cohort.name}
Patience Index: ${cohort.patienceIndex}/100
Tech Literacy: ${cohort.techLiteracy}/100
Decision Confidence: ${cohort.decisionConfidence}/100
Behavioral Quirks: ${cohort.behavioralQuirks ?? 'None specified'}`

    const raw = await callGroq(system, user)
    const profile = JSON.parse(raw) as BehaviorProfile

    return { data: profile, usingMock: false }
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'UNKNOWN'
    console.info(`[MirrorGroup AI] Cohort synthesis falling back to mock. Reason: ${reason}`)

    // --- Deterministic mock fallback ---
    const mock = selectMockBehaviorProfile({
      patienceIndex: cohort.patienceIndex,
      techLiteracy: cohort.techLiteracy,
      decisionConfidence: cohort.decisionConfidence,
    })

    const personalized: BehaviorProfile = {
      ...mock,
      behavioralSummary: mock.behavioralSummary,
    }

    return { data: personalized, usingMock: true, mockReason: reason }
  }
}

// ─── Friction Matrix recommendations ─────────────────────────

export async function generateRecommendations(
  run: SimulationRun,
  cohorts: CohortProfile[],
): Promise<AIResult<AIRecommendation[]>> {
  const topFriction = [...run.nodeResults]
    .sort((a, b) => b.avgFrictionScore - a.avgFrictionScore)
    .slice(0, 5)

  // --- Attempt live API ---
  try {
    const system = `You are a senior product designer analyzing UX simulation data.
You MUST respond with ONLY a valid JSON object containing a "recommendations" array — no prose, no markdown.
The JSON must have exactly this shape:
{
  "recommendations": [
    {
      "nodeName": "string",
      "suggestedChange": "string (one actionable sentence, second person, direct)",
      "benefitedCohorts": ["cohort name"]
    }
  ]
}
Rules: Exactly 3 items in the array. Recommendations must be specific and actionable, referencing exact node names and cohort names provided.`

    const cohortSummary = run.cohortResults.map((cr) => ({
      name: cr.cohortName,
      completionRate: cr.completionRate,
      dropOffNode: cr.dropOffNodeName,
    }))

    const user = `Simulation results:
Top friction nodes: ${JSON.stringify(topFriction.map((n) => ({ name: n.nodeName, avgFriction: n.avgFrictionScore, status: n.status })))}
Cohort completion rates: ${JSON.stringify(cohortSummary)}
Available cohort names: ${cohorts.map((c) => c.name).join(', ')}
Generate exactly 3 actionable recommendations to reduce the highest-impact friction.`

    const raw = await callGroq(system, user)
    const parsed = JSON.parse(raw) as { recommendations: AIRecommendation[] }

    // Groq JSON mode wraps array in an object when system prompt requests it
    const recs = Array.isArray(parsed)
      ? (parsed as AIRecommendation[])
      : parsed.recommendations

    return { data: recs, usingMock: false }
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'UNKNOWN'
    console.info(`[MirrorGroup AI] Recommendations falling back to mock. Reason: ${reason}`)

    // --- Deterministic mock fallback using real node names ---
    const names = {
      highest: topFriction[0]?.nodeName ?? 'Entry Screen',
      second: topFriction[1]?.nodeName ?? 'Decision Point',
      third: topFriction[2]?.nodeName ?? 'Value Delivery',
    }
    const cohortNames = cohorts.filter((c) => c.assignedToRun).map((c) => c.name)
    const recs = selectMockRecommendations(names, cohortNames)

    return { data: recs, usingMock: true, mockReason: reason }
  }
}
