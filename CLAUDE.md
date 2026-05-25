# CLAUDE.md — Visual Learning

Auto-loaded by Claude Code at session start. Treat this as the single source of truth for adding new DSA visualizer pages.

---

## Project Overview

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (base-ui) · Framer Motion

**Purpose:** Each DSA algorithm gets one learning post page + one interactive step-through visualizer component.

**Directory layout:**

```
app/(main)/dsa/array/<slug>/page.tsx          ← learning post
components/array/<camelCase>.component.tsx     ← visualizer
components/array/array-data.ts                 ← nav registry (cards on /dsa/array)
components/ui/                                 ← Button, Input, Separator, PageLayout, PageHeader
```

---

## How to Add a New Algorithm

1. Check `components/array/array-data.ts` — the entry almost certainly already exists. Note the `href` (e.g. `/dsa/array/remove-duplicates`).
2. Create `components/array/<camelCase>.component.tsx` using the **Visualizer Template** below.
3. Create `app/(main)/dsa/array/<slug>/page.tsx` using the **Page Template** below.
4. Only add to `array-data.ts` if the entry is genuinely missing.

---

## Visualizer Component Template

File: `components/array/<AlgoName>.component.tsx`

```tsx
"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogEntry {
  id: number
  text: string
  // TODO: define types relevant to this algorithm
  type: "info" | "TODO_type_1" | "TODO_type_2" | "done"
}

interface AlgoState {
  nums: number[]
  // TODO: add algorithm-specific pointer/state fields
  // Examples:
  //   left: number; right: number              ← opposite-direction
  //   insertPos: number; fastIdx: number        ← slow/fast same-direction
  //   phase: "phaseA" | "phaseB"               ← multi-phase algorithms
  //   result: boolean | null                    ← when there's a boolean outcome
  done: boolean
  stepCount: number
  log: LogEntry[]
  statusInfo: { text: string; colorCn: string } | null  // rename freely: sumInfo, compareInfo, etc.
  justMoved: number | null  // rename to justPlaced etc. — drives scale animation
}

// ─── Cell component ───────────────────────────────────────────────────────────

interface CellProps {
  value: number
  index: number
  // TODO: add props that map to AlgoState pointer fields
  done: boolean
  justMoved: boolean
}

function Cell({ value, index, done, justMoved, ...pointerProps }: CellProps) {
  // TODO: derive boolean flags from pointerProps
  // const isLeft = index === left
  // const isRight = index === right

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Pointer label — height fixed so cells don't shift */}
      <div className="h-[18px] text-[11px] font-semibold">
        {/* TODO: render pointer labels (L, R, S, F, S/F, L=R, etc.) */}
      </div>

      <motion.div
        animate={justMoved ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex size-14 flex-col items-center justify-center rounded-lg border",
          "transition-colors duration-200 select-none cursor-default",
          // TODO: conditional color classes — see Color Convention Table below
          // Priority order (first match wins):
          //   1. done + special state (found / mismatch)
          //   2. both pointers on same cell → violet
          //   3. individual pointer colors
          //   4. "already processed" region → green or muted
          //   5. neutral → border-border bg-background text-foreground
        )}
      >
        <span className="text-lg font-semibold leading-none">{value}</span>
        <span className="mt-0.5 text-[10px] opacity-60">[{index}]</span>
      </motion.div>
    </div>
  )
}

// ─── Log line ─────────────────────────────────────────────────────────────────

// TODO: add all LogEntry type keys used above
const LOG_COLOR: Record<LogEntry["type"], string> = {
  info: "text-muted-foreground",
  done: "text-green-600",
  // TODO_type_1: "text-???",
  // TODO_type_2: "text-???",
}

function LogLine({ entry }: { entry: LogEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("py-0.5 text-xs leading-relaxed", LOG_COLOR[entry.type])}
      dangerouslySetInnerHTML={{ __html: entry.text }}
    />
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Module-level counter — NEVER use Date.now() for log IDs
let _logId = 0
function nextId() { return ++_logId }

function computeStatusInfo(
  // TODO: params matching AlgoState pointer fields
): { text: string; colorCn: string } | null {
  // TODO: return null | { text: "HTML string", colorCn: "text-??-500" }
  return null
}

function buildInitialState(
  nums: number[],
  // TODO: additional params e.g. target: number
): AlgoState {
  return {
    nums: [...nums],           // always spread to avoid mutation
    // TODO: initialise pointer fields (left: 0, right: nums.length - 1, etc.)
    done: false,
    stepCount: 0,
    log: [
      {
        id: nextId(),
        text: `Starting: ...`, // TODO: describe initial state
        type: "info",
      },
    ],
    statusInfo: computeStatusInfo(/* TODO */),
    justMoved: null,
  }
}

// Pure function — NEVER mutate prev, always return a new object
function advanceStep(prev: AlgoState): AlgoState {
  if (prev.done) return prev

  // TODO: read pointer fields from prev
  // const { nums, left, right, stepCount, log } = prev
  const step = prev.stepCount + 1

  // TODO: implement one step of the algorithm
  // Pattern:
  //   if (termination condition) → return { ...prev, done: true, log: [...], statusInfo: ... }
  //   if (branch A) → return { ...prev, <updated fields>, stepCount: step, log: [...], justMoved: <index> }
  //   if (branch B) → return { ...prev, <updated fields>, stepCount: step, log: [...], justMoved: <index> }

  return prev // placeholder — remove once implemented
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function /* TODO: AlgoName */Visualizer() {
  const [arrayInput, setArrayInput] = useState("TODO: default array string")
  // TODO: add targetInput state if algorithm needs a target
  const [state, setState] = useState<AlgoState>(() =>
    buildInitialState([/* TODO: default array */])
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  // Destructure only what render needs
  const { nums, done, log, statusInfo, justMoved } = state
  // TODO: destructure pointer fields: const { left, right } = state

  // ─── Actions ────────────────────────────────────────────────────────────────

  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null }
    setIsPlaying(false)
  }, [])

  const init = useCallback(() => {
    const parsed = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n))
    if (parsed.length < 1) return
    // TODO: parse targetInput if needed
    stopAuto()
    setState(buildInitialState(parsed /*, target */))
  }, [arrayInput, stopAuto])

  const step = useCallback(() => {
    setState((prev) => {
      const next = advanceStep(prev)
      if (next.justMoved !== null) {
        setTimeout(() => setState((s) => ({ ...s, justMoved: null })), 400)
      }
      return next
    })
  }, [])

  const toggleAuto = useCallback(() => {
    if (autoRef.current) { stopAuto(); return }
    if (done) return
    setIsPlaying(true)
    autoRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.done) { stopAuto(); return prev }
        const next = advanceStep(prev)
        if (next.justMoved !== null) {
          setTimeout(() => setState((s) => ({ ...s, justMoved: null })), 400)
        }
        if (next.done) stopAuto()
        return next
      })
    }, 900) // ← keep at 900ms
  }, [done, stopAuto])

  // Re-init 400ms after input changes — KEEP debounce at 400ms
  useEffect(() => {
    const id = setTimeout(init, 400)
    return () => clearTimeout(id)
  }, [arrayInput /*, targetInput */]) // eslint-disable-line

  // Scroll log to bottom
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  // Cleanup on unmount
  useEffect(() => () => stopAuto(), [stopAuto])

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        TODO: Algorithm Name — Visualizer
      </h2>

      {/* Inputs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground">Array</label>
        <Input
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
          className="w-64 font-mono"
        />
        {/* TODO: add Target input if needed */}
        <Button variant="outline" size="sm" onClick={init}>Reset ↺</Button>
      </div>

      {/* Array cells */}
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {nums.map((n, i) => (
          <Cell
            key={i}
            value={n}
            index={i}
            done={done}
            justMoved={justMoved === i}
            // TODO: pass pointer props (isLeft={i === left} etc.)
          />
        ))}
      </div>

      {/* Status / info bar */}
      <div className="mb-3 flex min-h-7 items-center justify-center">
        <AnimatePresence mode="wait">
          {statusInfo && (
            <motion.span
              key={statusInfo.text}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("text-sm font-medium", statusInfo.colorCn)}
              dangerouslySetInnerHTML={{ __html: statusInfo.text }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Log */}
      <div
        ref={logRef}
        className="mb-3 min-h-20 max-h-36 overflow-y-auto border-t border-border pt-2.5"
      >
        {log.map((entry) => (
          <LogLine key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Controls */}
      <div className="mb-4 flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={step} disabled={done}>Step →</Button>
        <Button variant="outline" size="sm" onClick={toggleAuto} disabled={done}>
          {isPlaying ? "Pause ⏸" : "Auto-play ▶"}
        </Button>
        <Button variant="outline" size="sm" onClick={init}>Reset ↺</Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          // TODO: fill in legend entries
          // { colorCn: "bg-blue-500", label: "Left pointer" },
        ].map(({ colorCn, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={cn("size-3 rounded-[3px]", colorCn)} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Page Template

File: `app/(main)/dsa/array/<slug>/page.tsx`

```tsx
import /* TODO: AlgoName */Visualizer from "@/components/array/<camelCase>.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  // TODO: 3–5 steps, each { label: string; detail: string }
  { label: "TODO step 1 label", detail: "TODO step 1 detail" },
  { label: "TODO step 2 label", detail: "TODO step 2 detail" },
]

