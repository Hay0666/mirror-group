# ⚙️ MIRRORGROUP MISSION BRIEF — SYNTHETIC BETA SIMULATOR
### Industrial-Grade SaaS Build | Agent-Orchestrated Hackathon Sprint

---

## ◈ MISSION OVERVIEW

**Task type:** Multi-agent SaaS application build
**Complexity:** High — real-time simulation engine, node-based flow builder, AI cohort generation, telemetry integration
**Deliverable:** Production-ready, client-side Single Page Application for **MirrorGroup: The Synthetic Beta Simulator**

You are building a **studio-tier, fully functional SaaS product** for Product Managers who refuse to ship blind. MirrorGroup eliminates the gap between wireframe and user truth. A PM sketches a UX flow. AI-generated Synthetic Cohorts — skeptical power users, confused grandmothers, impatient teenagers — walk through it and surface friction before a single line of engineering code is written. This is not a prototype tool. This is a **pre-flight crash simulator for product decisions**.

Dispatch agents in sequence. Each agent must verify its own deliverables against this brief before marking complete. Generate Artifacts at each milestone. Do not proceed to the next agent until the current agent's artifacts are confirmed.

---

## ◈ DESIGN DOCTRINE — INDUSTRIAL BRUTALIST

Before any agent touches a component, internalize this design language. It governs every decision.

**The Vibe:** A fusion of aerospace telemetry dashboards and brutalist print design. Think the inside of a Soviet-era control room redesigned by a Berlin-based type foundry. There is no softness here. Precision is the aesthetic. Failure is surfaced in bright orange. Data is always visible.

**Reference systems:**
- **Linear** — dense information architecture, monochrome base with surgical accent use
- **Vercel Analytics** — telemetry data as the hero, not an afterthought
- **Figma's internal tools** — node-based canvas with confident, utilitarian chrome
- **NASA mission control UIs** — information density as trust signal
- **Stripe Radar** — tabular data that commands authority

**Palette — in signal words:**
```
--color-void:         #0A0C0F   /* mission control darkness */
--color-slate-deep:   #111418   /* primary surface */
--color-slate-mid:    #1C2028   /* panel backgrounds */
--color-slate-light:  #272D38   /* elevated cards, modals */
--color-wire:         #3A424F   /* borders, dividers, grid lines */
--color-signal:       #FF6B2B   /* safety orange — failure, CTA, alerts */
--color-signal-dim:   #7A3010   /* muted signal — secondary warnings */
--color-data:         #E2E8F0   /* primary data text — cool off-white */
--color-ghost:        #64748B   /* secondary labels, metadata */
--color-success:      #22C55E   /* pass nodes, confirmed flows */
--color-caution:      #EAB308   /* friction warnings, partial failures */
```

No warm whites. No gradients unless they are noise-textured or linear data-driven. If a color evokes a consumer app, remove it.

**Typography mandate:**
- Display / Headers: **IBM Plex Mono Bold** or **JetBrains Mono** — data streams, node labels, metric readouts. Monospaced. Always.
- UI Labels / Body: **Inter** or **DM Sans** — tight, utilitarian, 400/500 weight only
- Data values (simulation outputs, percentages, scores): always monospaced, tabular-nums
- Display size: `2.5rem`–`4rem` for section headers. Never decorative. Always informational.
- Letter-spacing: `-0.02em` on headers, `0.08em` on all-caps labels
- Line height: `1.3` for UI copy, `1.6` for body/description
- All-caps used for: system status labels, cohort type tags, node category badges only

---

## ◈ STACK SPECIFICATION

This is a **pure client-side Single Page Application**. Do not introduce server-rendering frameworks.

```
react@18
vite (latest)
typescript
tailwindcss
framer-motion
react-flow (node builder canvas)
zustand (global state)
novus-ai SDK (telemetry — mandatory)
```

No Next.js. No SSR. No file-based routing. React Router for navigation if multi-view routing is needed.

---

## ◈ AGENT DISPATCH PLAN

---

### Agent 1 — ARCHITECT
**Task:** Scaffold the Vite + React + TypeScript project, establish the design token system, define folder architecture, and verify all dependencies install cleanly.

**Deliverables (Artifacts):**
- `architecture-plan.md` — complete folder tree, component map, state slice definitions, routing strategy, data flow diagram between major modules
- `design-tokens.ts` — all CSS custom properties, full palette, typography scale, spacing scale, z-index layers, animation duration constants
- `tailwind.config.ts` — extended Tailwind config that maps all design tokens into utility classes
- Verified dependency install log showing all packages at correct versions with zero peer-dependency conflicts

