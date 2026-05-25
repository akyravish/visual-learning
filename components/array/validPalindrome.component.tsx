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
  type: "info" | "match" | "mismatch" | "done-true" | "done-false"
}

interface AlgoState {
  nums: number[]
  left: number
  right: number
  done: boolean
  result: boolean | null
  stepCount: number
  log: LogEntry[]
  compareInfo: { text: string; colorCn: string } | null
  justMoved: number | null
}

// ─── Cell component ───────────────────────────────────────────────────────────

interface CellProps {
  value: number
  index: number
  isLeft: boolean
  isRight: boolean
  isDoneTrue: boolean
  isDoneFalse: boolean
  justMoved: boolean
}

function Cell({ value, index, isLeft, isRight, isDoneTrue, isDoneFalse, justMoved }: CellProps) {
  const isActive = isLeft || isRight
  const isBoth = isLeft && isRight
  const isMismatch = isDoneFalse && isActive

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "h-[18px] text-[11px] font-semibold",
          isBoth && "text-violet-500",
          !isBoth && isLeft && "text-blue-500",
          !isBoth && isRight && "text-blue-500",
        )}
      >
        {isBoth && "L = R"}
        {isLeft && !isRight && "L"}
        {isRight && !isLeft && "R"}
      </div>
      <motion.div
        animate={justMoved ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex size-14 flex-col items-center justify-center rounded-lg border transition-colors duration-200 select-none cursor-default",
          isMismatch && "border-red-500 bg-red-500 text-white",
          !isMismatch && isDoneTrue && isActive && "border-green-500 bg-green-500 text-white",
          !isMismatch && !isDoneTrue && isBoth && "border-violet-500 bg-violet-500 text-white",
          !isMismatch && !isDoneTrue && !isBoth && isActive && "border-blue-500 bg-blue-500 text-white",
          !isActive && "border-border bg-background text-foreground",
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
  match: "text-green-600",
  mismatch: "text-red-500",
  "done-true": "text-green-600",
  "done-false": "text-red-500",
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

function computeCompareInfo(
  l: number,
  r: number,
  nums: number[],
  done: boolean,
  result: boolean | null,
): { text: string; colorCn: string } | null {
  if (done) {
    if (result === true) return { text: "✓ Palindrome confirmed!", colorCn: "text-green-600" }
    if (result === false)
      return {
        text: `✗ Not a palindrome — nums[${l}]=${nums[l]} ≠ nums[${r}]=${nums[r]}`,
        colorCn: "text-red-500",
      }
    return null
  }
  if (l >= r) return null
  return {
    text: `Comparing nums[${l}]=${nums[l]} with nums[${r}]=${nums[r]}`,
    colorCn: "text-blue-500",
  }
}

let _logId = 0
function nextId() {
  return ++_logId
}

function buildInitialState(nums: number[]): AlgoState {
  const r = nums.length - 1
  return {
    nums,
    left: 0,
    right: r,
    done: false,
    result: null,
    stepCount: 0,
    log: [
      {
        id: nextId(),
        text: `Starting: L=0, R=${r}. Checking if array is a palindrome.`,
        type: "info",
      },
    ],
    compareInfo: computeCompareInfo(0, r, nums, false, null),
    justMoved: null,
  }
}

function advanceStep(prev: AlgoState): AlgoState {
  const { nums, left: l, right: r, done, result, stepCount, log } = prev

  // Already done
  if (done) return prev

  // Pointers met → all pairs matched → palindrome
  if (l >= r) {
    return {
      ...prev,
      done: true,
      result: true,
      log: [
        ...log,
        { id: nextId(), text: "All pairs matched — it is a <b>palindrome</b> ✓", type: "done-true" },
      ],
      compareInfo: { text: "✓ Palindrome confirmed!", colorCn: "text-green-600" },
      justMoved: null,
    }
  }

  const step = stepCount + 1
  const match = nums[l] === nums[r]

  if (!match) {
    return {
      ...prev,
      done: true,
      result: false,
      stepCount: step,
      log: [
        ...log,
        {
          id: nextId(),
          text: `Step ${step}: nums[${l}]=${nums[l]} ≠ nums[${r}]=${nums[r]} <b>✗ Mismatch</b> — not a palindrome`,
          type: "mismatch",
        },
      ],
      compareInfo: {
        text: `✗ nums[${l}]=${nums[l]} ≠ nums[${r}]=${nums[r]} — not a palindrome`,
        colorCn: "text-red-500",
      },
      justMoved: null,
    }
  }

  // Match — move both inward
  const newLeft = l + 1
  const newRight = r - 1
  const nowDone = newLeft >= newRight

  return {
    ...prev,
    left: newLeft,
    right: newRight,
    done: nowDone,
    result: nowDone ? true : null,
    stepCount: step,
    justMoved: l, // animate the left cell that just matched
    log: [
      ...log,
      {
        id: nextId(),
        text: `Step ${step}: nums[${l}]=${nums[l]} = nums[${r}]=${nums[r]} ✓ Match`,
        type: "match",
      },
      ...(nowDone
        ? [{ id: nextId(), text: "All pairs matched — it is a <b>palindrome</b> ✓", type: "done-true" as const }]
        : []),
    ],
    compareInfo: nowDone
      ? { text: "✓ Palindrome confirmed!", colorCn: "text-green-600" }
      : computeCompareInfo(newLeft, newRight, prev.nums, false, null),
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ValidPalindromeVisualizer() {
  const [arrayInput, setArrayInput] = useState("1, 2, 3, 2, 1")
  const [state, setState] = useState<AlgoState>(() =>
    buildInitialState([1, 2, 3, 2, 1])
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { nums, left, right, done, result, log, compareInfo, justMoved } = state

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
        if (prev.done) {
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

  // Result banner
  const resultBanner =
    result === true
      ? { text: "Palindrome ✓", colorCn: "text-green-600 bg-green-500/10 border-green-500/20" }
      : result === false
        ? { text: "Not a Palindrome ✗", colorCn: "text-red-500 bg-red-500/10 border-red-500/20" }
        : null

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        Valid Palindrome — Two Pointer Visualizer
      </h2>

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
            isLeft={i === left}
            isRight={i === right}
            isDoneTrue={done && result === true}
            isDoneFalse={done && result === false}
            justMoved={justMoved === i}
          />
        ))}
      </div>

      {/* Compare info bar */}
      <div className="mb-3 flex min-h-7 items-center justify-center">
        <AnimatePresence mode="wait">
          {compareInfo && (
            <motion.span
              key={compareInfo.text}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("text-sm font-medium", compareInfo.colorCn)}
              dangerouslySetInnerHTML={{ __html: compareInfo.text }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {resultBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mb-3 rounded-lg border px-4 py-2 text-center text-sm font-semibold",
              resultBanner.colorCn,
            )}
          >
            {resultBanner.text}
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
          { colorCn: "bg-blue-500", label: "Active pointer" },
          { colorCn: "bg-green-500", label: "Palindrome confirmed" },
          { colorCn: "bg-red-500", label: "Mismatch found" },
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
