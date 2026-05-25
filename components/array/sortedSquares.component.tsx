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
  type: "info" | "place-left" | "place-right" | "done"
}

interface AlgoState {
  nums: number[]
  result: (number | null)[]
  left: number
  right: number
  pos: number
  done: boolean
  stepCount: number
  log: LogEntry[]
  statusInfo: { text: string; colorCn: string } | null
  justPlaced: number | null // index in result[]
}

// ─── Input cell ───────────────────────────────────────────────────────────────

interface InputCellProps {
  value: number
  index: number
  left: number
  right: number
}

function InputCell({ value, index: i, left, right }: InputCellProps) {
  const isLeft = i === left
  const isRight = i === right
  const isBoth = isLeft && isRight
  const isConsumed = i < left || i > right

  const labelCn = cn(
    "h-[18px] text-[11px] font-semibold",
    isBoth && "text-violet-500",
    !isBoth && isLeft && "text-blue-500",
    !isBoth && isRight && "text-orange-500",
  )

  const cellCn = cn(
    "flex size-14 flex-col items-center justify-center rounded-lg border transition-colors duration-200 select-none cursor-default",
    isConsumed && "border-border bg-muted text-muted-foreground",
    !isConsumed && isBoth && "border-violet-500 bg-violet-500 text-white",
    !isConsumed && !isBoth && isLeft && "border-blue-500 bg-blue-500 text-white",
    !isConsumed && !isBoth && isRight && "border-orange-500 bg-orange-500 text-white",
    !isConsumed && !isLeft && !isRight && "border-border bg-background text-foreground",
  )

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={labelCn}>
        {isBoth && "L=R"}
        {!isBoth && isLeft && "L"}
        {!isBoth && isRight && "R"}
      </div>
      <div className={cellCn}>
        <span className={cn("text-lg font-semibold leading-none", isConsumed && "opacity-50")}>
          {value}
        </span>
        <span className="mt-0.5 text-[10px] opacity-60">[{i}]</span>
      </div>
    </div>
  )
}

// ─── Result cell ──────────────────────────────────────────────────────────────

interface ResultCellProps {
  value: number | null
  index: number
  pos: number
  done: boolean
  justPlaced: boolean
}

function ResultCell({ value, index: i, pos, done, justPlaced }: ResultCellProps) {
  const isFilled = value !== null
  const isPos = i === pos && !done

  return (
    <div className="flex flex-col items-center gap-1">
      {/* pos indicator above — same height as input pointer label */}
      <div className="h-[18px] text-[11px] font-semibold text-green-600">
        {isPos && "pos"}
      </div>
      <motion.div
        animate={justPlaced ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex size-14 flex-col items-center justify-center rounded-lg border transition-colors duration-200 select-none cursor-default",
          isFilled && "border-green-500 bg-green-500 text-white",
          !isFilled && "border-dashed border-border bg-background opacity-40",
        )}
      >
        <span className="text-base font-semibold leading-none">
          {isFilled ? value : "?"}
        </span>
        <span className="mt-0.5 text-[10px] opacity-60">[{i}]</span>
      </motion.div>
    </div>
  )
}

// ─── Log line ─────────────────────────────────────────────────────────────────

const LOG_COLOR: Record<LogEntry["type"], string> = {
  info: "text-muted-foreground",
  "place-left": "text-blue-500",
  "place-right": "text-orange-500",
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
  left: number,
  right: number,
  nums: number[],
  done: boolean,
  result: (number | null)[],
): { text: string; colorCn: string } | null {
  if (done) {
    const filled = result.filter((v) => v !== null) as number[]
    return { text: `Done ✓ &nbsp; [${filled.join(", ")}]`, colorCn: "text-green-600" }
  }
  if (left > right) return null
  const lv = nums[left]
  const rv = nums[right]
  const lSq = lv * lv
  const rSq = rv * rv
  if (lSq > rSq) {
    return {
      text: `|${lv}|²=${lSq} &gt; |${rv}|²=${rSq} → place <b>${lSq}</b>`,
      colorCn: "text-blue-500",
    }
  }
  return {
    text: `|${rv}|²=${rSq} &ge; |${lv}|²=${lSq} → place <b>${rSq}</b>`,
    colorCn: "text-orange-500",
  }
}