**Architectural mandates:**

Folder structure must separate concerns cleanly: `components/ui/` for primitives, `components/flow/` for React Flow node types, `components/simulation/` for the engine UI, `components/cohorts/` for synthetic user panels, `store/` for Zustand slices, `lib/` for pure logic utilities, `types/` for all shared TypeScript interfaces.

Define the core data model in `types/` before any component is written. The `FlowNode`, `FlowEdge`, `CohortProfile`, `SimulationRun`, `FrictionEvent`, and `TelemetryPayload` types must be specified here. Every agent downstream depends on these contracts being locked.

State architecture: Three Zustand slices — `flowStore` (canvas nodes and edges), `simulationStore` (run state, active cohort, friction events), `settingsStore` (cohort configuration, simulation parameters). Slices must be independent and composable.

---

### Agent 2 — DESIGN SYSTEM & PRIMITIVES
**Task:** Build all reusable UI primitives before any feature surface is composed. No feature code until this agent's artifacts are approved.

**Deliverables (Artifacts):**
- Screenshot of each primitive rendered in isolation against `--color-void` background
- `components/ui/` folder containing: `Button`, `Badge`, `StatusPill`, `MetricCard`, `DataTable`, `ProgressBar`, `TooltipPanel`, `Divider`, `MonoLabel`, `AlertStrip`, `ModalShell`, `SliderInput`, `ToggleSwitch`, `SectionHeader`

**Design mandate per primitive:**

`Button`: Three variants — `primary` (solid `--color-signal` background, `--color-void` text), `ghost` (transparent, `--color-signal` border and text), `system` (flat `--color-slate-light`, `--color-data` text). No border-radius above `2px`. Sharp corners signal precision.

`Badge` / `StatusPill`: Used for cohort type labels and node status. All-caps, monospaced, `0.08em` tracking, colored border matching status type — signal orange for friction, success green for pass, caution yellow for warning.

`MetricCard`: The workhorse of the simulation panel. Dark slate background. Top-left: monospaced metric label in ghost color. Center: large monospaced data value in `--color-data`. Bottom: delta indicator with directional arrow. Subtle `1px` wire-color border.

`DataTable`: Tabular data for friction event logs. Fixed-width monospaced columns. Alternating row backgrounds using `--color-slate-mid` and `--color-slate-deep`. Header row in all-caps ghost labels. Selected row: `--color-signal` left border, `2px`.

`AlertStrip`: Full-width notification bar. Variants: `critical` (signal orange background, black text), `warning` (caution yellow, dark text), `info` (wire-color border only). Used by simulation engine to broadcast friction events.

`ProgressBar`: Horizontal, `4px` tall, sharp-ended. Fill color is contextual — green for pass rate, orange for friction rate. Background: `--color-wire`. Used inside MetricCards and the simulation header.

Every primitive must be composed from Tailwind utility classes using the extended token config from Agent 1. No inline styles. No one-off CSS files.

---

### Agent 3 — FLOW BUILDER CANVAS
**Task:** Build the UX Flow Builder — the left-panel canvas where PMs construct their product flow using draggable, connectable nodes.

**Deliverables (Artifacts):**
- Screenshot of empty canvas state with grid and toolbar
- Screenshot of a populated flow with at least 5 connected nodes
- Screenshot of a node in its selected/edit state

**Canvas specification:**

The canvas is a React Flow instance occupying the full left panel (approximately 60% viewport width). Background: `--color-void` with a `dotted-grid` pattern at `24px` spacing, `--color-wire` dot color at `40%` opacity. This is the drafting table. It should feel technical, not creative.

**Node types to implement:**

`ScreenNode` — represents a product screen or step. Displays screen name in monospaced bold, screen type badge (Onboarding / Feature / Paywall / Error / Success), and connection handles on left and right edges.

`DecisionNode` — diamond shape (or truncated diamond via CSS). Represents a binary user decision point. Two output handles: `YES` (labeled in success green) and `NO` (labeled in signal orange).

`FrictionNode` — automatically injected by the simulation engine after a run. Visually distinct: `--color-signal` border, `2px` dashed, warning icon, friction severity score displayed. PMs cannot create these manually — they are generated by the simulation.

