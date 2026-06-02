/**
 * GuidedTutorial — interactive, action-gated onboarding
 *
 * Architecture:
 * - driver.js handles spotlight overlay / popover rendering
 * - tutorialStore owns the step index and active flag
 * - useEffect subscriptions to flowStore / settingsStore detect
 *   when the user completes each action and call advance()
 * - The driver.js "Next" button is disabled per step; the store
 *   advance() triggers driverObj.moveNext() programmatically
 */

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { driver, type Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useFlowStore } from '@/store/flowStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useTutorialStore, TUTORIAL_STEPS } from '@/store/tutorialStore'

// ── Brutalist driver.js CSS overrides (injected once) ─────────────────────────
const DRIVER_STYLE = `
  .driver-overlay { background: rgba(10,12,15,0.85) !important; }

  .driver-active-element,
  .driver-active-element:focus {
    outline: 2px solid var(--color-signal) !important;
    outline-offset: 4px !important;
    box-shadow: 0 0 0 6px rgba(255,107,43,0.15) !important;
    border-radius: 0 !important;
  }

  .driver-popover {
    background: var(--color-slate-deep) !important;
    border: 1px solid var(--color-signal) !important;
    border-radius: 0 !important;
    box-shadow: 4px 4px 0 var(--color-signal-dim) !important;
    padding: 0 !important;
    max-width: 340px !important;
    font-family: 'JetBrains Mono', monospace !important;
    overflow: hidden !important;
  }

  .driver-popover-arrow { display: none !important; }

  /* custom inner layout via description HTML */
  .driver-popover-title {
    display: none !important;
  }

  .driver-popover-description {
    color: var(--color-data) !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 11px !important;
    line-height: 1.7 !important;
    letter-spacing: 0.03em !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .driver-popover-footer {
    margin: 0 !important;
    padding: 10px 16px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    border-top: 1px solid var(--color-wire) !important;
    background: var(--color-slate-mid) !important;
  }

  .driver-popover-prev-btn,
  .driver-popover-next-btn,
  .driver-popover-close-btn {
    background: transparent !important;
    border: none !important;
    color: var(--color-ghost) !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
    cursor: pointer !important;
    padding: 4px 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    transition: color 0.15s !important;
  }
  .driver-popover-prev-btn:hover { color: var(--color-data) !important; }
  .driver-popover-next-btn:hover { color: var(--color-signal) !important; }

  .driver-popover-next-btn[disabled],
  .driver-popover-next-btn.locked {
    color: var(--color-wire) !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
  }

  .driver-popover-close-btn {
    position: absolute !important;
    top: 10px !important;
    right: 12px !important;
    font-size: 13px !important;
  }
  .driver-popover-close-btn:hover { color: var(--color-signal) !important; }

  .driver-popover-progress-tab {
    background: var(--color-wire) !important;
    border-radius: 0 !important;
    width: 16px !important;
    height: 2px !important;
  }
  .driver-popover-progress-tab.active {
    background: var(--color-signal) !important;
  }

  .driver-popover-navigation-btns {
    display: flex !important;
    gap: 20px !important;
    align-items: center !important;
  }

  /* ── Popover body HTML structure ── */
  .mg-popover {
    padding: 16px;
  }
  .mg-step-tag {
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--color-signal);
    text-transform: uppercase;
    margin-bottom: 6px;
    display: block;
  }
  .mg-popover-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-data);
    margin-bottom: 10px;
  }
  .mg-popover-body {
    font-size: 11px;
    color: var(--color-ghost);
    line-height: 1.7;
    margin-bottom: 10px;
  }
  .mg-action-prompt {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px dashed var(--color-signal);
    background: rgba(255,107,43,0.05);
    margin-top: 8px;
  }
  .mg-action-prompt-icon {
    color: var(--color-signal);
    font-size: 13px;
    flex-shrink: 0;
  }
  .mg-action-prompt-text {
    font-size: 10px;
    color: var(--color-signal);
    letter-spacing: 0.05em;
    line-height: 1.5;
  }
  .mg-action-done {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--color-success);
    background: rgba(34,197,94,0.08);
    margin-top: 8px;
  }
  .mg-action-done-text {
    font-size: 10px;
    color: var(--color-success);
    letter-spacing: 0.05em;
  }
`

