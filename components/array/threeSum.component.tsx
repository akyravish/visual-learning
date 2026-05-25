"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ────────────────────────────────────────────────────────────────────

type LogType = "info" | "sort" | "fix-i" | "skip-i" | "sum-low" | "sum-high" | "found" | "done"

interface LogEntry {
  id: number
  text: string
  type: LogType
}

interface AlgoState {
  nums: number[]                          // sorted
  i: number                               // outer fixed pointer
  left: number                            // inner left
  right: number                           // inner right
  phase: "sort-done" | "fix-i" | "inner" | "found" | "done"
  triplets: [number, number, number][]    // accumulated results
  done: boolean
  stepCount: number
  log: LogEntry[]
  sumInfo: { text: string; colorCn: string } | null
  justMoved: number | null
}

// ─── Log colors ───────────────────────────────────────────────────────────────

const LOG_COLOR: Record<LogType, string> = {
  info:       "text-muted-foreground",
  sort:       "text-muted-foreground",
  "fix-i":    "text-violet-500",
  "skip-i":   "text-muted-foreground",
  "sum-low":  "text-blue-500",
  "sum-high": "text-orange-500",
  found:      "text-green-600",
  done:       "text-green-600",
}

// ─── Cell component ───────────────────────────────────────────────────────────

interface CellProps {
  value: number
  index: number
  isI: boolean
  isLeft: boolean
  isRight: boolean
  isPast: boolean
  isFound: boolean
  justMoved: boolean
}

function Cell({ value, index, isI, isLeft, isRight, isPast, isFound, justMoved }: CellProps) {
  const isFoundActive = isFound && (isI || isLeft || isRight)
  const isLR = isLeft && isRight

  const pointerILabel = isI ? "i" : null
  const pointerLRLabel = isLR ? "L=R" : isLeft ? "L" : isRight ? "R" : null

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* i label row */}
      <div
        className={cn(
          "h-4.5 text-[11px] font-semibold",
          isI ? "text-violet-500" : "text-transparent",
        )}
      >
        {pointerILabel ?? "·"}
      </div>

      {/* L/R label row */}
      <div
        className={cn(
          "h-4.5 text-[11px] font-semibold",
          isLR && "text-violet-500",
          !isLR && isLeft && "text-blue-500",
          !isLR && isRight && "text-orange-500",
          !isLeft && !isRight && "text-transparent",
        )}
      >
        {pointerLRLabel ?? "·"}
      </div>

      <motion.div
        animate={justMoved ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex size-14 flex-col items-center justify-center rounded-lg border",
          "transition-colors duration-200 select-none cursor-default",
          // Priority order — first match wins
          isFoundActive && "border-green-500 bg-green-500 text-white",
          !isFoundActive && isI && !isLeft && "border-violet-500 bg-violet-500 text-white",
          !isFoundActive && isLR && "border-violet-500 bg-violet-500 text-white",
          !isFoundActive && !isI && isLeft && !isRight && "border-blue-500 bg-blue-500 text-white",
          !isFoundActive && !isLR && isRight && !isLeft && "border-orange-500 bg-orange-500 text-white",
          !isFoundActive && !isI && !isLeft && !isRight && isPast && "border-border bg-muted text-muted-foreground opacity-50",
          !isFoundActive && !isI && !isLeft && !isRight && !isPast && "border-border bg-background text-foreground",
        )}
      >
        <span className="text-lg font-semibold leading-none">{value}</span>
        <span className="mt-0.5 text-[10px] opacity-60">[{index}]</span>
      </motion.div>
    </div>
  )
}

// ─── Log line ─────────────────────────────────────────────────────────────────

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

let _logId = 0
function nextId() { return ++_logId }

function computeSumInfo(
  iIdx: number,
  l: number,
  r: number,
  nums: number[],
): { text: string; colorCn: string } | null {
  if (l >= r) return null
  const sum = nums[iIdx] + nums[l] + nums[r]
  if (sum < 0)
    return {
      text: `${nums[iIdx]} + ${nums[l]} + ${nums[r]} = ${sum} &lt; 0 → move L right`,
      colorCn: "text-blue-500",
    }
  if (sum > 0)
    return {
      text: `${nums[iIdx]} + ${nums[l]} + ${nums[r]} = ${sum} &gt; 0 → move R left`,
      colorCn: "text-orange-500",
    }
  return {
    text: `${nums[iIdx]} + ${nums[l]} + ${nums[r]} = 0 ✓`,
    colorCn: "text-green-600",
  }
}

function buildInitialState(input: number[]): AlgoState {
  const nums = [...input].sort((a, b) => a - b)
  const n = nums.length
  return {
    nums,
    i: 0,
    left: 1,
    right: n - 1,
    phase: "sort-done",
    triplets: [],
    done: false,
    stepCount: 0,
    log: [
      {
        id: nextId(),
        text: `Input sorted → [${nums.join(", ")}]. Ready to start.`,
        type: "sort",
      },
    ],
    sumInfo: null,
    justMoved: null,
  }
}

