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
  type: "info" | "unique" | "duplicate" | "done"
}

interface AlgoState {
  nums: number[]
  insertPos: number
  fastIdx: number
  done: boolean
  resultLength: number | null
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
  justPlaced: boolean
}

function Cell({ value, index: i, insertPos, fastIdx, done, justPlaced }: CellProps) {
  const isSlow = i === insertPos
  const isFast = i === fastIdx
  const isBoth = isSlow && isFast
  const isConfirmed = i < insertPos  // already in unique region
  const isStale = done && i >= insertPos

  const labelCn = cn(
    "h-[18px] text-[11px] font-semibold",
    isBoth && "text-violet-500",
    !isBoth && isSlow && "text-purple-500",
    !isBoth && !isSlow && isFast && "text-blue-500",
  )

  const cellCn = cn(
    "flex size-14 flex-col items-center justify-center rounded-lg border transition-colors duration-200 select-none cursor-default",
    // priority: done states first
    isStale && "border-border bg-muted text-muted-foreground",
    // confirmed unique (green) — includes done && i < insertPos
    !isStale && isConfirmed && !isSlow && !isFast && "border-green-500 bg-green-500 text-white",
    // both pointers
    !isStale && isBoth && "border-violet-500 bg-violet-500 text-white",
    // fast only
    !isStale && !isBoth && isFast && !isConfirmed && "border-blue-500 bg-blue-500 text-white",
    // slow only
    !isStale && !isBoth && isSlow && !isConfirmed && "border-purple-500 bg-purple-500 text-white",
    // confirmed under a pointer
    !isStale && !isBoth && (isSlow || isFast) && isConfirmed && "border-green-500 bg-green-500 text-white",
    // neutral
    !isStale && !isConfirmed && !isSlow && !isFast && "border-border bg-background text-foreground",
  )

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={labelCn}>
        {isBoth && "S/F"}
        {!isBoth && isSlow && "S"}
        {!isBoth && !isSlow && isFast && "F"}
      </div>
      <motion.div
        animate={justPlaced ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cellCn}
      >
        <span className={cn("text-lg font-semibold leading-none", isStale && "line-through opacity-50")}>
          {value}
        </span>
        <span className="mt-0.5 text-[10px] opacity-60">[{i}]</span>
      </motion.div>
    </div>
  )
}

// ─── Log line ─────────────────────────────────────────────────────────────────

const LOG_COLOR: Record<LogEntry["type"], string> = {
  info: "text-muted-foreground",
  unique: "text-purple-500",
  duplicate: "text-muted-foreground",
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
  done: boolean,
  resultLength: number | null,
): { text: string; colorCn: string } | null {
  if (done) {
    return { text: `Done ✓ — ${resultLength} unique element(s)`, colorCn: "text-green-600" }
  }
  if (fastIdx >= nums.length) return null
  const val = nums[fastIdx]
  const prev = nums[fastIdx - 1]
  if (val !== prev) {
    return {
      text: `nums[${fastIdx}]=${val} &ne; prev → placing at [${insertPos}]`,
      colorCn: "text-purple-500",
    }
  }
  return {
    text: `nums[${fastIdx}]=${val} = prev → duplicate, skip`,
    colorCn: "text-muted-foreground",
  }
}

function buildInitialState(nums: number[]): AlgoState {
  if (nums.length === 0) {
    return {
      nums: [],
      insertPos: 0,
      fastIdx: 0,
      done: true,
      resultLength: 0,
      stepCount: 0,
      log: [{ id: nextId(), text: "Empty array — length is 0.", type: "done" }],
      statusInfo: { text: "Done ✓ — 0 unique element(s)", colorCn: "text-green-600" },
      justPlaced: null,
    }
  }

  return {
    nums: [...nums],
    insertPos: 1,
    fastIdx: 1,
    done: nums.length === 1,
    resultLength: nums.length === 1 ? 1 : null,
    stepCount: 0,
    log: [
      {
        id: nextId(),
        text: `Starting: insertPos=1, i=1. First element [${nums[0]}] is always unique.`,
        type: "info",
      },
    ],
    statusInfo:
      nums.length === 1
        ? { text: "Done ✓ — 1 unique element(s)", colorCn: "text-green-600" }
        : computeStatusInfo(1, 1, nums, false, null),
    justPlaced: null,
  }
}