// ── Step descriptor ────────────────────────────────────────────────────────────
type StepDef = {
  element: string
  side: 'top' | 'bottom' | 'left' | 'right'
  align: 'start' | 'center' | 'end'
  html: (done: boolean) => string
  /** Returns true when the action has been completed */
  condition: (snap: StoreSnapshot) => boolean
  /** If true, next btn is always unlocked (final informational step) */
  freeAdvance?: boolean
}

type StoreSnapshot = {
  screenCount: number
  decisionCount: number
  endCount: number
  edgeCount: number
  assignedCohortCount: number
  screenNodeLabel: string
  decisionNodeLabel: string
  endNodeLabel: string
  /** Checks if there's an edge connecting any decision node to any end node */
  hasDecisionToEndEdge: boolean
  baselineScreenCount: number
  baselineDecisionCount: number
  baselineEndCount: number
  baselineEdgeCount: number
}

const STEPS: StepDef[] = [
  // ── Step 0: Add Screen Node ────────────────────────────────────────────────
  {
    element: '#toolbar-add-screen',
    side: 'right',
    align: 'center',
    condition: (snap) =>
      snap.screenCount > snap.baselineScreenCount,
    html: (done) => `
      <div class="mg-popover">
        <span class="mg-step-tag">01 / 10 — THE DRAFTING TABLE</span>
        <div class="mg-popover-title">Add a Screen Node</div>
        <div class="mg-popover-body">
          Every user journey starts with a screen. This tool drops a
          <strong style="color:var(--color-data)">Screen Node</strong> onto the canvas —
          representing one UI state your user will encounter.
        </div>
        ${done
          ? `<div class="mg-action-done"><span class="mg-action-done-text">✓ SCREEN NODE PLACED — click Next to continue</span></div>`
          : `<div class="mg-action-prompt">
               <span class="mg-action-prompt-icon">▸</span>
               <span class="mg-action-prompt-text">CLICK "ADD SCREEN" BUTTON TO PLACE A NODE</span>
             </div>`
        }
      </div>`,
  },

  // ── Step 1: Label the Screen ──────────────────────────────────────────────
  {
    element: '#node-edit-panel',
    side: 'left',
    align: 'center',
    condition: (snap) =>
      snap.screenNodeLabel.trim().length > 0 &&
      snap.screenNodeLabel !== 'New Screen',
    html: (done) => `
      <div class="mg-popover">
        <span class="mg-step-tag">02 / 10 — NODE CONFIGURATION</span>
        <div class="mg-popover-title">Name Your Screen</div>
        <div class="mg-popover-body">
          Give your screen a meaningful name and configuration:<br><br>
          <strong style="color:var(--color-signal)">NAME:</strong> Type "Premium Paywall"<br>
          <strong style="color:var(--color-signal)">DESCRIPTION:</strong> Type "A modal asking the user to upgrade to the $15/month Pro Plan."<br>
          <strong style="color:var(--color-signal)">CATEGORY:</strong> Select "Paywall" from the dropdown.<br>
          <strong style="color:var(--color-signal)">EXPECTED ACTION:</strong> Type "Clicks the Upgrade button"
        </div>
        ${done
          ? `<div class="mg-action-done"><span class="mg-action-done-text">✓ NODE NAMED — click Next to continue</span></div>`
          : `<div class="mg-action-prompt">
               <span class="mg-action-prompt-icon">▸</span>
               <span class="mg-action-prompt-text">TYPE A NAME INTO THE "NAME" FIELD ABOVE</span>
             </div>`
        }
      </div>`,
  },

  // ── Step 2: Add Decision Node ───────────────────────────────────────────────
  {
    element: '#toolbar-add-decision',
    side: 'right',
    align: 'center',
    condition: (snap) =>
      snap.decisionCount > snap.baselineDecisionCount,
    html: (done) => `
      <div class="mg-popover">
        <span class="mg-step-tag">03 / 10 — BRANCHING LOGIC</span>
        <div class="mg-popover-title">Add a Decision Point</div>
        <div class="mg-popover-body">
          Decision nodes fork the journey into
          <strong style="color:var(--color-success)">YES</strong> /
          <strong style="color:var(--color-signal)">NO</strong> paths. Drop a node to continue.
        </div>
        ${done
          ? `<div class="mg-action-done"><span class="mg-action-done-text">✓ DECISION NODE PLACED — click Next to continue</span></div>`
          : `<div class="mg-action-prompt">
               <span class="mg-action-prompt-icon">▸</span>
               <span class="mg-action-prompt-text">CLICK "ADD DECISION" BUTTON TO PLACE THE NODE</span>
             </div>`
        }
      </div>`,
  },

  // ── Step 3: Label the Decision ────────────────────────────────────────────
  {
    element: '#node-edit-panel',
    side: 'left',
    align: 'center',
    condition: (snap) =>
      snap.decisionNodeLabel.trim().length > 0 &&
      snap.decisionNodeLabel !== 'New Decision',
    html: (done) => `
      <div class="mg-popover">
        <span class="mg-step-tag">04 / 10 — DECISION CONFIGURATION</span>
        <div class="mg-popover-title">Configure Decision</div>
        <div class="mg-popover-body">
          Configure the decision paths for your synthetic users:<br><br>
          <strong style="color:var(--color-signal)">NAME:</strong> Type "3D-Secure Checkout"<br>
          <strong style="color:var(--color-signal)">DESCRIPTION:</strong> Type "Bank authentication window prompting for a credit card verification code."<br>
          <strong style="color:var(--color-signal)">YES LABEL:</strong> Type "CONFIRM"<br>
          <strong style="color:var(--color-signal)">NO LABEL:</strong> Type "DECLINE"
        </div>
        ${done
          ? `<div class="mg-action-done"><span class="mg-action-done-text">✓ DECISION CONFIGURED — click Next to continue</span></div>`
          : `<div class="mg-action-prompt">
               <span class="mg-action-prompt-icon">▸</span>
               <span class="mg-action-prompt-text">CONFIGURE THE DECISION NODE ABOVE</span>
             </div>`
        }
      </div>`,
  },

  // ── Step 4: Connect Screen → Decision ───────────────────────────────────────────
  {
    element: '#flow-canvas',
    side: 'left',
    align: 'center',
    condition: (snap) => snap.edgeCount > snap.baselineEdgeCount,
    html: (done) => `
      <div class="mg-popover">
        <span class="mg-step-tag">05 / 10 — WIRE THE LOGIC</span>
        <div class="mg-popover-title">Connect the Flow</div>
        <div class="mg-popover-body">
          Hover over the <strong style="color:var(--color-data)">Screen</strong> node's
          right edge until you see the <strong style="color:var(--color-signal)">⊕ handle</strong>,
          then drag it to the <strong style="color:var(--color-data)">Decision</strong> node.
        </div>
        ${done
          ? `<div class="mg-action-done"><span class="mg-action-done-text">✓ NODES CONNECTED — click Next to continue</span></div>`
          : `<div class="mg-action-prompt">
               <span class="mg-action-prompt-icon">▸</span>
               <span class="mg-action-prompt-text">DRAG A WIRE: SCREEN NODE → DECISION NODE</span>
             </div>`
        }
      </div>`,
  },

  // ── Step 5: Add End Node ────────────────────────────────────────────────────
  {
    element: '#toolbar-add-end',
    side: 'right',
    align: 'center',
    condition: (snap) => snap.endCount > snap.baselineEndCount,
    html: (done) => `
      <div class="mg-popover">
        <span class="mg-step-tag">06 / 10 — TERMINAL STATE</span>
        <div class="mg-popover-title">Add an End Node</div>
        <div class="mg-popover-body">
          The simulation engine requires at least one terminal node to exit.
          Drop an <strong style="color:var(--color-success)">End Node</strong> onto the canvas.
        </div>
        ${done
          ? `<div class="mg-action-done"><span class="mg-action-done-text">✓ END NODE PLACED — click Next to continue</span></div>`
          : `<div class="mg-action-prompt">
               <span class="mg-action-prompt-icon">▸</span>
               <span class="mg-action-prompt-text">CLICK "ADD END" BUTTON TO PLACE A TERMINAL NODE</span>
             </div>`
        }
      </div>`,
  },

  // ── Step 6: Label End Node ──────────────────────────────────────────────────
  {
    element: '#node-edit-panel',
    side: 'left',
    align: 'center',
    condition: (snap) =>
      snap.endNodeLabel.trim().length > 0 &&
      snap.endNodeLabel !== 'End',
    html: (done) => `
      <div class="mg-popover">
        <span class="mg-step-tag">07 / 10 — END CONFIGURATION</span>
        <div class="mg-popover-title">Configure End Node</div>
        <div class="mg-popover-body">
          Configure the terminal state for this flow:<br><br>
          <strong style="color:var(--color-signal)">NAME:</strong> Type "Conversion Success"<br>
          <strong style="color:var(--color-signal)">DESCRIPTION:</strong> Type "User lands on the premium dashboard."<br>
          <strong style="color:var(--color-signal)">VARIANT Toggle:</strong> Click and set it to "Success"
        </div>
        ${done
          ? `<div class="mg-action-done"><span class="mg-action-done-text">✓ END NODE CONFIGURED — click Next to continue</span></div>`
          : `<div class="mg-action-prompt">
               <span class="mg-action-prompt-icon">▸</span>
               <span class="mg-action-prompt-text">CONFIGURE THE END NODE ABOVE</span>
             </div>`
        }
      </div>`,
  },

  // ── Step 7: Connect Decision YES → End ─────────────────────────────────────────
  {
    element: '#flow-canvas',
    side: 'left',
    align: 'center',
    condition: (snap) => snap.hasDecisionToEndEdge,
    html: (done) => `
      <div class="mg-popover">
        <span class="mg-step-tag">08 / 10 — COMPLETE THE WIRING</span>
        <div class="mg-popover-title">Wire the YES Path</div>
        <div class="mg-popover-body">
          Drag a wire from the <strong style="color:var(--color-success)">YES (✔)</strong>
          output handle on the Decision node to the left side of the
          <strong style="color:var(--color-data)">End</strong> node.
          This closes the happy path for your synthetic users.
        </div>
        ${done
          ? `<div class="mg-action-done"><span class="mg-action-done-text">✓ FLOW COMPLETE — click Next to continue</span></div>`
          : `<div class="mg-action-prompt">
               <span class="mg-action-prompt-icon">▸</span>
               <span class="mg-action-prompt-text">DRAG: DECISION YES HANDLE → END NODE</span>
             </div>`
        }
      </div>`,
  },

  // ── Step 8: Assign Cohort ─────────────────────────────────────────────────────
  {
    element: '#cohort-roster',
    side: 'left',
    align: 'center',
    condition: (snap) => snap.assignedCohortCount > 0,
    html: (done) => `
      <div class="mg-popover">
        <span class="mg-step-tag">09 / 10 — INJECT SYNTHETIC USERS</span>
        <div class="mg-popover-title">Activate an AI Persona</div>
        <div class="mg-popover-body">
          Each cohort card is a synthetic user archetype with unique
          <strong style="color:var(--color-data)">patience</strong> and
          <strong style="color:var(--color-data)">tech-literacy</strong> scores.
          Toggle at least one on to seed your simulation.
        </div>
        ${done
          ? `<div class="mg-action-done"><span class="mg-action-done-text">✓ COHORT ASSIGNED — click Next to continue</span></div>`
          : `<div class="mg-action-prompt">
               <span class="mg-action-prompt-icon">▸</span>
               <span class="mg-action-prompt-text">FLIP THE TOGGLE ON ANY COHORT CARD</span>
             </div>`
        }
      </div>`,
  },

  // ── Step 9: Run Simulation ───────────────────────────────────────────────────
  {
    element: '#run-simulation-btn',
    side: 'bottom',
    align: 'end',
    condition: () => true,
    freeAdvance: true,
    html: (_done) => `
      <div class="mg-popover">
        <span class="mg-step-tag">10 / 10 — EXECUTE</span>
        <div class="mg-popover-title">Run the Simulation</div>
        <div class="mg-popover-body">
          Your flow is wired and your personas are loaded. Hit
          <strong style="color:var(--color-signal)">RUN SIMULATION</strong> to dispatch
          the engine. Real-time friction events stream into the log panel
          as each AI traverses your graph.
        </div>
        <div class="mg-action-prompt">
          <span class="mg-action-prompt-icon">▸</span>
          <span class="mg-action-prompt-text">CLICK THE BUTTON TO EXECUTE — GOOD LUCK</span>
        </div>
      </div>`,
  },
]