`EndNode` — terminal node. Variants: `success` (green border) and `drop-off` (signal orange border, skull-or-X iconography). Represents where a cohort user either converts or abandons.

**Toolbar specification:**

Left-edge vertical toolbar. Icon buttons only. Tools: `Select`, `Add Screen`, `Add Decision`, `Add End`, `Delete Selected`, `Auto-Layout`, `Clear Canvas`. Icons from Lucide React. Background: `--color-slate-mid`. Active tool: `--color-signal` left border on icon button.

**Connection styling:**

Edges: `2px` solid, `--color-wire` color by default. On simulation run, edges animate with a travelling dot to show cohort movement. Edge color updates post-simulation: green edges for high-pass paths, orange edges for high-friction paths. Edge labels show traversal percentage in monospaced type.

**Interaction mandates:**

Double-click any `ScreenNode` to open an inline edit panel — node name, description, expected user action. All edits propagate to `flowStore` immediately. Undo/Redo must be supported via keyboard shortcuts. Canvas pan and zoom via standard React Flow controls. Minimap in bottom-right corner: `--color-slate-mid` background, nodes rendered as `--color-ghost` rectangles.

---

### Agent 4 — SYNTHETIC COHORT ENGINE
**Task:** Build the Cohort Configuration panel and the AI-powered cohort profile generator. This is the right-side panel of the application.

**Deliverables (Artifacts):**
- Screenshot of the Cohort panel with 3 pre-built cohort profiles displayed
- Screenshot of the cohort generation interface with parameters set
- Screenshot of a single expanded cohort profile card

**Cohort panel specification:**

The right panel (approximately 40% viewport width) is divided into two zones: `Cohort Roster` (top, scrollable list of active cohorts) and `Simulation Controls` (bottom, persistent).

**Pre-built cohort archetypes to ship on day one:**

`THE IMPATIENT EXECUTIVE` — abandons any flow that requires more than 2 decisions before reaching value. Drops off at any screen containing more than 3 form fields. Success threshold: reaches primary CTA within 4 nodes.

`THE ANXIOUS FIRST-TIMER` — reads every label, hovers every tooltip, second-guesses every decision node. Generates high friction scores on anything ambiguous. Will abandon at any error state with no recovery path.

`THE POWER USER` — navigates with velocity. Generates friction only on flows that are objectively broken — missing edges, dead-end nodes, circular loops. Useful as a sanity baseline.

`THE LOW-BANDWIDTH USER` — simulates degraded conditions conceptually: flags flows with too many sequential loading states, penalizes any flow with more than 7 nodes between entry and value delivery.

`CUSTOM` — PM-defined. Opens the cohort builder.

**Cohort profile card design:**

Each cohort card: `--color-slate-light` background, `1px` `--color-wire` border. Top row: cohort name in monospaced bold + archetype badge. Middle: three behavioral parameters displayed as labeled progress bars — `Patience Index`, `Tech Literacy`, `Decision Confidence`. Bottom: `Assign to Run` toggle.

**Custom cohort builder:**

A modal (`ModalShell` primitive) with three slider inputs (`SliderInput` primitive) for the three behavioral parameters above, plus a free-text field for `Behavioral Quirks` (natural language description of edge behaviors). This description is sent to the AI generation layer to synthesize the cohort's specific friction logic. The system prompt to the AI must instruct it to return a structured JSON cohort behavior profile, not prose.

**AI integration mandate:**

The Anthropic API (via the artifact API access) must power the cohort behavior synthesis. When a PM defines a custom cohort or requests a deeper behavioral breakdown for a pre-built cohort, the system calls the AI with the cohort parameters and asks it to return a structured JSON object detailing: likely abandonment triggers, friction sensitivity thresholds per node type, expected completion rate range, and a one-sentence behavioral summary for display in the UI. Parse and render this JSON into the cohort card. Do not render raw AI text anywhere in the UI.

---

### Agent 5 — SIMULATION ENGINE
**Task:** Build the core simulation runner that traverses the flow graph using cohort behavioral profiles and generates friction events.

**Deliverables (Artifacts):**
- Screenshot of the simulation in its `RUNNING` state (animated traversal visible)
- Screenshot of the simulation in its `COMPLETE` state with friction events surfaced on the canvas
- Screenshot of the Friction Event Log panel populated with at least 5 events

**Simulation specification:**