// Pure function — never mutates prev
function advanceStep(prev: AlgoState): AlgoState {
  if (prev.done) return prev

  const { nums, i, left, right, phase, triplets, stepCount, log } = prev
  const n = nums.length
  const step = stepCount + 1

  // Helper: advance the outer i pointer, skipping duplicates
  function advanceI(
    fromI: number,
    currentTriplets: [number, number, number][],
    currentLog: LogEntry[],
  ): AlgoState {
    let newI = fromI + 1
    const skipped: number[] = []

    while (newI < n - 2 && nums[newI] === nums[newI - 1]) {
      skipped.push(nums[newI])
      newI++
    }

    if (newI >= n - 2) {
      const skipNote =
        skipped.length > 0
          ? ` (skipped ${skipped.length} duplicate${skipped.length > 1 ? "s" : ""})`
          : ""
      return {
        ...prev,
        nums: [...nums],
        triplets: currentTriplets,
        i: newI,
        left: newI + 1,
        right: n - 1,
        phase: "done",
        done: true,
        stepCount: step,
        log: [
          ...currentLog,
          {
            id: nextId(),
            text: `Done${skipNote}. Found <b>${currentTriplets.length}</b> unique triplet${currentTriplets.length !== 1 ? "s" : ""}.`,
            type: "done",
          },
        ],
        sumInfo: null,
        justMoved: null,
      }
    }

    const skipNote =
      skipped.length > 0
        ? ` (skipped duplicate${skipped.length > 1 ? "s" : ""} ${skipped.map(String).join(", ")})`
        : ""
    const newLeft = newI + 1
    const newRight = n - 1

    return {
      ...prev,
      nums: [...nums],
      triplets: currentTriplets,
      i: newI,
      left: newLeft,
      right: newRight,
      phase: "fix-i",
      done: false,
      stepCount: step,
      log: [
        ...currentLog,
        {
          id: nextId(),
          text: `Step ${step}: Fix <b>i=${newI}</b> (nums[${newI}]=${nums[newI]})${skipNote}, L=${newLeft}, R=${newRight}`,
          type: skipped.length > 0 ? "skip-i" : "fix-i",
        },
      ],
      sumInfo: computeSumInfo(newI, newLeft, newRight, nums),
      justMoved: newI,
    }
  }

  // ── Phase: sort-done → kick off first window ────────────────────────────────
  if (phase === "sort-done") {
    return {
      ...prev,
      nums: [...nums],
      i: 0,
      left: 1,
      right: n - 1,
      phase: "inner",
      stepCount: step,
      log: [
        ...log,
        {
          id: nextId(),
          text: `Step ${step}: Fix <b>i=0</b> (nums[0]=${nums[0]}), L=1, R=${n - 1}`,
          type: "fix-i",
        },
      ],
      sumInfo: computeSumInfo(0, 1, n - 1, nums),
      justMoved: null,
    }
  }

  // ── Phase: fix-i → compute sumInfo and enter inner scan ────────────────────
  if (phase === "fix-i") {
    return {
      ...prev,
      nums: [...nums],
      phase: "inner",
      stepCount: step,
      log: [
        ...log,
        {
          id: nextId(),
          text: `Step ${step}: i=${i} (${nums[i]}), L=${left}, R=${right}. Scanning…`,
          type: "fix-i",
        },
      ],
      sumInfo: computeSumInfo(i, left, right, nums),
      justMoved: null,
    }
  }

  // ── Phase: inner ────────────────────────────────────────────────────────────
  if (phase === "inner") {
    const sum = nums[i] + nums[left] + nums[right]

    // Found a triplet
    if (sum === 0) {
      const newTriplet: [number, number, number] = [nums[i], nums[left], nums[right]]
      const newTriplets = [...triplets, newTriplet]

      // Skip duplicates for L and R, then converge
      let newLeft = left
      let newRight = right
      const dupSkips: string[] = []

      while (newLeft < newRight && nums[newLeft] === nums[newLeft + 1]) {
        dupSkips.push(`L dup ${nums[newLeft]}`)
        newLeft++
      }
      while (newLeft < newRight && nums[newRight] === nums[newRight - 1]) {
        dupSkips.push(`R dup ${nums[newRight]}`)
        newRight--
      }
      newLeft++
      newRight--

      const dupNote =
        dupSkips.length > 0 ? ` (skipped ${dupSkips.length} duplicate${dupSkips.length > 1 ? "s" : ""})` : ""

      const foundLog: LogEntry = {
        id: nextId(),
        text: `Step ${step}: <b>[${newTriplet.join(", ")}]</b> found!${dupNote}`,
        type: "found",
      }

      // Check if inner window exhausted
      if (newLeft >= newRight) {
        return advanceI(i, newTriplets, [...log, foundLog])
      }

      return {
        ...prev,
        nums: [...nums],
        left: newLeft,
        right: newRight,
        phase: "inner",
        triplets: newTriplets,
        stepCount: step,
        log: [...log, foundLog],
        sumInfo: computeSumInfo(i, newLeft, newRight, nums),
        justMoved: newLeft,
      }
    }

    // Sum too low — move L right
    if (sum < 0) {
      const newLeft = left + 1

      const moveLog: LogEntry = {
        id: nextId(),
        text: `Step ${step}: ${nums[i]}+${nums[left]}+${nums[right]}=${sum} &lt; 0 → L moves right`,
        type: "sum-low",
      }

      if (newLeft >= right) {
        return advanceI(i, triplets, [...log, moveLog])
      }

      return {
        ...prev,
        nums: [...nums],
        left: newLeft,
        phase: "inner",
        stepCount: step,
        log: [...log, moveLog],
        sumInfo: computeSumInfo(i, newLeft, right, nums),
        justMoved: newLeft,
      }
    }

    // Sum too high — move R left
    const newRight = right - 1

    const moveLog: LogEntry = {
      id: nextId(),
      text: `Step ${step}: ${nums[i]}+${nums[left]}+${nums[right]}=${sum} &gt; 0 → R moves left`,
      type: "sum-high",
    }

    if (left >= newRight) {
      return advanceI(i, triplets, [...log, moveLog])
    }

    return {
      ...prev,
      nums: [...nums],
      right: newRight,
      phase: "inner",
      stepCount: step,
      log: [...log, moveLog],
      sumInfo: computeSumInfo(i, left, newRight, nums),
      justMoved: newRight,
    }
  }

  return prev
}

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULT_NUMS = [-1, 0, 1, 2, -1, -4]
const DEFAULT_INPUT = "-1, 0, 1, 2, -1, -4"

