"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ────────────────────────────────────────────────────────────────────

type LogType = "info" | "build-step" | "query" | "done-build"

interface LogEntry {
  id: number
  text: string
  type: LogType
}

interface QueryResult {
  left: number
  right: number
  answer: number
  prefixRight: number
  prefixLeft: number
}

interface AlgoState {
  nums: number[]
  prefix: (number | null)[]   // length n+1; null = not yet built
  buildIdx: number             // how many prefix cells are filled (0..n)
  phase: "build" | "query"
  queryResult: QueryResult | null
  log: LogEntry[]
  justBuilt: number | null     // prefix index just filled → pulse
}

// ─── Log colors ───────────────────────────────────────────────────────────────

const LOG_COLOR: Record<LogType, string> = {
  info:          "text-muted-foreground",
  "build-step":  "text-blue-500",
  query:         "text-green-600",
  "done-build":  "text-violet-500",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _logId = 0
function nextId() { return ++_logId }

function buildInitialState(nums: number[]): AlgoState {
  const prefix: (number | null)[] = [0, ...new Array(nums.length).fill(null)]
  return {
    nums: [...nums],
    prefix,
    buildIdx: 0,
    phase: "build",
    queryResult: null,
    log: [
      {
        id: nextId(),
        text: `prefix[0] = 0 (sentinel). Ready to build ${nums.length} more cells.`,
        type: "info",
      },
    ],
    justBuilt: null,
  }
}

// Pure function — never mutates prev
function advanceBuild(prev: AlgoState): AlgoState {
  if (prev.phase !== "build") return prev
  const { nums, prefix, buildIdx, log } = prev
  if (buildIdx >= nums.length) return prev

  const pPrev = prefix[buildIdx] as number
  const n = nums[buildIdx]
  const result = pPrev + n
  const newPrefix = [...prefix]
  newPrefix[buildIdx + 1] = result
  const newBuildIdx = buildIdx + 1
  const isDone = newBuildIdx >= nums.length

  return {
    ...prev,
    prefix: newPrefix,
    buildIdx: newBuildIdx,
    phase: isDone ? "query" : "build",
    log: [
      ...log,
      {
        id: nextId(),
        text: `prefix[${newBuildIdx}] = prefix[${buildIdx}] + nums[${buildIdx}] = ${pPrev} + ${n} = <b>${result}</b>`,
        type: "build-step",
      },
      ...(isDone
        ? [{ id: nextId(), text: "Build complete — enter a query below.", type: "done-build" as LogType }]
        : []),
    ],
    justBuilt: newBuildIdx,
  }
}

// Pure function — instant result, no stepping
function runQuery(state: AlgoState, left: number, right: number): AlgoState {
  if (state.phase !== "query") return state
  const { prefix, nums, log } = state
  if (left < 0 || right >= nums.length || left > right) return state

  const pRight = prefix[right + 1] as number
  const pLeft = prefix[left] as number
  const answer = pRight - pLeft

  return {
    ...state,
    queryResult: { left, right, answer, prefixRight: pRight, prefixLeft: pLeft },
    log: [
      ...log,
      {
        id: nextId(),
        text: `sumRange(${left}, ${right}) = prefix[${right + 1}] − prefix[${left}] = ${pRight} − ${pLeft} = <b>${answer}</b>`,
        type: "query",
      },
    ],
  }
}

// ─── NumCell ──────────────────────────────────────────────────────────────────

interface NumCellProps {
  value: number
  index: number
  isQueryRange: boolean
  justBuilt: boolean
}

function NumCell({ value, index, isQueryRange, justBuilt }: NumCellProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={justBuilt ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex size-14 flex-col items-center justify-center rounded-lg border",
          "transition-colors duration-200 select-none cursor-default text-sm",
          isQueryRange
            ? "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400"
            : "border-border bg-background text-foreground",
        )}
      >
        <span className="text-base font-semibold leading-none">{value}</span>
        <span className="mt-0.5 text-[10px] opacity-60">[{index}]</span>
      </motion.div>
    </div>
  )
}