The simulation engine is a pure TypeScript logic module in `lib/simulation/`. It accepts a `FlowGraph` (nodes + edges from `flowStore`) and an array of `CohortProfile` objects, and emits a `SimulationResult` containing: per-node friction scores, per-cohort completion rates, critical path analysis, and an ordered array of `FrictionEvent` objects.

**Traversal logic mandate:**

The engine must traverse the flow graph node-by-node for each cohort. At each `ScreenNode`, it evaluates the node's properties against the cohort's behavioral parameters and computes a `frictionScore` between 0 and 100. At each `DecisionNode`, it calculates a `dropOffProbability` based on the cohort's `Decision Confidence` parameter. When `dropOffProbability` exceeds the cohort's threshold, the traversal terminates and an `EndNode` of type `drop-off` is reached. This logic must be deterministic given the same inputs so results are reproducible.

**Simulation UI states:**

`IDLE` — canvas is editable, simulation panel shows last results or empty state. `CONFIGURING` — cohort selection active, `Run Simulation` CTA is enabled. `RUNNING` — canvas enters read-only mode, travelling-dot animation fires on edges, a progress bar fills in the simulation header, real-time friction events appear in the log as they are computed. `COMPLETE` — canvas updates with friction overlays on nodes and colored edges, full results rendered in the right panel.

**Simulation header bar:**

A persistent bar spanning the full width above the canvas. Left: `MirrorGroup` wordmark in monospaced bold. Center: current simulation status badge (`--color-signal` for running, `--color-success` for complete, `--color-ghost` for idle). Right: `Run Simulation` primary button (disabled until at least one cohort is assigned and the flow has a minimum of 3 connected nodes).

**Friction Event Log:**

A scrollable panel below the Cohort Roster. Entries appear in real-time during simulation using Framer Motion's `AnimatePresence` — each new event slides in from the bottom. Each entry: timestamp in monospaced type (simulation step, not wall-clock), cohort name badge, affected node name, friction score in signal orange if above 70, caution yellow if 40–70, success green if below 40, and a one-line friction description.

**Post-simulation canvas overlays:**

After `COMPLETE`, each node receives a friction score badge in its top-right corner. Nodes with scores above 70 get a pulsing `--color-signal` border. Edges update color based on the percentage of cohorts that successfully traversed them. A `FrictionNode` is injected adjacent to any `ScreenNode` with a score above 80, positioned automatically by the layout engine.

---

### Agent 6 — NOVUS.AI TELEMETRY INTEGRATION
**Task:** Instrument the entire application with Novus.ai SDK telemetry. This is a mandatory deliverable. No exceptions.

**Deliverables (Artifacts):**
- Screenshot of the Novus.ai dashboard showing live events from a test simulation run
- `lib/telemetry/` module showing the event taxonomy and dispatch logic (as a documented architecture diagram, not code)
- QA log confirming each tracked event fires correctly

**Integration mandate:**

The Novus.ai SDK must be initialized at application boot in the root entry point. The SDK API key must be read from a Vite environment variable (`VITE_NOVUS_API_KEY`). No API key must ever be hardcoded or committed.

**Event taxonomy — every one of these must be tracked:**

`flow_node_added` — fires when a PM adds any node to the canvas. Properties: `node_type`, `total_nodes_in_flow`.

`flow_node_connected` — fires when an edge is created between two nodes. Properties: `source_node_type`, `target_node_type`, `total_edges_in_flow`.

`cohort_assigned` — fires when a cohort is toggled onto a simulation run. Properties: `cohort_archetype`, `is_custom_cohort`.

`simulation_started` — fires when the Run Simulation button is clicked. Properties: `node_count`, `edge_count`, `cohort_count`, `has_decision_nodes`.

`simulation_completed` — fires when the engine reaches `COMPLETE` state. Properties: `duration_ms`, `total_friction_events`, `highest_friction_score`, `overall_completion_rate`.

`friction_event_surfaced` — fires for each individual friction event generated. Properties: `node_type`, `cohort_archetype`, `friction_score`, `friction_severity` (critical / warning / pass).

`cohort_created_custom` — fires when a PM saves a custom cohort profile. Properties: `patience_index`, `tech_literacy`, `decision_confidence`.

`canvas_cleared` — fires when the PM uses the Clear Canvas tool. Properties: `nodes_lost`, `edges_lost`.

`flow_exported` — fires if export functionality is present. Properties: `format`, `node_count`.

**Telemetry architecture mandate:**