export default function ThreeSumVisualizer() {
  const [arrayInput, setArrayInput] = useState(DEFAULT_INPUT)
  const [state, setState] = useState<AlgoState>(() => buildInitialState(DEFAULT_NUMS))
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { nums, i, left, right, phase, triplets, done, log, sumInfo, justMoved } = state

  // ─── Actions ──────────────────────────────────────────────────────────────

  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null }
    setIsPlaying(false)
  }, [])

  const init = useCallback(() => {
    const parsed = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n))
    if (parsed.length < 3) return
    stopAuto()
    setState(buildInitialState(parsed))
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
    }, 900)
  }, [done, stopAuto])

  // Debounced re-init
  useEffect(() => {
    const id = setTimeout(init, 400)
    return () => clearTimeout(id)
  }, [arrayInput]) // eslint-disable-line

  // Scroll log to bottom
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  // Cleanup on unmount
  useEffect(() => () => stopAuto(), [stopAuto])

  // ─── Render ───────────────────────────────────────────────────────────────

  const isFound = phase === "inner" && sumInfo?.colorCn === "text-green-600"

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        Three Sum — Visualizer
      </h2>

      {/* Inputs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground">Array</label>
        <Input
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
          className="w-64 font-mono"
        />
        <Button variant="outline" size="sm" onClick={init}>Reset ↺</Button>
      </div>

      {/* Array cells */}
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {nums.map((n, idx) => (
          <Cell
            key={idx}
            value={n}
            index={idx}
            isI={idx === i}
            isLeft={idx === left}
            isRight={idx === right}
            isPast={idx < i}
            isFound={isFound}
            justMoved={justMoved === idx}
          />
        ))}
      </div>

      {/* Results panel */}
      {triplets.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Found:</span>
          <AnimatePresence>
            {triplets.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="rounded-md border border-green-500/40 bg-green-500/10 px-2.5 py-1 font-mono text-xs text-green-600"
              >
                [{t.join(", ")}]
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Sum info bar */}
      <div className="mb-3 flex min-h-7 items-center justify-center">
        <AnimatePresence mode="wait">
          {sumInfo && (
            <motion.span
              key={sumInfo.text}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("text-sm font-medium", sumInfo.colorCn)}
              dangerouslySetInnerHTML={{ __html: sumInfo.text }}
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
          { colorCn: "bg-violet-500", label: "i — fixed element" },
          { colorCn: "bg-blue-500",   label: "L — left pointer" },
          { colorCn: "bg-orange-500", label: "R — right pointer" },
          { colorCn: "bg-green-500",  label: "Triplet found" },
          { colorCn: "bg-muted border border-border", label: "Already processed" },
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
