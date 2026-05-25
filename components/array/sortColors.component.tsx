"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ────────────────────────────────────────────────────────────────────

type LogType = "info" | "swap-low" | "skip-one" | "swap-high" | "done"

interface LogEntry {
  id: number
  text: string
  type: LogType
}

interface AlgoState {
  nums: number[]
  low: number
  mid: number
  high: number
  done: boolean
  stepCount: number
  log: LogEntry[]
  actionInfo: { text: string; colorCn: string } | null
  justSwapped: [number, number] | null
}

// ─── Log colors ───────────────────────────────────────────────────────────────

const LOG_COLOR: Record<LogType, string> = {
  info:        "text-muted-foreground",
  "swap-low":  "text-green-600",
  "skip-one":  "text-blue-500",
  "swap-high": "text-orange-500",
  done:        "text-green-600",
}

// ─── Region helper ────────────────────────────────────────────────────────────

type Region = "zero" | "one" | "two" | "unsorted"

function getRegion(index: number, low: number, mid: number, high: number, done: boolean, val: number): Region {
  if (done) return val === 0 ? "zero" : val === 1 ? "one" : "two"
  if (index < low) return "zero"
  if (index >= low && index < mid) return "one"
  if (index > high) return "two"
  return "unsorted"
}

// ─── Cell component ───────────────────────────────────────────────────────────

interface CellProps {
  value: number
  index: number
  isLow: boolean
  isMid: boolean
  isHigh: boolean
  region: Region
  justSwapped: boolean
  done: boolean
}