function advanceStep(prev: AlgoState): AlgoState {
  if (prev.done) return prev

  const { insertPos, fastIdx, stepCount, log } = prev
  const nums = [...prev.nums]
  const step = stepCount + 1

  // Termination
  if (fastIdx >= nums.length) {
    return {
      ...prev,
      nums,
      done: true,
      resultLength: insertPos,
      stepCount: step,
      justPlaced: null,
      log: [
        ...log,
        { id: nextId(), text: `Done ✓ — <b>${insertPos}</b> unique element(s)`, type: "done" },
      ],
      statusInfo: { text: `Done ✓ — ${insertPos} unique element(s)`, colorCn: "text-green-600" },
    }
  }

  const val = nums[fastIdx]
  const prevVal = nums[fastIdx - 1]

  if (val !== prevVal) {
    // Unique — place and advance both
    nums[insertPos] = val
    const newInsert = insertPos + 1
    const newFast = fastIdx + 1
    const nowDone = newFast >= nums.length

    return {
      ...prev,
      nums,
      insertPos: newInsert,
      fastIdx: newFast,
      done: nowDone,
      resultLength: nowDone ? newInsert : null,
      stepCount: step,
      justPlaced: insertPos,
      log: [
        ...log,
        {
          id: nextId(),
          text: `Step ${step}: nums[${fastIdx}]=${val} &ne; nums[${fastIdx - 1}]=${prevVal} → unique, placed at [${insertPos}]`,
          type: "unique",
        },
        ...(nowDone
          ? [{ id: nextId(), text: `Done ✓ — <b>${newInsert}</b> unique element(s)`, type: "done" as const }]
          : []),
      ],
      statusInfo: nowDone
        ? { text: `Done ✓ — ${newInsert} unique element(s)`, colorCn: "text-green-600" }
        : computeStatusInfo(newInsert, newFast, nums, false, null),
    }
  }

  // Duplicate — advance fast only
  const newFast = fastIdx + 1
  const nowDone = newFast >= nums.length

  return {
    ...prev,
    nums,
    fastIdx: newFast,
    done: nowDone,
    resultLength: nowDone ? insertPos : null,
    stepCount: step,
    justPlaced: null,
    log: [
      ...log,
      {
        id: nextId(),
        text: `Step ${step}: nums[${fastIdx}]=${val} = nums[${fastIdx - 1}]=${prevVal} → duplicate, skip`,
        type: "duplicate",
      },
      ...(nowDone
        ? [{ id: nextId(), text: `Done ✓ — <b>${insertPos}</b> unique element(s)`, type: "done" as const }]
        : []),
    ],
    statusInfo: nowDone
      ? { text: `Done ✓ — ${insertPos} unique element(s)`, colorCn: "text-green-600" }
      : computeStatusInfo(insertPos, newFast, nums, false, null),
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RemoveDuplicatesVisualizer() {
  const [arrayInput, setArrayInput] = useState("0, 0, 1, 1, 1, 2, 2, 3, 3, 4")
  const [state, setState] = useState<AlgoState>(() =>
    buildInitialState([0, 0, 1, 1, 1, 2, 2, 3, 3, 4])
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { nums, insertPos, fastIdx, done, resultLength, log, statusInfo, justPlaced } = state

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null }
    setIsPlaying(false)
  }, [])

  const init = useCallback(() => {
    const parsed = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n))
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

  // Re-init on input change (debounced 400ms)
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
        Remove Duplicates — Slow / Fast Pointer Visualizer
      </h2>

      {/* Input */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground">Array</label>
        <Input
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
          className="w-64 font-mono"
          placeholder="sorted, e.g. 0, 0, 1, 1, 2"
        />
        <Button variant="outline" size="sm" onClick={init}>Reset ↺</Button>
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

      {/* Result badge */}
      <AnimatePresence>
        {resultLength !== null && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2 text-center text-sm font-semibold text-green-600"
          >
            Length: {resultLength}
          </motion.div>
        )}
      </AnimatePresence>

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
          { colorCn: "bg-purple-500", label: "S — insertPos (write head)" },
          { colorCn: "bg-blue-500", label: "F — i (scanner)" },
          { colorCn: "bg-green-500", label: "Confirmed unique" },
          { colorCn: "bg-muted border border-border", label: "Stale duplicate (tail)" },
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