// ─── PrefixCell ───────────────────────────────────────────────────────────────

interface PrefixCellProps {
  value: number | null
  index: number
  isHighlightedRight: boolean
  isHighlightedLeft: boolean
  isBuilt: boolean
  justBuilt: boolean
  labelRight: boolean
  labelLeft: boolean
}

function PrefixCell({
  value,
  index,
  isHighlightedRight,
  isHighlightedLeft,
  isBuilt,
  justBuilt,
  labelRight,
  labelLeft,
}: PrefixCellProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Pointer label */}
      <div
        className={cn(
          "h-4.5 text-[10px] font-semibold",
          labelRight && "text-green-600",
          labelLeft && "text-orange-500",
          !labelRight && !labelLeft && "text-transparent",
        )}
      >
        {labelRight ? "P[R+1]" : labelLeft ? "P[L]" : "·"}
      </div>

      <motion.div
        animate={justBuilt ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex size-14 flex-col items-center justify-center rounded-lg border",
          "transition-colors duration-200 select-none cursor-default",
          // Priority order
          isHighlightedRight && "border-green-500 bg-green-500 text-white",
          !isHighlightedRight && isHighlightedLeft && "border-orange-500 bg-orange-500 text-white",
          !isHighlightedRight && !isHighlightedLeft && isBuilt && "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400",
          !isHighlightedRight && !isHighlightedLeft && !isBuilt && "border-dashed border-border bg-muted/30 text-muted-foreground",
        )}
      >
        <span className="text-base font-semibold leading-none">
          {value === null ? "?" : value}
        </span>
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

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULT_NUMS = [-2, 0, 3, -5, 2, -1]
const DEFAULT_INPUT = "-2, 0, 3, -5, 2, -1"