const CODE = `TODO: paste the algorithm implementation here`

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${color}`}>
      {children}
    </span>
  )
}

function MetaRow() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* TODO: pick relevant badges from the Pointer Type column below */}
      <Badge color="bg-blue-500/10 text-blue-500">Two Pointers</Badge>
      {/* <Badge color="bg-violet-500/10 text-violet-500">Opposite Direction</Badge> */}
      {/* <Badge color="bg-purple-500/10 text-purple-500">Slow / Fast</Badge> */}
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Time: O(?)</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Space: O(?)</span>
      <span className="text-muted-foreground">·</span>
      {/* <Badge color="bg-green-500/10 text-green-600">Easy</Badge> */}
      {/* <Badge color="bg-yellow-500/10 text-yellow-600">Medium</Badge> */}
      {/* <Badge color="bg-red-500/10 text-red-600">Hard</Badge> */}
    </div>
  )
}

function ProblemStatement() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Problem</p>
      <p className="text-sm leading-relaxed text-foreground">
        {/* TODO: problem description with inline <code> snippets */}
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">TODO</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">TODO</code>
        </div>
        {/* Add Constraint / Counter-example rows as needed */}
      </div>
    </div>
  )
}

function ApproachSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Approach — TODO pattern name</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {/* TODO: one paragraph explaining the key insight */}
      </p>
      <ol className="flex flex-col gap-3">
        {APPROACH_STEPS.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {i + 1}
            </span>
            <span>
              <span className="font-medium text-foreground">{s.label}</span>
              {" — "}
              <span className="text-muted-foreground">{s.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function CodeSection() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Implementation</h2>
      <div className="relative rounded-xl border border-border bg-muted/50 overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-yellow-400" />
          <span className="size-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-muted-foreground font-mono">TODO: filename.js</span>
        </div>
        <pre className="overflow-x-auto p-5 text-xs leading-relaxed">
          <code className="font-mono text-foreground">{CODE}</code>
        </pre>
      </div>
    </div>
  )
}

function ComplexitySection() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Complexity</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Time", value: "O(?)", note: "TODO" },
          { label: "Space", value: "O(?)", note: "TODO" },
          { label: "Best case", value: "O(?)", note: "TODO" },
          { label: "Worst case", value: "O(?)", note: "TODO" },
        ].map(({ label, value, note }) => (
          <div key={label} className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-mono text-lg font-bold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function /* TODO: AlgoName */Page() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="TODO: Algorithm Title"
          subtitle="TODO: one-line description"
        />
        <MetaRow />
      </div>

      <Separator />

      <ProblemStatement />
      <ApproachSection />
      <CodeSection />
      <ComplexitySection />

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Interactive Visualizer</h2>
        <p className="text-sm text-muted-foreground">
          Step through the algorithm or hit Auto-play. Edit the array to try your
          own inputs — the visualizer resets automatically as you type.
        </p>
        {/* TODO: <AlgoNameVisualizer /> */}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {/* TODO: intro sentence */}
        </p>
        <ul className="flex flex-col gap-3">
          {[
            // TODO: one entry per meaningful cell state
            // { borderCn: "border-l-blue-500", label: "Label", labelCn: "text-blue-500", detail: "..." },
          ].map(({ borderCn, label, labelCn, detail }) => (
            <li key={label} className={`border-l-2 pl-4 text-sm ${borderCn}`}>
              <span className={`font-semibold font-mono ${labelCn}`}>{label}</span>
              <span className="text-muted-foreground"> — {detail}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            TODO: callout heading (e.g. "Why this works")
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {/* TODO: key insight explanation */}
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
```

