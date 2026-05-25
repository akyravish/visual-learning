"use client"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ────────────────────────────────────────────────────────────────────

type LogType = "info" | "update-max" | "add-water" | "move-left" | "move-right" | "done"

interface LogEntry {
  id: number
  text: string
  type: LogType
}

interface AlgoState {
  heights: number[]
  left: number
  right: number
  leftMax: number
  rightMax: number
  water: number
  waterAt: number[]       // per-bar trapped water amounts
  done: boolean
  stepCount: number
  log: LogEntry[]
  stepInfo: { text: string; colorCn: string } | null
  justMoved: number | null
}

// ─── SVG constants ────────────────────────────────────────────────────────────

const CH = 175
const VW = 560
const PAD_X = 16
const PAD_TOP = 14
const PAD_BOT = 38
const BAR_GAP = 6
const PLOT_H = CH - PAD_TOP - PAD_BOT   // 123px
const SPRING = { type: "spring" as const, stiffness: 220, damping: 26 }

// ─── Log colors ───────────────────────────────────────────────────────────────

const LOG_COLOR: Record<LogType, string> = {
  info:          "text-muted-foreground",
  "update-max":  "text-blue-500",
  "add-water":   "text-cyan-500",
  "move-left":   "text-blue-500",
  "move-right":  "text-orange-500",
  done:          "text-green-600",
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

function buildInitialState(heights: number[]): AlgoState {
  const n = heights.length
  return {
    heights: [...heights],
    left: 0,
    right: n - 1,
    leftMax: 0,
    rightMax: 0,
    water: 0,
    waterAt: new Array(n).fill(0),
    done: false,
    stepCount: 0,
    log: [
      {
        id: nextId(),
        text: `Starting: L=0, R=${n - 1}, leftMax=0, rightMax=0`,
        type: "info",
      },
    ],
    stepInfo: null,
    justMoved: null,
  }
}

// Pure function — never mutates prev
function advanceStep(prev: AlgoState): AlgoState {
  if (prev.done) return prev

  const { heights, left, right, leftMax, rightMax, water, waterAt, stepCount, log } = prev
  const step = stepCount + 1
  const newWaterAt = [...waterAt]

  if (heights[left] < heights[right]) {
    // Process left side
    const h = heights[left]
    const oldLeft = left
    let newLeftMax = leftMax
    let newWater = water
    let logEntry: LogEntry

    if (h >= leftMax) {
      newLeftMax = h
      logEntry = {
        id: nextId(),
        text: `Step ${step}: h[L=${oldLeft}]=${h} ≥ leftMax → leftMax updated to <b>${newLeftMax}</b>`,
        type: "update-max",
      }
    } else {
      const trapped = leftMax - h
      newWater = water + trapped
      newWaterAt[oldLeft] = trapped
      logEntry = {
        id: nextId(),
        text: `Step ${step}: h[L=${oldLeft}]=${h} &lt; leftMax=${leftMax} → +<b>${trapped}</b> water (total: ${newWater})`,
        type: "add-water",
      }
    }

    const newLeft = left + 1
    const isDone = newLeft >= right

    const newLog: LogEntry[] = [
      ...log,
      logEntry,
      ...(isDone
        ? [{ id: nextId(), text: `Done. Total water trapped: <b>${newWater}</b>`, type: "done" as LogType }]
        : []),
    ]

    return {
      ...prev,
      heights: [...heights],
      waterAt: newWaterAt,
      left: newLeft,
      leftMax: newLeftMax,
      water: newWater,
      done: isDone,
      stepCount: step,
      log: newLog,
      stepInfo: {
        text: `h[L]=${heights[oldLeft]} &lt; h[R]=${heights[right]} → process left side`,
        colorCn: "text-blue-500",
      },
      justMoved: oldLeft,
    }
  } else {
    // Process right side
    const h = heights[right]
    const oldRight = right
    let newRightMax = rightMax
    let newWater = water
    let logEntry: LogEntry

    if (h >= rightMax) {
      newRightMax = h
      logEntry = {
        id: nextId(),
        text: `Step ${step}: h[R=${oldRight}]=${h} ≥ rightMax → rightMax updated to <b>${newRightMax}</b>`,
        type: "update-max",
      }
    } else {
      const trapped = rightMax - h
      newWater = water + trapped
      newWaterAt[oldRight] = trapped
      logEntry = {
        id: nextId(),
        text: `Step ${step}: h[R=${oldRight}]=${h} &lt; rightMax=${rightMax} → +<b>${trapped}</b> water (total: ${newWater})`,
        type: "add-water",
      }
    }

    const newRight = right - 1
    const isDone = left >= newRight

    const newLog: LogEntry[] = [
      ...log,
      logEntry,
      ...(isDone
        ? [{ id: nextId(), text: `Done. Total water trapped: <b>${newWater}</b>`, type: "done" as LogType }]
        : []),
    ]

    return {
      ...prev,
      heights: [...heights],
      waterAt: newWaterAt,
      right: newRight,
      rightMax: newRightMax,
      water: newWater,
      done: isDone,
      stepCount: step,
      log: newLog,
      stepInfo: {
        text: `h[R]=${heights[oldRight]} ≥ h[L]=${heights[left]} → process right side`,
        colorCn: "text-orange-500",
      },
      justMoved: oldRight,
    }
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULT_HEIGHTS = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
const DEFAULT_INPUT = "0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1"

export default function TrappingRainWaterVisualizer() {
  const [heightsInput, setHeightsInput] = useState(DEFAULT_INPUT)
  const [state, setState] = useState<AlgoState>(() => buildInitialState(DEFAULT_HEIGHTS))
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { heights, left, right, leftMax, rightMax, water, waterAt, done, log, stepInfo, justMoved } = state

  // ─── SVG geometry (memoised) ───────────────────────────────────────────────

  const geo = useMemo(() => {
    const n = heights.length
    const bw = (VW - PAD_X * 2 - BAR_GAP * (n - 1)) / n
    const maxH = Math.max(...heights, 1)
    const bx = (i: number) => PAD_X + i * (bw + BAR_GAP)
    const bh = (v: number) => (v / maxH) * PLOT_H
    const baselineY = PAD_TOP + PLOT_H
    return { bw, bx, bh, baselineY }
  }, [heights])

  // ─── Actions ──────────────────────────────────────────────────────────────

  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null }
    setIsPlaying(false)
  }, [])

  const init = useCallback(() => {
    const parsed = heightsInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0)
    if (parsed.length < 2) return
    stopAuto()
    setState(buildInitialState(parsed))
  }, [heightsInput, stopAuto])

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
  }, [heightsInput]) // eslint-disable-line

  // Scroll log to bottom
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  // Cleanup on unmount
  useEffect(() => () => stopAuto(), [stopAuto])

  // ─── SVG derived values ────────────────────────────────────────────────────

  const { bw, bx, bh, baselineY } = geo

  // leftMax line: from left edge to current L bar
  const leftMaxY = baselineY - bh(leftMax)
  const leftMaxX2 = bx(left) + bw / 2

  // rightMax line: from current R bar to right edge
  const rightMaxY = baselineY - bh(rightMax)
  const rightMaxX1 = bx(right) + bw / 2

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        Trapping Rain Water — Visualizer
      </h2>

      {/* Inputs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground">Heights</label>
        <Input
          value={heightsInput}
          onChange={(e) => setHeightsInput(e.target.value)}
          className="w-64 font-mono"
        />
        <Button variant="outline" size="sm" onClick={init}>Reset ↺</Button>
      </div>

      {/* SVG chart */}
      <div className="mb-3 w-full overflow-hidden rounded-lg border border-border bg-background">
        <svg
          width="100%"
          viewBox={`0 0 ${VW} ${CH}`}
          className="block"
          style={{ overflow: "visible" }}
        >
          {/* Water fills (static per-bar rects, rendered behind bars) */}
          {heights.map((h, i) => {
            const w = waterAt[i]
            if (w <= 0) return null
            const barH = bh(h)
            const waterH = bh(w)
            const waterY = baselineY - barH - waterH
            return (
              <rect
                key={`water-${i}`}
                x={bx(i)}
                y={waterY}
                width={bw}
                height={waterH}
                fill="#38bdf8"
                fillOpacity={0.55}
                rx={2}
              />
            )
          })}

          {/* Wall bars */}
          {heights.map((v, i) => {
            const isActive = i === left || i === right
            const isPulsing = justMoved === i
            const barX = bx(i)
            const barH = bh(v)
            const barY = baselineY - barH

            return (
              <g key={i}>
                <motion.rect
                  animate={{
                    x: barX,
                    y: barY,
                    width: bw,
                    height: Math.max(barH, 1),
                    fill: isActive ? "#1D9E75" : "#C4C2B8",
                    stroke: isActive ? "#0F6E56" : "#9A9890",
                    scale: isPulsing ? [1, 1.08, 1] : 1,
                  }}
                  transition={isPulsing ? { duration: 0.3, ease: "easeOut" } : SPRING}
                  style={{ transformOrigin: `${barX + bw / 2}px ${baselineY}px` }}
                  strokeWidth={0.5}
                  rx={3}
                />
                {/* Height label */}
                <motion.text
                  animate={{
                    x: barX + bw / 2,
                    y: barY - 5,
                    fill: isActive ? "#085041" : "#888780",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  transition={SPRING}
                  textAnchor="middle"
                  fontSize={Math.max(8, Math.min(11, bw - 2))}
                >
                  {v}
                </motion.text>
                {/* Index label */}
                <text
                  x={barX + bw / 2}
                  y={baselineY + 12}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#B4B2A9"
                >
                  {i}
                </text>
              </g>
            )
          })}

          {/* leftMax dashed horizontal line */}
          {leftMax > 0 && (
            <motion.line
              animate={{ x1: PAD_X, y1: leftMaxY, x2: leftMaxX2, y2: leftMaxY }}
              transition={SPRING}
              stroke="#3b82f6"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              opacity={0.7}
            />
          )}

          {/* rightMax dashed horizontal line */}
          {rightMax > 0 && (
            <motion.line
              animate={{ x1: rightMaxX1, y1: rightMaxY, x2: VW - PAD_X, y2: rightMaxY }}
              transition={SPRING}
              stroke="#f97316"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              opacity={0.7}
            />
          )}

          {/* Baseline */}
          <line
            x1={PAD_X}
            y1={baselineY}
            x2={VW - PAD_X}
            y2={baselineY}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={1}
          />

          {/* L pointer */}
          <motion.g animate={{ x: bx(left) + bw / 2 }} transition={SPRING}>
            <line x1={0} y1={baselineY + 2} x2={0} y2={baselineY + 22} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 2" />
            <rect x={-10} y={baselineY + 22} width={20} height={14} rx={3} fill="#3b82f6" fillOpacity={0.18} />
            <text x={0} y={baselineY + 33} textAnchor="middle" fontSize={10} fontWeight={600} fill="#3b82f6">L</text>
          </motion.g>

          {/* R pointer */}
          <motion.g animate={{ x: bx(right) + bw / 2 }} transition={SPRING}>
            <line x1={0} y1={baselineY + 2} x2={0} y2={baselineY + 22} stroke="#f97316" strokeWidth={1.5} strokeDasharray="3 2" />
            <rect x={-10} y={baselineY + 22} width={20} height={14} rx={3} fill="#f97316" fillOpacity={0.18} />
            <text x={0} y={baselineY + 33} textAnchor="middle" fontSize={10} fontWeight={600} fill="#f97316">R</text>
          </motion.g>
        </svg>
      </div>

      {/* Stats row */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-6 text-xs">
        <span className="text-muted-foreground">
          Water:{" "}
          <span className={cn("font-semibold", water > 0 ? "text-cyan-600" : "text-foreground")}>
            {water}
          </span>
        </span>
        <span className="text-muted-foreground">
          leftMax: <span className="font-semibold text-blue-500">{leftMax}</span>
        </span>
        <span className="text-muted-foreground">
          rightMax: <span className="font-semibold text-orange-500">{rightMax}</span>
        </span>
      </div>

      {/* Step info bar */}
      <div className="mb-3 flex min-h-7 items-center justify-center">
        <AnimatePresence mode="wait">
          {stepInfo && (
            <motion.span
              key={stepInfo.text}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("text-sm font-medium", stepInfo.colorCn)}
              dangerouslySetInnerHTML={{ __html: stepInfo.text }}
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
          { colorCn: "bg-[#1D9E75]", label: "Active wall (L or R)" },
          { colorCn: "bg-blue-500", label: "L pointer" },
          { colorCn: "bg-orange-500", label: "R pointer" },
          { colorCn: "bg-sky-400/70", label: "Trapped water" },
          { colorCn: "bg-blue-500/30 border border-blue-500/50", label: "leftMax line" },
          { colorCn: "bg-orange-500/30 border border-orange-500/50", label: "rightMax line" },
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