function buildInitialState(nums: number[]): AlgoState {
  const n = nums.length
  if (n === 0) {
    return {
      nums: [],
      result: [],
      left: 0,
      right: -1,
      pos: -1,
      done: true,
      stepCount: 0,
      log: [{ id: nextId(), text: "Empty array.", type: "done" }],
      statusInfo: { text: "Done ✓ []", colorCn: "text-green-600" },
      justPlaced: null,
    }
  }

  const result: (number | null)[] = new Array(n).fill(null)
  return {
    nums: [...nums],
    result,
    left: 0,
    right: n - 1,
    pos: n - 1,
    done: false,
    stepCount: 0,
    log: [
      {
        id: nextId(),
        text: `Starting: L=0, R=${n - 1}, pos=${n - 1}. Largest squares come from the extremes.`,
        type: "info",
      },
    ],
    statusInfo: computeStatusInfo(0, n - 1, nums, false, result),
    justPlaced: null,
  }
}

function advanceStep(prev: AlgoState): AlgoState {
  if (prev.done) return prev

  const { nums, left, right, pos, stepCount, log } = prev
  const result = [...prev.result]
  const step = stepCount + 1

  if (left > right) {
    return {
      ...prev,
      result,
      done: true,
      stepCount: step,
      justPlaced: null,
      log: [...log, { id: nextId(), text: "Done ✓", type: "done" }],
      statusInfo: computeStatusInfo(left, right, nums, true, result),
    }
  }

  const lv = nums[left]
  const rv = nums[right]
  const leftSq = lv * lv
  const rightSq = rv * rv

  if (leftSq > rightSq) {
    result[pos] = leftSq
    const newLeft = left + 1
    const newPos = pos - 1
    const nowDone = newLeft > right

    return {
      ...prev,
      result,
      left: newLeft,
      pos: newPos,
      done: nowDone,
      stepCount: step,
      justPlaced: pos,
      log: [
        ...log,
        {
          id: nextId(),
          text: `Step ${step}: |${lv}|²=${leftSq} &gt; |${rv}|²=${rightSq} → place <b>${leftSq}</b> at result[${pos}]`,
          type: "place-left",
        },
        ...(nowDone ? [{ id: nextId(), text: "Done ✓", type: "done" as const }] : []),
      ],
      statusInfo: computeStatusInfo(newLeft, right, nums, nowDone, result),
    }
  }

  // rightSq >= leftSq
  result[pos] = rightSq
  const newRight = right - 1
  const newPos = pos - 1
  const nowDone = left > newRight

  return {
    ...prev,
    result,
    right: newRight,
    pos: newPos,
    done: nowDone,
    stepCount: step,
    justPlaced: pos,
    log: [
      ...log,
      {
        id: nextId(),
        text: `Step ${step}: |${rv}|²=${rightSq} &ge; |${lv}|²=${leftSq} → place <b>${rightSq}</b> at result[${pos}]`,
        type: "place-right",
      },
      ...(nowDone ? [{ id: nextId(), text: "Done ✓", type: "done" as const }] : []),
    ],
    statusInfo: computeStatusInfo(left, newRight, nums, nowDone, result),
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SortedSquaresVisualizer() {
  const [arrayInput, setArrayInput] = useState("-4, -1, 0, 3, 10")
  const [state, setState] = useState<AlgoState>(() =>
    buildInitialState([-4, -1, 0, 3, 10])
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { nums, result, left, right, pos, done, log, statusInfo, justPlaced } = state

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null }
    setIsPlaying(false)
  }, [])

  const init = useCallback(() => {
    // Allow negatives — only strip NaN
    const parsed = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
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
        Squares of Sorted Array — Two Pointer Visualizer
      </h2>

      {/* Input */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground">Array</label>
        <Input
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
          className="w-64 font-mono"
          placeholder="sorted, e.g. -4, -1, 0, 3, 10"
        />
        <Button variant="outline" size="sm" onClick={init}>Reset ↺</Button>
      </div>

      {/* INPUT row */}
      <div className="mb-1">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Input
        </p>
        <div className="flex flex-wrap gap-2">
          {nums.map((n, i) => (
            <InputCell key={i} value={n} index={i} left={left} right={right} />
          ))}
        </div>
      </div>

      {/* RESULT row */}
      <div className="mb-3 mt-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Result
        </p>
        <div className="flex flex-wrap gap-2">
          {result.map((v, i) => (
            <ResultCell
              key={i}
              value={v}
              index={i}
              pos={pos}
              done={done}
              justPlaced={justPlaced === i}
            />
          ))}
        </div>
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
        <Button variant="outline" size="sm" onClick={step} disabled={done}>Step →</Button>
        <Button variant="outline" size="sm" onClick={toggleAuto} disabled={done}>
          {isPlaying ? "Pause ⏸" : "Auto-play ▶"}
        </Button>
        <Button variant="outline" size="sm" onClick={init}>Reset ↺</Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { colorCn: "bg-blue-500", label: "L — left pointer" },
          { colorCn: "bg-orange-500", label: "R — right pointer" },
          { colorCn: "bg-muted border border-border", label: "Consumed input" },
          { colorCn: "bg-green-500", label: "Placed square" },
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