---

## Color & Pointer Convention Table

### Pointer colors

| Pointer role                     | bg class        | border class        | text/label class  | Label shown |
| -------------------------------- | --------------- | ------------------- | ----------------- | ----------- |
| Left (opposite-dir)              | `bg-blue-500`   | `border-blue-500`   | `text-blue-500`   | `L`         |
| Right (opposite-dir)             | `bg-orange-500` | `border-orange-500` | `text-orange-500` | `R`         |
| Both on same cell (opposite-dir) | `bg-violet-500` | `border-violet-500` | `text-violet-500` | `L = R`     |
| Slow / insertPos (same-dir)      | `bg-purple-500` | `border-purple-500` | `text-purple-500` | `S`         |
| Fast / scanner (same-dir)        | `bg-blue-500`   | `border-blue-500`   | `text-blue-500`   | `F`         |
| Both on same cell (same-dir)     | `bg-violet-500` | `border-violet-500` | `text-violet-500` | `S/F`       |

### Outcome colors

| Outcome                    | bg class        | border class       | text class              | Use when                                        |
| -------------------------- | --------------- | ------------------ | ----------------------- | ----------------------------------------------- |
| Match / found / success    | `bg-green-500`  | `border-green-500` | `text-green-600`        | Answer found, palindrome confirmed, pair placed |
| Mismatch / failure         | `bg-red-500`    | `border-red-500`   | `text-red-500`          | Mismatch detected, no solution                  |
| Already processed (placed) | `bg-green-500`  | `border-green-500` | —                       | Region before slow pointer (MoveZeroes)         |
| Zero-filled tail           | `bg-muted`      | `border-border`    | `text-muted-foreground` | Region after insertPos when done                |
| Neutral (unvisited)        | `bg-background` | `border-border`    | `text-foreground`       | Any cell not currently active                   |

