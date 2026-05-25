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
  type: "info" | "move-left" | "move-right" | "found" | "none"
}

interface AlgoState {
  nums: number[]
  target: number
  left: number
  right: number
  done: boolean
  stepCount: number
  log: LogEntry[]
  sumInfo: { text: string; colorCn: string } | null
  justMoved: number | null
}

// ─── Cell component ───────────────────────────────────────────────────────────

interface CellProps {
  value: number
  index: number
  isLeft: boolean
  isRight: boolean
  isFound: boolean
  justMoved: boolean
}

function Cell({ value, index, isLeft, isRight, isFound, justMoved }: CellProps) {
  const isMatch = isFound && (isLeft || isRight)
  const isBoth = isLeft && isRight && !isFound

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "h-[18px] text-[11px] font-semibold",
          isBoth && "text-violet-500",
          !isBoth && isLeft && "text-blue-500",
          !isBoth && isRight && "text-orange-500",
        )}
      >
        {isBoth && "L = R"}
        {isLeft && !isRight && !isFound && "L"}
        {isRight && !isLeft && !isFound && "R"}
      </div>
      <motion.div
        animate={justMoved ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex size-14 flex-col items-center justify-center rounded-lg border transition-colors duration-200 select-none cursor-default",
          isMatch && "border-green-500 bg-green-500 text-white",
          isBoth && "border-violet-500 bg-violet-500 text-white",
          !isMatch && !isBoth && isLeft && "border-blue-500 bg-blue-500 text-white",
          !isMatch && !isBoth && isRight && "border-orange-500 bg-orange-500 text-white",
          !isMatch && !isBoth && !isLeft && !isRight && "border-border bg-background text-foreground",
        )}
      >
        <span className="text-lg font-semibold leading-none">{value}</span>
        <span className="mt-0.5 text-[10px] opacity-60">[{index}]</span>
      </motion.div>
    </div>
  )
}

// ─── Log line component ───────────────────────────────────────────────────────

