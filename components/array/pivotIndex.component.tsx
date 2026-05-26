"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ────────────────────────────────────────────────────────────────────

type LogType = "info" | "check" | "found" | "no-pivot"

interface LogEntry {
  id: number
  text: string
  type: LogType
}

interface AlgoState {
  nums: number[]
  totalSum: number
  current: number          // index being checked (0..n-1)
  leftSum: number          // sum of nums[0..current-1]
  done: boolean
  pivotIndex: number | null  // set when found; -1 when exhausted with no pivot
  log: LogEntry[]
  statusInfo: { text: string; colorCn: string } | null
  justMoved: number | null
  stepCount: number
}

// ─── Log colors ───────────────────────────────────────────────────────────────

const LOG_COLOR: Record<LogType, string> = {
  info:       "text-muted-foreground",
  check:      "text-blue-500",
  found:      "text-green-600",
  "no-pivot": "text-red-500",
}

// ─── Cell component ───────────────────────────────────────────────────────────

interface CellProps {
  value: number
  index: number
  isCurrent: boolean   // currently being checked
  isPivot: boolean     // done && this is the pivot
  isNoMatch: boolean   // done && no pivot found
  isLeft: boolean      // already scanned (index < current)
  justMoved: boolean
}

function Cell({ value, index, isCurrent, isPivot, isNoMatch, isLeft, justMoved }: CellProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Pointer label — fixed height so cells don't shift */}
      <div className={cn(
        "h-4.5 text-[11px] font-semibold",
        isPivot && "text-green-600",
        isCurrent && !isPivot && "text-blue-500",
      )}>
        {isPivot ? "PIVOT" : isCurrent ? "i" : ""}
      </div>

      <motion.div
        animate={justMoved ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex size-14 flex-col items-center justify-center rounded-lg border",
          "transition-colors duration-200 select-none cursor-default",
          // Priority: pivot > no-match > current > already-scanned > neutral
          isPivot && "border-green-500 bg-green-500 text-white",
          !isPivot && isNoMatch && "border-red-500 bg-red-500/20 text-red-600",
          !isPivot && !isNoMatch && isCurrent && "border-blue-500 bg-blue-500 text-white",
          !isPivot && !isNoMatch && !isCurrent && isLeft && "border-border bg-muted/50 text-muted-foreground",
          !isPivot && !isNoMatch && !isCurrent && !isLeft && "border-border bg-background text-foreground",
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

function buildInitialState(nums: number[]): AlgoState {
  const totalSum = nums.reduce((a, b) => a + b, 0)
  return {
    nums: [...nums],
    totalSum,
    current: 0,
    leftSum: 0,
    done: false,
    pivotIndex: null,
    log: [
      {
        id: nextId(),
        text: `Starting: totalSum = <b>${totalSum}</b>, leftSum = 0`,
        type: "info",
      },
    ],
    statusInfo: null,
    justMoved: null,
    stepCount: 0,
  }
}

// Pure function — never mutates prev
function advanceStep(prev: AlgoState): AlgoState {
  if (prev.done) return prev
  const { nums, current, leftSum, totalSum, log, stepCount } = prev
  if (current >= nums.length) return prev

  const rightSum = totalSum - leftSum - nums[current]
  const step = stepCount + 1
  const isPivot = leftSum === rightSum

  if (isPivot) {
    return {
      ...prev,
      done: true,
      pivotIndex: current,
      stepCount: step,
      log: [
        ...log,
        {
          id: nextId(),
          text: `i=${current}: leftSum=<b>${leftSum}</b>, rightSum=<b>${rightSum}</b> → equal!`,
          type: "check",
        },
        {
          id: nextId(),
          text: `Pivot index = <b>${current}</b>`,
          type: "found",
        },
      ],
      statusInfo: { text: `Pivot at index <b>${current}</b>`, colorCn: "text-green-600" },
      justMoved: current,
    }
  }

  const nextIdx = current + 1
  const isDone = nextIdx >= nums.length

  return {
    ...prev,
    current: nextIdx,
    leftSum: leftSum + nums[current],
    done: isDone,
    pivotIndex: isDone ? -1 : null,
    stepCount: step,
    log: [
      ...log,
      {
        id: nextId(),
        text: `i=${current}: leftSum=${leftSum}, rightSum=${rightSum} → not equal, continue`,
        type: "check",
      },
      ...(isDone
        ? [{ id: nextId(), text: "No pivot found — return <b>-1</b>", type: "no-pivot" as LogType }]
        : []),
    ],
    statusInfo: isDone ? { text: "No pivot found — return <b>-1</b>", colorCn: "text-red-500" } : null,
    justMoved: nextIdx < nums.length ? nextIdx : null,
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PivotIndexVisualizer() {
  const [arrayInput, setArrayInput] = useState("1, 7, 3, 6, 5, 6")
  const [state, setState] = useState<AlgoState>(() =>
    buildInitialState([1, 7, 3, 6, 5, 6])
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { nums, current, leftSum, totalSum, done, pivotIndex, log, statusInfo, justMoved } = state

  // Compute rightSum for the stats row (null when scan is done)
  const currentRightSum = (!done && current < nums.length)
    ? totalSum - leftSum - nums[current]
    : null

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
    if (parsed.length < 1) return
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

  // Re-init 400ms after input changes
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

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        Pivot Index — Prefix Sum Visualizer
      </h2>

      {/* Array input */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground">nums</label>
        <Input
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
          className="w-64 font-mono"
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
            isCurrent={!done && i === current}
            isPivot={done && pivotIndex === i}
            isNoMatch={done && pivotIndex === -1}
            isLeft={i < current && !(done && pivotIndex === i)}
            justMoved={justMoved === i}
          />
        ))}
      </div>

      {/* Stats row — live leftSum / nums[i] / rightSum */}
      <div className="mb-3 flex min-h-7 items-center justify-center gap-6 text-xs">
        {!done && current < nums.length ? (
          <>
            <span>
              <span className="text-muted-foreground">leftSum = </span>
              <span className="font-mono font-semibold text-blue-500">{leftSum}</span>
            </span>
            <span>
              <span className="text-muted-foreground">nums[{current}] = </span>
              <span className="font-mono font-semibold text-foreground">{nums[current]}</span>
            </span>
            <span>
              <span className="text-muted-foreground">rightSum = </span>
              <span className="font-mono font-semibold text-orange-500">{currentRightSum}</span>
            </span>
          </>
        ) : done && pivotIndex !== null && pivotIndex >= 0 ? (
          <span className="font-mono font-semibold text-green-600">
            leftSum = rightSum = {leftSum} ✓
          </span>
        ) : done && pivotIndex === -1 ? (
          <span className="font-mono font-semibold text-red-500">No pivot found</span>
        ) : null}
      </div>

      {/* Status bar */}
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
          { colorCn: "bg-blue-500", label: "Current index (i)" },
          { colorCn: "bg-muted border border-border", label: "Already scanned" },
          { colorCn: "bg-green-500", label: "Pivot found" },
          { colorCn: "bg-red-500/20 border border-red-500", label: "No pivot" },
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