export default function RangeSumQueryVisualizer() {
  const [arrayInput, setArrayInput] = useState(DEFAULT_INPUT)
  const [state, setState] = useState<AlgoState>(() => buildInitialState(DEFAULT_NUMS))
  const [isPlaying, setIsPlaying] = useState(false)
  const [leftInput, setLeftInput] = useState("0")
  const [rightInput, setRightInput] = useState("2")

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { nums, prefix, buildIdx, phase, queryResult, log, justBuilt } = state

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
      const next = advanceBuild(prev)
      if (next.justBuilt !== null) {
        setTimeout(() => setState((s) => ({ ...s, justBuilt: null })), 400)
      }
      return next
    })
  }, [])

  const toggleAuto = useCallback(() => {
    if (autoRef.current) { stopAuto(); return }
    if (phase !== "build") return
    setIsPlaying(true)
    autoRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.phase !== "build") { stopAuto(); return prev }
        const next = advanceBuild(prev)
        if (next.justBuilt !== null) {
          setTimeout(() => setState((s) => ({ ...s, justBuilt: null })), 400)
        }
        if (next.phase === "query") stopAuto()
        return next
      })
    }, 900)
  }, [phase, stopAuto])

  const handleQuery = useCallback(() => {
    const l = parseInt(leftInput)
    const r = parseInt(rightInput)
    if (isNaN(l) || isNaN(r)) return
    setState((prev) => runQuery(prev, l, r))
  }, [leftInput, rightInput])

  const handleQueryKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleQuery()
    },
    [handleQuery],
  )

  // Debounced re-init on input change
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

  // ─── Derived values ────────────────────────────────────────────────────────

  const qr = queryResult
  const queryRangeLeft = qr?.left ?? -1
  const queryRangeRight = qr?.right ?? -1
  const highlightPrefixRight = qr !== null ? qr.right + 1 : -1
  const highlightPrefixLeft = qr !== null ? qr.left : -1

  const answerColorCn =
    qr === null
      ? ""
      : qr.answer > 0
        ? "text-green-600"
        : qr.answer < 0
          ? "text-red-500"
          : "text-muted-foreground"

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        Range Sum Query — Prefix Sum Visualizer
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

      {/* Two-row cell grid */}
      <div className="mb-4 flex flex-col gap-3">
        {/* nums row */}
        <div className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-right text-[11px] text-muted-foreground font-mono">
            nums[ ]
          </span>
          <div className="flex flex-wrap gap-2">
            {nums.map((n, idx) => (
              <NumCell
                key={idx}
                value={n}
                index={idx}
                isQueryRange={idx >= queryRangeLeft && idx <= queryRangeRight}
                justBuilt={justBuilt === idx + 1}
              />
            ))}
          </div>
        </div>

        {/* prefix row */}
        <div className="flex items-start gap-3">
          <span className="mt-5 w-16 shrink-0 text-right text-[11px] text-muted-foreground font-mono">
            prefix[ ]
          </span>
          <div className="flex flex-wrap gap-2">
            {prefix.map((val, idx) => (
              <PrefixCell
                key={idx}
                value={val}
                index={idx}
                isHighlightedRight={idx === highlightPrefixRight}
                isHighlightedLeft={idx === highlightPrefixLeft}
                isBuilt={idx <= buildIdx}
                justBuilt={justBuilt === idx}
                labelRight={idx === highlightPrefixRight && qr !== null}
                labelLeft={idx === highlightPrefixLeft && qr !== null && idx !== highlightPrefixRight}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Build controls */}
      {phase === "build" && (
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={step} disabled={phase !== "build"}>
              Step →
            </Button>
            <Button variant="outline" size="sm" onClick={toggleAuto} disabled={phase !== "build"}>
              {isPlaying ? "Pause ⏸" : "Auto-play ▶"}
            </Button>
            <Button variant="outline" size="sm" onClick={init}>Reset ↺</Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Building prefix array… ({buildIdx}/{nums.length})
          </p>
        </div>
      )}

      {/* Phase indicator */}
      {phase === "query" && (
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
            ✓ Prefix built — ready for queries
          </span>
          <Button variant="outline" size="sm" onClick={init}>Reset build ↺</Button>
        </div>
      )}

      {/* Query panel */}
      {phase === "query" && (
        <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Query — sumRange(left, right)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">left</label>
            <Input
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              onKeyDown={handleQueryKeyDown}
              className="w-16 font-mono"
            />
            <label className="text-xs text-muted-foreground">right</label>
            <Input
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              onKeyDown={handleQueryKeyDown}
              className="w-16 font-mono"
            />
            <Button variant="outline" size="sm" onClick={handleQuery}>
              Query →
            </Button>
          </div>

          {/* Query result */}
          <AnimatePresence>
            {qr !== null && (
              <motion.div
                key={`${qr.left}-${qr.right}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1 rounded-lg border border-border bg-background p-3"
              >
                <p className="font-mono text-xs text-muted-foreground">
                  prefix[{qr.right + 1}] − prefix[{qr.left}]
                  {" = "}
                  <span className="text-green-600">{qr.prefixRight}</span>
                  {" − "}
                  <span className="text-orange-500">{qr.prefixLeft}</span>
                </p>
                <p className={cn("font-mono text-lg font-bold", answerColorCn)}>
                  = {qr.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Log */}
      <div
        ref={logRef}
        className="mb-3 min-h-20 max-h-36 overflow-y-auto border-t border-border pt-2.5"
      >
        {log.map((entry) => (
          <LogLine key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { colorCn: "bg-blue-500/30 border border-blue-500/40", label: "Built prefix cell" },
          { colorCn: "bg-green-500",  label: "prefix[right+1]  P[R+1]" },
          { colorCn: "bg-orange-500", label: "prefix[left]  P[L]" },
          { colorCn: "bg-blue-500/10 border border-blue-500/30", label: "Query range in nums" },
          { colorCn: "bg-muted border-dashed border border-border", label: "Not yet built" },
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