const LOG_COLOR: Record<LogEntry["type"], string> = {
  info: "text-muted-foreground",
  "move-left": "text-blue-500",
  "move-right": "text-orange-500",
  found: "text-green-600",
  none: "text-muted-foreground",
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeSumInfo(
  l: number,
  r: number,
  n: number[],
  t: number,
): { text: string; colorCn: string } | null {
  if (l >= r) return null
  const sum = n[l] + n[r]
  if (sum < t) return { text: `${n[l]} + ${n[r]} = ${sum} &lt; ${t} → move L right`, colorCn: "text-blue-500" }
  if (sum > t) return { text: `${n[l]} + ${n[r]} = ${sum} &gt; ${t} → move R left`, colorCn: "text-orange-500" }
  return { text: `${n[l]} + ${n[r]} = ${sum} = ${t} ✓`, colorCn: "text-green-600" }
}

let _logId = 0
function nextId() { return ++_logId }

function buildInitialState(nums: number[], target: number): AlgoState {
  return {
    nums,
    target,
    left: 0,
    right: nums.length - 1,
    done: false,
    stepCount: 0,
    log: [{ id: nextId(), text: `Starting: target = <b>${target}</b>. L=0, R=${nums.length - 1}`, type: "info" }],
    sumInfo: computeSumInfo(0, nums.length - 1, nums, target),
    justMoved: null,
  }
}

function advanceStep(prev: AlgoState): AlgoState {
  const { nums, target, left: l, right: r, done, stepCount, log } = prev
  if (done || l >= r) return prev

  const step = stepCount + 1
  const sum = nums[l] + nums[r]

  if (sum === target) {
    return {
      ...prev,
      done: true,
      stepCount: step,
      log: [
        ...log,
        {
          id: nextId(),
          text: `Step ${step}: ${nums[l]} + ${nums[r]} = ${sum} = ${target} 🎯 Answer: [${l + 1}, ${r + 1}]`,
          type: "found",
        },
      ],
      sumInfo: { text: `Found! [${l + 1}, ${r + 1}] (1-indexed)`, colorCn: "text-green-600" },
      justMoved: null,
    }
  }

  if (sum < target) {
    const newLeft = l + 1
    const crossed = newLeft >= r
    return {
      ...prev,
      left: newLeft,
      done: crossed,
      stepCount: step,
      justMoved: newLeft,
      log: [
        ...log,
        {
          id: nextId(),
          text: `Step ${step}: ${nums[l]}+${nums[r]}=${sum} &lt; ${target} → L moves right`,
          type: "move-left",
        },
        ...(crossed
          ? [{ id: nextId(), text: "Pointers crossed — no solution.", type: "none" as const }]
          : []),
      ],
      sumInfo: crossed ? null : computeSumInfo(newLeft, r, nums, target),
    }
  }

  // sum > target
  const newRight = r - 1
  const crossed = l >= newRight
  return {
    ...prev,
    right: newRight,
    done: crossed,
    stepCount: step,
    justMoved: newRight,
    log: [
      ...log,
      {
        id: nextId(),
        text: `Step ${step}: ${nums[l]}+${nums[r]}=${sum} &gt; ${target} → R moves left`,
        type: "move-right",
      },
      ...(crossed
        ? [{ id: nextId(), text: "Pointers crossed — no solution.", type: "none" as const }]
        : []),
    ],
    sumInfo: crossed ? null : computeSumInfo(l, newRight, nums, target),
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TwoSumVisualizer() {
  const [arrayInput, setArrayInput] = useState("2, 7, 11, 15")
  const [targetInput, setTargetInput] = useState("9")
  const [state, setState] = useState<AlgoState>(() =>
    buildInitialState([2, 7, 11, 15], 9)
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { nums, left, right, done, log, sumInfo, justMoved } = state

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
    const t = parseInt(targetInput)
    if (parsed.length < 2 || isNaN(t)) return
    stopAuto()
    setState(buildInitialState(parsed, t))
  }, [arrayInput, targetInput, stopAuto])

  const step = useCallback(() => {
    setState((prev) => {
      const next = advanceStep(prev)
      // Clear justMoved after animation window
      if (next.justMoved !== null) {
        setTimeout(() => setState((s) => ({ ...s, justMoved: null })), 400)
      }
      return next
    })
  }, [])

  const toggleAuto = useCallback(() => {
    if (autoRef.current) {
      stopAuto()
      return
    }
    if (done) return
    setIsPlaying(true)
    autoRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.done || prev.left >= prev.right) {
          stopAuto()
          return prev
        }
        const next = advanceStep(prev)
        if (next.justMoved !== null) {
          setTimeout(() => setState((s) => ({ ...s, justMoved: null })), 400)
        }
        if (next.done) stopAuto()
        return next
      })
    }, 900)
  }, [done, stopAuto])

  // Re-init on input change (debounced 400ms so it waits for the user to finish typing)
  useEffect(() => {
    const id = setTimeout(init, 400)
    return () => clearTimeout(id)
  }, [arrayInput, targetInput]) // eslint-disable-line

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
        Two Sum II — Two Pointer Visualizer
      </h2>

      {/* Inputs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground">Array</label>
        <Input
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
          className="w-64 font-mono"
        />
        <label className="text-xs text-muted-foreground">Target</label>
        <Input
          value={targetInput}
          onChange={(e) => setTargetInput(e.target.value)}
          className="w-16 font-mono"
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
            isLeft={i === left}
            isRight={i === right}
            isFound={done}
            justMoved={justMoved === i}
          />
        ))}
      </div>

      {/* Sum bar */}
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
          { colorCn: "bg-blue-500", label: "Left pointer" },
          { colorCn: "bg-orange-500", label: "Right pointer" },
          { colorCn: "bg-green-500", label: "Match found" },
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