### Priority order inside Cell `cn()`

Always apply conditions from most-specific to least-specific so Tailwind doesn't conflict:

```
1. done + failure state   → red
2. done + success state   → green (active cells only)
3. both pointers          → violet
4. individual pointer A   → its color
5. individual pointer B   → its color
6. "already processed"    → green (no pointer)
7. "filled / inactive"    → muted
8. neutral fallback       → border-border bg-background
```

---

## Info Bar Convention

The animated bar below the array cells. Always named `statusInfo`, `sumInfo`, or `compareInfo` — pick what reads most naturally.

```typescript
// Shape — always this exact type
{ text: string; colorCn: string } | null

// text: HTML string — use &lt; &gt; for < > inside code
// colorCn: a single Tailwind text color class

// Standard color mapping:
//   "text-blue-500"          ← in-progress, pointer A moving
//   "text-orange-500"        ← pointer B moving
//   "text-purple-500"        ← slow pointer action
//   "text-green-600"         ← success / found
//   "text-red-500"           ← failure / mismatch
//   "text-muted-foreground"  ← neutral / skip
```

---

## Log Entry Convention

```typescript
interface LogEntry {
  id: number    // always nextId() — NEVER Date.now()
  text: string  // HTML allowed — bold with <b>, escape < as &lt;
  type: string  // drives color via LOG_COLOR map
}

// Standard type → color mappings:
const LOG_COLOR = {
  info:      "text-muted-foreground",  // always present
  done:      "text-green-600",         // always present
  // Algorithm-specific:
  "move-left":  "text-blue-500",
  "move-right": "text-orange-500",
  found:        "text-green-600",
  none:         "text-muted-foreground",
  match:        "text-green-600",
  mismatch:     "text-red-500",
  place:        "text-purple-500",
  skip:         "text-muted-foreground",
  fill:         "text-blue-500",
}
```

---

## Hard Rules — Never Change These

| Rule                                                     | Why                                                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Use `nextId()` (module counter) for log IDs              | `Date.now()` collides when two entries are added in one step                                       |
| `advanceStep` must be a **pure function** — no mutations | `setState(prev => advanceStep(prev))` is called inside intervals; mutations cause stale-state bugs |
| Always spread `nums`: `nums: [...prev.nums]`             | Prevents accidental shared references between states                                               |
| Debounce re-init at **400ms**                            | Shorter fires on every keystroke; longer feels sluggish                                            |
| Auto-play interval at **900ms**                          | Matches the animation duration + reading time                                                      |
| Animation clear timeout at **400ms**                     | Matches the `scale` animation duration in `motion.div`                                             |
| Input width: `w-64` for arrays, `w-16` for target        | Consistent across all pages                                                                        |
| Cell size: `size-14` (56×56px)                           | Consistent across all pages                                                                        |

---

## Existing Implementations (reference)

| Algorithm        | Pointer type                                | Component                                        | Page                                             |
| ---------------- | ------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Two Sum II       | Opposite direction (`left`, `right`)        | `components/array/twoSum.component.tsx`          | `app/(main)/dsa/array/two-sum-ii/page.tsx`       |
| Valid Palindrome | Opposite direction (`left`, `right`)        | `components/array/validPalindrome.component.tsx` | `app/(main)/dsa/array/valid-palindrome/page.tsx` |
| Move Zeroes      | Slow/fast same-dir (`insertPos`, `fastIdx`) | `components/array/moveZeroes.component.tsx`      | `app/(main)/dsa/array/move-zeroes/page.tsx`      |
