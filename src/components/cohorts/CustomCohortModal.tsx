import { useState } from 'react'
import { ModalShell } from '@/components/ui/ModalShell'
import { SliderInput } from '@/components/ui/SliderInput'
import { Button } from '@/components/ui/Button'
import { AlertStrip } from '@/components/ui/AlertStrip'
import { useSettingsStore } from '@/store/settingsStore'
import { synthesizeCohortBehavior } from '@/lib/ai'
import { telemetry } from '@/lib/telemetry'

export function CustomCohortModal() {
  const { showCustomCohortModal, setShowCustomCohortModal, addCustomCohort } = useSettingsStore()
  const [name, setName] = useState('')
  const [patience, setPatience] = useState(50)
  const [techLiteracy, setTechLiteracy] = useState(50)
  const [confidence, setConfidence] = useState(50)
  const [quirks, setQuirks] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingMock, setUsingMock] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    setUsingMock(false)
    try {
      // synthesizeCohortBehavior always resolves — falls back to mock on any failure
      const result = await synthesizeCohortBehavior({
        name,
        patienceIndex: patience,
        techLiteracy,
        decisionConfidence: confidence,
        behavioralQuirks: quirks,
      })

      if (result.usingMock) setUsingMock(true)

      addCustomCohort({
        name,
        patienceIndex: patience,
        techLiteracy,
        decisionConfidence: confidence,
        behavioralQuirks: quirks,
        behaviorProfile: result.data,
      })

      telemetry.cohortCreatedCustom(patience, techLiteracy, confidence)
      setShowCustomCohortModal(false)
      setName('')
      setPatience(50)
      setTechLiteracy(50)
      setConfidence(50)
      setQuirks('')
      setUsingMock(false)
    } catch (err) {
      setError('Cohort creation failed unexpectedly. Check console.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell
      open={showCustomCohortModal}
      onClose={() => setShowCustomCohortModal(false)}
      title="Custom Cohort Builder"
      size="md"
    >
      <div className="p-6 flex flex-col gap-5">
        <div>
          <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost block mb-1.5">
            Cohort Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. THE SKEPTICAL TEENAGER"
            className="w-full bg-void border border-wire text-data font-mono text-xs px-3 py-2 rounded-[2px] focus:border-ghost outline-none placeholder:text-ghost/40"
          />
        </div>

        <SliderInput
          label="Patience Index"
          value={patience}
          onChange={setPatience}
          description="How long this cohort tolerates delays before abandoning."
        />
        <SliderInput
          label="Tech Literacy"
          value={techLiteracy}
          onChange={setTechLiteracy}
          description="Comfort level with digital interfaces and novel UI patterns."
        />
        <SliderInput
          label="Decision Confidence"
          value={confidence}
          onChange={setConfidence}
          description="Willingness to commit to choices without second-guessing."
        />

        <div>
          <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost block mb-1.5">
            Behavioral Quirks
          </label>
          <textarea
            value={quirks}
            onChange={(e) => setQuirks(e.target.value)}
            placeholder="Describe edge behaviors in natural language. Example: Abandons if any screen has more than 2 CTAs. Always reads error messages before retrying."
            rows={3}
            className="w-full bg-void border border-wire text-data font-sans text-xs px-3 py-2 rounded-[2px] focus:border-ghost outline-none resize-none placeholder:text-ghost/40 leading-relaxed"
          />
          <p className="font-mono text-[10px] text-ghost/50 mt-1">
            This description is processed by AI to synthesize the cohort's friction logic.
          </p>
        </div>

        {usingMock && (
          <div className="flex items-center gap-2 px-2 py-1.5 border border-wire/50 rounded-[2px] bg-slate-mid">
            <span className="w-1.5 h-1.5 rounded-full bg-caution shrink-0" />
            <span className="font-mono text-[10px] tracking-[0.06em] text-ghost">
              SIMULATED DATA ENGINE: ACTIVE
            </span>
          </div>
        )}
        {error && <AlertStrip variant="critical">{error}</AlertStrip>}

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => setShowCustomCohortModal(false)}
            className="flex-1"
          >
            CANCEL
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!name.trim()}
            loading={loading}
            loadingText="[ SYNTHESIZING... ]"
            className="flex-1"
          >
            CREATE COHORT
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}