// ── Component ──────────────────────────────────────────────────────────────────
export function GuidedTutorial() {
  const driverRef = useRef<Driver | null>(null)
  const styleInjected = useRef(false)
  // Always-current step index for use inside driver.js callbacks (stale-closure guard)
  const stepIndexRef = useRef(0)

  const { isActive, stepIndex, start, advance, stop,
          baselineScreenCount, baselineDecisionCount, baselineEndCount, baselineEdgeCount } = useTutorialStore()

  // Keep ref in sync so driver.js callbacks are never stale
  stepIndexRef.current = stepIndex

  // Store subscriptions
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const editingNodeId = useFlowStore((s) => s.editingNodeId)
  const cohorts = useSettingsStore((s) => s.cohorts)

  // ── Inject CSS once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (styleInjected.current) return
    styleInjected.current = true
    const el = document.createElement('style')
    el.id = 'driver-mg-override'
    el.textContent = DRIVER_STYLE
    document.head.appendChild(el)
    return () => { el.remove(); styleInjected.current = false }
  }, [])

  // (getSnapshot is module-level — see bottom of file — reads stores directly)

  // ── Initialize/destroy driver when tutorial starts/stops ─────────────────────
  useEffect(() => {
    if (!isActive) {
      driverRef.current?.destroy()
      driverRef.current = null
      return
    }

    const snap = getSnapshot()
    const stepDef = STEPS[stepIndex]
    const done = stepDef.condition(snap)

    const d = driver({
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayClickBehavior: 'close',
      showProgress: true,
      prevBtnText: '[← PREV]',
      nextBtnText: stepDef.freeAdvance ? '[FINISH ✓]' : (done ? '[NEXT →]' : '[ WAITING... ]'),
      doneBtnText: '[FINISH ✓]',
      steps: STEPS.map((s, i) => ({
        element: s.element,
        popover: {
          description: s.html(i === stepIndex ? done : i < stepIndex),
          side: s.side,
          align: s.align,
        },
      })),
      onNextClick: () => {
        const currentIdx = stepIndexRef.current
        const currentSnap = getSnapshot()
        const currentStep = STEPS[currentIdx]
        if (!currentStep) return
        if (currentStep.freeAdvance || currentStep.condition(currentSnap)) {
          advance()
        }
        // else: locked — do nothing
      },
      onPrevClick: () => {
        const currentIdx = stepIndexRef.current
        if (currentIdx > 0) {
          useTutorialStore.setState({ stepIndex: currentIdx - 1 })
        }
        driverRef.current?.movePrevious()
      },
      onDestroyStarted: () => {
        const completedSteps = stepIndexRef.current + 1
        const totalSteps = STEPS.length
        if (typeof pendo !== 'undefined') {
          pendo.track('tutorial_completed', {
            steps_completed: completedSteps,
            total_steps: totalSteps,
            tutorial_abandoned: completedSteps < totalSteps,
          })
        }
        stop()
      },
    })

    driverRef.current = d
    d.drive(stepIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  // ── React to step changes ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || !driverRef.current) return
    if (stepIndex >= STEPS.length) { stop(); return }

    // For the LABEL steps, #node-edit-panel only exists in the DOM
    // once editingNodeId is set (NodeEditPanel renders conditionally).
    // We must open the panel FIRST, wait for React to mount it, then
    // call drive() — otherwise driver.js can't find the element to spotlight.
    const currentStepTag = TUTORIAL_STEPS[stepIndex]
    if (
      currentStepTag === 'LABEL_SCREEN' ||
      currentStepTag === 'LABEL_DECISION' ||
      currentStepTag === 'LABEL_END'
    ) {
      const { nodes: n, setEditingNode } = useFlowStore.getState()
      
      const typeMatch = 
        currentStepTag === 'LABEL_SCREEN' ? 'screen' :
        currentStepTag === 'LABEL_DECISION' ? 'decision' : 'end'

      const lastPlacedNode = [...n].reverse().find((x) => x.type === typeMatch)

      if (lastPlacedNode) {
        setEditingNode(lastPlacedNode.id)
        // Wait two animation frames for React to mount NodeEditPanel, then spotlight it
        setTimeout(() => {
          driverRef.current?.drive(stepIndex)
          refreshPopover(stepIndex, getSnapshot())
        }, 80)
        return // skip the immediate drive() call below
      }
    }

    // All other steps: element already in DOM, drive immediately
    driverRef.current.drive(stepIndex)
    refreshPopover(stepIndex, getSnapshot())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex])


  // ── Watch store state — auto-refresh popover when action completes ────────────
  useEffect(() => {
    if (!isActive || !driverRef.current) return
    const snap = getSnapshot()
    refreshPopover(stepIndex, snap)

    // Lock/unlock the next button
    const nextBtn = document.querySelector<HTMLButtonElement>('.driver-popover-next-btn')
    if (nextBtn) {
      const stepDef = STEPS[stepIndex]
      const done = stepDef.freeAdvance || stepDef.condition(snap)
      nextBtn.textContent = stepDef.freeAdvance
        ? '[FINISH ✓]'
        : done
        ? '[NEXT →]'
        : '[ WAITING... ]'
      if (done) {
        nextBtn.classList.remove('locked')
        nextBtn.style.pointerEvents = ''
        nextBtn.style.color = ''
      } else {
        nextBtn.classList.add('locked')
        nextBtn.style.pointerEvents = 'none'
        nextBtn.style.color = 'var(--color-wire)'
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, cohorts, editingNodeId, stepIndex, isActive])

  // ── Start button ─────────────────────────────────────────────────────────────
  const handleStart = () => {
    const { nodes: n, edges: e } = useFlowStore.getState()
    const screenCount = n.filter((x) => x.type === 'screen').length
    const decisionCount = n.filter((x) => x.type === 'decision').length
    const endCount = n.filter((x) => x.type === 'end').length
    const edgeCount = e.filter((x) => !x.id.startsWith('friction-')).length
    start(screenCount, decisionCount, endCount, edgeCount)
    if (typeof pendo !== 'undefined') {
      pendo.track('tutorial_started', {
        baseline_screen_count: screenCount,
        baseline_decision_count: decisionCount,
        baseline_end_count: endCount,
        baseline_edge_count: edgeCount,
      })
    }
  }

  return (
    <motion.button
      id="start-tutorial-btn"
      onClick={handleStart}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
      whileHover={{ opacity: 1 }}
      style={{ borderRadius: 0 }}
      className="
        font-mono text-[10px] font-bold tracking-[0.1em] uppercase
        px-3 py-1.5 shrink-0 cursor-pointer
        border border-signal text-signal bg-transparent
        transition-colors hover:bg-signal/10
      "
    >
      [ START TUTORIAL ]
    </motion.button>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Always reads fresh state from the stores via .getState().
 * Must be module-level (not inside the component) so it is never
 * a stale closure — driver.js callbacks invoke this long after the
 * React render that created them.
 */
function getSnapshot(): StoreSnapshot {
  const { nodes, edges, editingNodeId } = useFlowStore.getState()
  const { cohorts } = useSettingsStore.getState()
  const { baselineScreenCount, baselineDecisionCount, baselineEndCount, baselineEdgeCount } =
    useTutorialStore.getState()

  const screenNodes = nodes.filter((n) => n.type === 'screen')
  const decisionNodes = nodes.filter((n) => n.type === 'decision')
  const endNodes = nodes.filter((n) => n.type === 'end')
  
  const editingNode = editingNodeId
    ? nodes.find((n) => n.id === editingNodeId)
    : screenNodes[screenNodes.length - 1]

  // Detect an edge from any decision node to any end node
  const decisionIds = new Set(decisionNodes.map((n) => n.id))
  const endIds = new Set(endNodes.map((n) => n.id))
  const hasDecisionToEndEdge = edges.some(
    (e) => decisionIds.has(e.source) && endIds.has(e.target),
  )

  return {
    screenCount: screenNodes.length,
    decisionCount: decisionNodes.length,
    endCount: endNodes.length,
    edgeCount: edges.filter((e) => !e.id.startsWith('friction-')).length,
    assignedCohortCount: cohorts.filter((c) => c.assignedToRun).length,
    screenNodeLabel: editingNode?.data?.label ?? '',
    decisionNodeLabel: editingNode?.data?.label ?? '',
    endNodeLabel: editingNode?.data?.label ?? '',
    hasDecisionToEndEdge,
    baselineScreenCount,
    baselineDecisionCount,
    baselineEndCount,
    baselineEdgeCount,
  }
}

/** Patch the driver.js popover description in-place without re-driving */
function refreshPopover(stepIndex: number, snap: StoreSnapshot) {
  const descEl = document.querySelector<HTMLElement>('.driver-popover-description')
  if (!descEl) return
  const stepDef = STEPS[stepIndex]
  if (!stepDef) return
  const done = stepDef.freeAdvance || stepDef.condition(snap)
  descEl.innerHTML = stepDef.html(done)
}