All Novus.ai dispatch calls must be centralized in `lib/telemetry/`. No SDK calls scattered across components. Components dispatch named events to the telemetry module; the module handles SDK formatting and transmission. This enforces a clean separation between product logic and analytics logic.

---

### Agent 7 — FRICTION MATRIX & RESULTS DASHBOARD
**Task:** Build the post-simulation results experience — the Friction Matrix view that surfaces insights in a structured, actionable format.

**Deliverables (Artifacts):**
- Screenshot of the Friction Matrix full view after a completed simulation
- Screenshot of the per-cohort breakdown panel
- Screenshot of the Critical Path analysis view

**Results dashboard specification:**

After simulation completes, a `View Full Report` button appears in the simulation header. This triggers a slide-up modal (`ModalShell`) occupying 90% of the viewport — the Friction Matrix.

**Friction Matrix layout:**

Three-column grid. Left column: `Critical Path Analysis`. Center column: `Node Friction Breakdown`. Right column: `Cohort Completion Rates`.

**Critical Path Analysis panel:**

Displays the highest-traffic path through the flow as a vertical node list with connecting lines — a simplified linear representation of the primary user journey. Each node in the path shows its friction score as a horizontal bar filling left-to-right. The node with the highest friction score is highlighted with a `--color-signal` background. A summary statement at the top reads: `N of M nodes on the critical path are above friction threshold.` in monospaced type.

**Node Friction Breakdown panel:**

A `DataTable` primitive listing every node in the flow. Columns: `NODE NAME`, `TYPE`, `AVG FRICTION`, `COHORT WORST`, `COHORT BEST`, `STATUS`. Sortable by any column. Rows are colored contextually by status. Clicking a row highlights the corresponding node on the canvas behind the modal (subtle ring effect visible through the translucent modal background).

**Cohort Completion Rates panel:**

A horizontal bar chart built from primitive HTML/CSS elements — no charting library. Each cohort gets one bar. Bar width represents completion rate percentage. Bar color is contextual: green if above 70%, caution if 40–70%, signal orange if below 40%. Below each bar: the cohort name and their primary drop-off point node name. This panel answers: `Which cohort is your product failing the most, and where?`

**Recommendation strip:**

Below the three-column grid, a full-width `AlertStrip` (critical variant) lists the top three AI-generated recommendations for reducing friction. These are generated via the Anthropic API using the simulation result data as context. The prompt must instruct the model to return exactly three concise, actionable recommendations in JSON array format — no prose preamble, no markdown. Each recommendation maps to: the specific node name, the suggested UX change, and the cohorts most likely to benefit. Render these as three numbered cards, not a bulleted list.

---

### Agent 8 — POLISH, ANIMATION & QA
**Task:** Apply global animation, micro-interaction polish, perform cross-browser and responsive QA, and generate a final QA report.

**Deliverables (Artifacts):**
- Annotated screenshot marking all four conversion/engagement touchpoints in the application
- QA report with checklist status for every item below
- Screen recording of a full end-to-end simulation run from empty canvas to Friction Matrix

**Animation mandate:**

All panel transitions use Framer Motion with `ease: [0.25, 0.46, 0.45, 0.94]` — a precision deceleration curve. No spring animations. Springs feel consumer. Easing curves feel engineered.

The simulation header status badge must animate between states using `AnimatePresence` with a vertical flip transition — outgoing text exits upward, incoming text enters from below, duration `200ms`.

The `Run Simulation` button must have a loading state: the button text is replaced by a monospaced countdown/spinner composed of ASCII characters cycling through `[ — ] [ \ ] [ | ] [ / ]` at `150ms` intervals. When simulation completes, the button snaps to `COMPLETE` with a `--color-success` background for `1500ms` before returning to its default state.

Node friction score badges must animate in after simulation completes using a staggered `opacity: 0 → 1` and `scale: 0.7 → 1` transition, `80ms` stagger between nodes, ordered by friction score descending — the most critical problems appear first.

The Friction Matrix modal must open with a `y: 100% → 0%` slide-up, `400ms`, backed by a `rgba(10, 12, 15, 0.85)` backdrop blur overlay.

**QA Checklist:**

