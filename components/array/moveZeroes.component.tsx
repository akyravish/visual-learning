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
  type: "info" | "skip" | "place" | "fill" | "done"
}

interface AlgoState {
  nums: number[]
  insertPos: number
  fastIdx: number
  phase: "scan" | "fill"
  done: boolean
  stepCount: number
  log: LogEntry[]
  statusInfo: { text: string; colorCn: string } | null
  justPlaced: number | null
}

// ─── Cell component ───────────────────────────────────────────────────────────

interface CellProps {
  value: number
  index: number
  insertPos: number
  fastIdx: number
  done: boolean
  phase: "scan" | "fill"
  justPlaced: boolean
}

function Cell({ value, index: i, insertPos, fastIdx, done, phase, justPlaced }: CellProps) {
  const isSlow = i === insertPos
  const isFast = i === fastIdx
  const isBoth = isSlow && isFast
  const isPlaced = i < insertPos
  const isZeroFill = done && i >= insertPos

  const cellCn = cn(
    "flex size-14 flex-col items-center justify-center rounded-lg border transition-colors duration-200 select-none cursor-default",
    isBoth && "border-violet-500 bg-violet-500 text-white",
    !isBoth && isFast && !isPlaced && "border-blue-500 bg-blue-500 text-white",
    !isBoth && isSlow && !isPlaced && !isFast && "border-purple-500 bg-purple-500 text-white",
    isPlaced && !isSlow && !isFast && "border-green-500 bg-green-500 text-white",
    // during fill phase, insertPos cell is being written
    !isBoth && phase === "fill" && isSlow && "border-blue-500 bg-blue-500 text-white",
    isZeroFill && "border-border bg-muted text-muted-foreground",
    !isBoth && !isFast && !isSlow && !isPlaced && !isZeroFill && "border-border bg-background text-foreground",
  )

  const labelCn = cn(
    "h-[18px] text-[11px] font-semibold",
    isBoth && "text-violet-500",
    !isBoth && isFast && isSlow && "text-violet-500",
    !isBoth && isFast && !isSlow && "text-blue-500",
    !isBoth && isSlow && !isFast && phase === "scan" && "text-purple-500",
    !isBoth && isSlow && !isFast && phase === "fill" && "text-blue-500",
  )

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={labelCn}>
        {isBoth && "S/F"}
        {!isBoth && isSlow && !isFast && "S"}
        {!isBoth && isFast && !isSlow && "F"}
      </div>
      <motion.div
        animate={justPlaced ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cellCn}
      >
        <span className="text-lg font-semibold leading-none">{value}</span>
        <span className="mt-0.5 text-[10px] opacity-60">[{i}]</span>
      </motion.div>
    </div>
  )
}

// ─── Log line ─────────────────────────────────────────────────────────────────