function Cell({ value, index, isLow, isMid, isHigh, region, justSwapped, done }: CellProps) {
  const isMidHigh = isMid && isHigh
  const isMidLow = isMid && isLow

  const lowLabel = isLow ? "low" : null
  const midHighLabel = isMidHigh ? "mid/high" : isMid ? "mid" : isHigh ? "high" : null

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* low label row */}
      <div
        className={cn(
          "h-4.5 text-[11px] font-semibold",
          isLow ? "text-green-600" : "text-transparent",
        )}
      >
        {lowLabel ?? "·"}
      </div>

      {/* mid / high label row */}
      <div
        className={cn(
          "h-4.5 text-[11px] font-semibold",
          isMidHigh && "text-violet-500",
          !isMidHigh && isMid && "text-blue-500",
          !isMidHigh && !isMid && isHigh && "text-orange-500",
          !isMid && !isHigh && "text-transparent",
        )}
      >
        {midHighLabel ?? "·"}
      </div>

      <motion.div
        animate={justSwapped ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex size-14 flex-col items-center justify-center rounded-lg border",
          "transition-colors duration-200 select-none cursor-default",
          // Pointer priority (first match wins)
          (isMidLow || isMidHigh) && "border-violet-500 bg-violet-500 text-white",
          !isMidLow && !isMidHigh && isLow && "border-green-500 bg-green-500 text-white",
          !isMidLow && !isMidHigh && !isLow && isMid && "border-blue-500 bg-blue-500 text-white",
          !isMidLow && !isMidHigh && !isLow && !isMid && isHigh && "border-orange-500 bg-orange-500 text-white",
          // Region tints (fallback when no pointer)
          !isLow && !isMid && !isHigh && region === "zero" && !done && "border-green-500/40 bg-green-500/15 text-green-700",
          !isLow && !isMid && !isHigh && region === "one" && !done && "border-blue-500/40 bg-blue-500/15 text-blue-700",
          !isLow && !isMid && !isHigh && region === "two" && !done && "border-orange-500/40 bg-orange-500/15 text-orange-700",
          !isLow && !isMid && !isHigh && region === "unsorted" && "border-border bg-background text-foreground",
          // Done state — full region color
          done && region === "zero" && "border-green-500 bg-green-500/20 text-green-700",
          done && region === "one" && "border-blue-500 bg-blue-500/20 text-blue-700",
          done && region === "two" && "border-orange-500 bg-orange-500/20 text-orange-700",
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

function buildInitialState(input: number[]): AlgoState {
  // Filter to only valid values 0/1/2
  const nums = input.filter((v) => v === 0 || v === 1 || v === 2)
  const n = nums.length
  return {
    nums,
    low: 0,
    mid: 0,
    high: n - 1,
    done: false,
    stepCount: 0,
    log: [
      {
        id: nextId(),
        text: `Starting: low=0, mid=0, high=${n - 1}. Array: [${nums.join(", ")}]`,
        type: "info",
      },
    ],
    actionInfo: null,
    justSwapped: null,
  }
}

function advanceStep(prev: AlgoState): AlgoState {
  if (prev.done) return prev

  const { nums: prevNums, low, mid, high, stepCount, log } = prev
  const step = stepCount + 1
  const nums = [...prevNums]
  const val = nums[mid]

  if (val === 0) {
    // Swap nums[low] ↔ nums[mid], then low++, mid++
    const oldLow = low
    const oldMid = mid
    ;[nums[low], nums[mid]] = [nums[mid], nums[low]]
    const newLow = low + 1
    const newMid = mid + 1
    const isDone = newMid > high

    const newLog: LogEntry[] = [
      ...log,
      {
        id: nextId(),
        text: `Step ${step}: nums[mid]=${val} → swap [${oldMid}]↔[${oldLow}], low=${newLow}, mid=${newMid}`,
        type: "swap-low",
      },
      ...(isDone ? [{ id: nextId(), text: "Done! Array sorted.", type: "done" as LogType }] : []),
    ]

    return {
      ...prev,
      nums,
      low: newLow,
      mid: newMid,
      done: isDone,
      stepCount: step,
      log: newLog,
      actionInfo: { text: `0 at mid[${oldMid}] → swap to low region`, colorCn: "text-green-600" },
      justSwapped: [oldLow, oldMid],
    }
  }

  if (val === 1) {
    // Just mid++
    const newMid = mid + 1
    const isDone = newMid > high

    const newLog: LogEntry[] = [
      ...log,
      {
        id: nextId(),
        text: `Step ${step}: nums[mid]=${val} → already in place, mid=${newMid}`,
        type: "skip-one",
      },
      ...(isDone ? [{ id: nextId(), text: "Done! Array sorted.", type: "done" as LogType }] : []),
    ]

    return {
      ...prev,
      nums,
      mid: newMid,
      done: isDone,
      stepCount: step,
      log: newLog,
      actionInfo: { text: `1 at mid[${mid}] → already in place, mid++`, colorCn: "text-blue-500" },
      justSwapped: null,
    }
  }

  // val === 2: swap nums[mid] ↔ nums[high], high-- (mid does NOT advance)
  const oldMid = mid
  const oldHigh = high
  ;[nums[mid], nums[high]] = [nums[high], nums[mid]]
  const newHigh = high - 1
  const isDone = mid > newHigh

  const newLog: LogEntry[] = [
    ...log,
    {
      id: nextId(),
      text: `Step ${step}: nums[mid]=${val} → swap [${oldMid}]↔[${oldHigh}], high=${newHigh}`,
      type: "swap-high",
    },
    ...(isDone ? [{ id: nextId(), text: "Done! Array sorted.", type: "done" as LogType }] : []),
  ]

  return {
    ...prev,
    nums,
    high: newHigh,
    done: isDone,
    stepCount: step,
    log: newLog,
    actionInfo: { text: `2 at mid[${oldMid}] → swap to high region`, colorCn: "text-orange-500" },
    justSwapped: [oldMid, oldHigh],
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULT_NUMS = [2, 0, 2, 1, 1, 0]
const DEFAULT_INPUT = "2, 0, 2, 1, 1, 0"

export default function SortColorsVisualizer() {
  const [arrayInput, setArrayInput] = useState(DEFAULT_INPUT)
  const [state, setState] = useState<AlgoState>(() => buildInitialState(DEFAULT_NUMS))
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { nums, low, mid, high, done, log, actionInfo, justSwapped } = state

  // ─── Actions ──────────────────────────────────────────────────────────────

  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null }
    setIsPlaying(false)
  }, [])

  const init = useCallback(() => {
    const parsed = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => n === 0 || n === 1 || n === 2)
    if (parsed.length < 2) return
    stopAuto()
    setState(buildInitialState(parsed))
  }, [arrayInput, stopAuto])

  const step = useCallback(() => {
    setState((prev) => {
      const next = advanceStep(prev)
      if (next.justSwapped !== null) {
        setTimeout(() => setState((s) => ({ ...s, justSwapped: null })), 400)
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
        if (next.justSwapped !== null) {
          setTimeout(() => setState((s) => ({ ...s, justSwapped: null })), 400)
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

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        Sort Colors — Dutch National Flag Visualizer
      </h2>

      {/* Inputs */}
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground">Array</label>
        <Input
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
          className="w-64 font-mono"
        />
        <Button variant="outline" size="sm" onClick={init}>Reset ↺</Button>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">Values must be 0, 1, or 2 (other values are ignored)</p>

      {/* Array cells */}
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {nums.map((n, idx) => (
          <Cell
            key={idx}
            value={n}
            index={idx}
            isLow={idx === low}
            isMid={idx === mid}
            isHigh={idx === high}
            region={getRegion(idx, low, mid, high, done, n)}
            justSwapped={justSwapped !== null && (justSwapped[0] === idx || justSwapped[1] === idx)}
            done={done}
          />
        ))}
      </div>

      {/* Action info bar */}
      <div className="mb-3 flex min-h-7 items-center justify-center">
        <AnimatePresence mode="wait">
          {actionInfo && (
            <motion.span
              key={actionInfo.text}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("text-sm font-medium", actionInfo.colorCn)}
              dangerouslySetInnerHTML={{ __html: actionInfo.text }}
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
          { colorCn: "bg-green-500", label: "0 region / low" },
          { colorCn: "bg-blue-500",  label: "1 region / mid" },
          { colorCn: "bg-orange-500",label: "2 region / high" },
          { colorCn: "bg-violet-500",label: "Pointers overlap" },
          { colorCn: "bg-background border border-border", label: "Unsorted" },
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