- [ ] Vite production build completes with zero TypeScript errors and zero unused import warnings
- [ ] React Flow canvas is stable — no re-render loops on node drag, no state desync between canvas and `flowStore`
- [ ] Simulation engine produces deterministic results — identical inputs yield identical outputs across multiple runs
- [ ] Novus.ai: all 9 telemetry events verified firing in correct order during a full simulation run
- [ ] Framer Motion: no layout shift or FOUC on initial load; `AnimatePresence` transitions complete without flicker
- [ ] All Zustand slices reset cleanly on `Clear Canvas` — no stale state leaking between simulation runs
- [ ] Anthropic API calls in Cohort Builder and Friction Matrix: loading states visible, error states handled gracefully with fallback messaging, no raw JSON exposed to the user
- [ ] Mobile: application degrades gracefully — canvas is pinch-zoomable, right panel collapses to a bottom drawer on viewports below `768px`
- [ ] Keyboard accessibility: `Tab` order is logical, `Run Simulation` is reachable via keyboard, modal closes on `Escape`
- [ ] Environment variables: `VITE_NOVUS_API_KEY` confirmed read from `.env.local`, confirmed absent from build bundle output
- [ ] No `console.error` or unhandled Promise rejections in the browser console during a full simulation run
- [ ] Empty states: canvas with no nodes, cohort panel with no cohorts assigned, and simulation with no results all render intentional empty-state UI — no blank divs

---

## ◈ COPY DIRECTION

When writing any UI label, empty state, tooltip, or system message, follow these rules:

- Voice: a senior engineer briefing a war room, not a SaaS product marketing team
- No fluff words: "powerful", "seamless", "intuitive" are banned
- Empty states are directives, not encouragements — `No flow detected. Add a screen node to begin.` not `Get started by adding your first node! 🎉`
- Error messages are precise and actionable — name the exact problem, name the exact fix
- Metric labels are abbreviated and monospaced — `FRIC. SCORE`, `COMPL. RATE`, `DROP-OFF PT.`
- Status messages are uppercase, terse — `RUNNING`, `IDLE`, `COMPLETE`, `AWAITING COHORT`
- The only moment of humanity in the copy is the Friction Matrix recommendation strip — recommendations may use second-person: `Reduce the decision load at this node. Impatient Executives are dropping here at 73%.`

---

## ◈ HACKATHON JUDGING ALIGNMENT

Before marking the mission complete, verify alignment against all four judging criteria:

| Criterion | How MirrorGroup Wins It |
|---|---|
| **Product Thinking (25%)** | Solves a real PM pain with a clear before/after. The Friction Matrix produces decisions, not data. |
| **Craft and Execution (25%)** | Industrial Brutalist design system is deliberate and internally consistent. Animations are precise. No visual debt. |
| **Originality and Ambition (25%)** | Synthetic cohort simulation is a category-new idea. No direct competitor. The concept is demonstrable in a 90-second live run. |
| **Shippedness (25%)** | Pure client-side SPA — no server to fail. Pre-built cohorts ship working on day one. Empty-to-simulation in under 60 seconds. |

---

## ◈ FINAL MISSION CHECKPOINT

Before marking complete, verify all Artifacts are attached to the Mission:

| Artifact | Agent | Status |
|---|---|---|
| `architecture-plan.md` + `design-tokens.ts` | Architect | — |
| `tailwind.config.ts` + dependency install log | Architect | — |
| Primitive component screenshots (all 14) | Design System | — |
| Canvas empty state + populated flow screenshots | Flow Builder | — |
| Node edit state screenshot | Flow Builder | — |
| Cohort panel screenshots (roster + builder + card) | Cohort Engine | — |
| Simulation `RUNNING` + `COMPLETE` screenshots | Simulation Engine | — |
| Friction Event Log screenshot | Simulation Engine | — |
| Novus.ai dashboard screenshot (live events) | Telemetry | — |
| Telemetry event taxonomy architecture diagram | Telemetry | — |
| Telemetry QA event log | Telemetry | — |
| Friction Matrix full view screenshot | Results Dashboard | — |
| Per-cohort breakdown screenshot | Results Dashboard | — |
| Critical Path analysis screenshot | Results Dashboard | — |
| End-to-end simulation screen recording | QA | — |
| Annotated conversion touchpoints screenshot | QA | — |
| QA report with full checklist | QA | — |

Leave inline feedback on any Artifact that deviates from this brief before the next agent proceeds. A deviation unaddressed is a judging point surrendered.

---

*Paste this entire Mission Brief into Antigravity's Manager View without modification. Do not summarize. Do not simplify. Do not reorder agents. The sequence is load-bearing.*