const LOG_COLOR: Record<LogEntry["type"], string> = {
  info: "text-muted-foreground",
  skip: "text-muted-foreground",
  place: "text-purple-500",
  fill: "text-blue-500",
  done: "text-green-600",
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

let _logId = 0
function nextId() { return ++_logId }

function computeStatusInfo(
  insertPos: number,
  fastIdx: number,
  nums: number[],
  phase: "scan" | "fill",
  done: boolean,
): { text: string; colorCn: string } | null {
  if (done) return { text: "All done ✓", colorCn: "text-green-600" }
  if (phase === "fill") {
    return { text: `Filling [${insertPos}] with 0`, colorCn: "text-blue-500" }
  }
  if (fastIdx >= nums.length) return null
  const val = nums[fastIdx]
  if (val !== 0) {
    return {
      text: `nums[${fastIdx}]=${val} → writing to [${insertPos}]`,
      colorCn: "text-purple-500",
    }
  }
  return { text: `nums[${fastIdx}]=0 → skipping`, colorCn: "text-muted-foreground" }
}

function buildInitialState(nums: number[]): AlgoState {
  return {
    nums: [...nums],
    insertPos: 0,
    fastIdx: 0,
    phase: "scan",
    done: false,
    stepCount: 0,
    log: [
      {
        id: nextId(),
        text: `Starting: insertPos=0, i=0. Scanning for non-zero elements.`,
        type: "info",
      },
    ],
    statusInfo: computeStatusInfo(0, 0, nums, "scan", false),
    justPlaced: null,
  }
}

function advanceStep(prev: AlgoState): AlgoState {
  if (prev.done) return prev

  const nums = [...prev.nums]
  const { insertPos, fastIdx, phase, stepCount, log } = prev
  const step = stepCount + 1

  // ── Phase: fill ──────────────────────────────────────────────────────────
  if (phase === "fill") {
    if (insertPos >= nums.length) {
      return {
        ...prev,
        done: true,
        statusInfo: { text: "All done ✓", colorCn: "text-green-600" },
        log: [...log, { id: nextId(), text: "Done ✓", type: "done" }],
        justPlaced: null,
      }
    }
    nums[insertPos] = 0
    const newInsert = insertPos + 1
    const nowDone = newInsert >= nums.length
    return {
      ...prev,
      nums,
      insertPos: newInsert,
      stepCount: step,
      done: nowDone,
      justPlaced: null,
      log: [
        ...log,
        {
          id: nextId(),
          text: `Step ${step}: nums[${insertPos}] = 0 (fill)`,
          type: "fill",
        },
        ...(nowDone ? [{ id: nextId(), text: "Done ✓", type: "done" as const }] : []),
      ],
      statusInfo: nowDone
        ? { text: "All done ✓", colorCn: "text-green-600" }
        : { text: `Filling [${newInsert}] with 0`, colorCn: "text-blue-500" },
    }
  }

  // ── Phase: scan ──────────────────────────────────────────────────────────
  if (fastIdx >= nums.length) {
    // Scan done — switch to fill
    const noFillNeeded = insertPos >= nums.length
    if (noFillNeeded) {
      return {
        ...prev,
        done: true,
        log: [...log, { id: nextId(), text: "Done ✓", type: "done" }],
        statusInfo: { text: "All done ✓", colorCn: "text-green-600" },
        justPlaced: null,
      }
    }
    return {
      ...prev,
      phase: "fill",
      stepCount: step,
      justPlaced: null,
      log: [
        ...log,
        { id: nextId(), text: "Phase 2: filling remaining positions with 0", type: "info" },
      ],
      statusInfo: { text: `Filling [${insertPos}] with 0`, colorCn: "text-blue-500" },
    }
  }

  const val = nums[fastIdx]

  if (val !== 0) {
    // Place non-zero
    nums[insertPos] = val
    const newInsert = insertPos + 1
    const newFast = fastIdx + 1
    const scanDone = newFast >= nums.length
    const nextPhase: "scan" | "fill" = scanDone ? "fill" : "scan"
    const noFillNeeded = scanDone && newInsert >= nums.length

    return {
      ...prev,
      nums,
      insertPos: newInsert,
      fastIdx: newFast,
      phase: nextPhase,
      done: noFillNeeded,
      stepCount: step,
      justPlaced: insertPos,
      log: [
        ...log,
        {
          id: nextId(),
          text: `Step ${step}: nums[${fastIdx}]=${val} → placed at [${insertPos}]`,
          type: "place",
        },
        ...(scanDone && !noFillNeeded
          ? [{ id: nextId(), text: "Phase 2: filling remaining positions with 0", type: "info" as const }]
          : []),
        ...(noFillNeeded ? [{ id: nextId(), text: "Done ✓", type: "done" as const }] : []),
      ],
      statusInfo: noFillNeeded
        ? { text: "All done ✓", colorCn: "text-green-600" }
        : scanDone
          ? { text: `Filling [${newInsert}] with 0`, colorCn: "text-blue-500" }
          : computeStatusInfo(newInsert, newFast, nums, "scan", false),
    }
  }

  // Skip zero
  const newFast = fastIdx + 1
  const scanDone = newFast >= nums.length
  const nextPhase: "scan" | "fill" = scanDone ? "fill" : "scan"
  const noFillNeeded = scanDone && insertPos >= nums.length

  return {
    ...prev,
    nums,
    fastIdx: newFast,
    phase: nextPhase,
    done: noFillNeeded,
    stepCount: step,
    justPlaced: null,
    log: [
      ...log,
      {
        id: nextId(),
        text: `Step ${step}: nums[${fastIdx}]=0 → skip`,
        type: "skip",
      },
      ...(scanDone && !noFillNeeded
        ? [{ id: nextId(), text: "Phase 2: filling remaining positions with 0", type: "info" as const }]
        : []),
      ...(noFillNeeded ? [{ id: nextId(), text: "Done ✓", type: "done" as const }] : []),
    ],
    statusInfo: noFillNeeded
      ? { text: "All done ✓", colorCn: "text-green-600" }
      : scanDone
        ? { text: `Filling [${insertPos}] with 0`, colorCn: "text-blue-500" }
        : computeStatusInfo(insertPos, newFast, nums, "scan", false),
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MoveZeroesVisualizer() {
  const [arrayInput, setArrayInput] = useState("0, 1, 0, 3, 12")
  const [state, setState] = useState<AlgoState>(() =>
    buildInitialState([0, 1, 0, 3, 12])
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { nums, insertPos, fastIdx, phase, done, log, statusInfo, justPlaced } = state

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const stopAuto = useCallback(() => {
    if (autoRef.current) {
      clearInterval(autoRef.current)
      autoRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const init = useCallback(() => {
    const parsed = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n))
    if (parsed.length < 1) return
    stopAuto()
    setState(buildInitialState(parsed))
  }, [arrayInput, stopAuto])

  const step = useCallback(() => {
    setState((prev) => {
      const next = advanceStep(prev)
      if (next.justPlaced !== null) {
        setTimeout(() => setState((s) => ({ ...s, justPlaced: null })), 400)
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
        if (next.justPlaced !== null) {
          setTimeout(() => setState((s) => ({ ...s, justPlaced: null })), 400)
        }
        if (next.done) stopAuto()
        return next
      })
    }, 900)
  }, [done, stopAuto])

  // Re-init on input change (debounced)
  useEffect(() => {
    const id = setTimeout(init, 400)
    return () => clearTimeout(id)
  }, [arrayInput]) // eslint-disable-line

  // Scroll log to bottom
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  // Cleanup
  useEffect(() => () => stopAuto(), [stopAuto])

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        Move Zeroes — Slow / Fast Pointer Visualizer
      </h2>

      {/* Phase badge */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Phase:</span>
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-medium",
            phase === "scan"
              ? "bg-purple-500/10 text-purple-500"
              : "bg-blue-500/10 text-blue-500",
            done && "bg-green-500/10 text-green-600",
          )}
        >
          {done ? "Done" : phase === "scan" ? "1 — Scan & Place" : "2 — Fill Zeros"}
        </span>
      </div>

      {/* Input */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground">Array</label>
        <Input
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
          className="w-64 font-mono"
        />
        <Button variant="outline" size="sm" onClick={init}>
          Reset ↺
        </Button>
      </div>

      {/* Array cells */}
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {nums.map((n, i) => (
          <Cell
            key={i}
            value={n}
            index={i}
            insertPos={insertPos}
            fastIdx={fastIdx}
            done={done}
            phase={phase}
            justPlaced={justPlaced === i}
          />
        ))}
      </div>

      {/* Status info bar */}
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
        <Button variant="outline" size="sm" onClick={step} disabled={done}>
          Step →
        </Button>
        <Button variant="outline" size="sm" onClick={toggleAuto} disabled={done}>
          {isPlaying ? "Pause ⏸" : "Auto-play ▶"}
        </Button>
        <Button variant="outline" size="sm" onClick={init}>
          Reset ↺
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { colorCn: "bg-purple-500", label: "S — insertPos (write head)" },
          { colorCn: "bg-blue-500", label: "F — i (scanner)" },
          { colorCn: "bg-green-500", label: "Placed non-zero" },
          { colorCn: "bg-muted border border-border", label: "Filled zero" },
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
