"use client"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ────────────────────────────────────────────────────────────────────

type LogType = "info" | "calc" | "new-max" | "move-left" | "move-right" | "done"

interface LogEntry {
  id: number
  text: string
  type: LogType
}

interface AlgoState {
  heights: number[]
  left: number
  right: number
  maxArea: number
  currentArea: number
  phase: "calc" | "move" | "done"
  isNewMax: boolean
  done: boolean
  stepCount: number
  log: LogEntry[]
  areaInfo: { text: string; colorCn: string } | null
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
  info:         "text-muted-foreground",
  calc:         "text-blue-500",
  "new-max":    "text-green-600",
  "move-left":  "text-blue-500",
  "move-right": "text-orange-500",
  done:         "text-green-600",
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
    maxArea: 0,
    currentArea: 0,
    phase: "calc",
    isNewMax: false,
    done: false,
    stepCount: 0,
    log: [
      {
        id: nextId(),
        text: `Starting: <b>L=0</b>, <b>R=${n - 1}</b>, maxArea = 0`,
        type: "info",
      },
    ],
    areaInfo: null,
    justMoved: null,
  }
}

// Pure function — never mutates prev
function advanceStep(prev: AlgoState): AlgoState {
  if (prev.done) return prev

  const { heights, left, right, maxArea, stepCount, log, phase } = prev
  const step = stepCount + 1

  // ── Phase: calc ─────────────────────────────────────────────────────────────
  if (phase === "calc") {
    const hL = heights[left]
    const hR = heights[right]
    const h = Math.min(hL, hR)
    const width = right - left
    const area = h * width
    const isNew = area > maxArea
    const newMax = isNew ? area : maxArea

    const newLog: LogEntry[] = [
      ...log,
      {
        id: nextId(),
        text: `Step ${step}: Area = min(${hL}, ${hR}) × ${width} = <b>${area}</b>`,
        type: "calc",
      },
      ...(isNew
        ? [{ id: nextId(), text: `New max area: <b>${area}</b>`, type: "new-max" as LogType }]
        : []),
    ]

    return {
      ...prev,
      heights: [...heights],
      currentArea: area,
      maxArea: newMax,
      isNewMax: isNew,
      phase: "move",
      stepCount: step,
      log: newLog,
      areaInfo: {
        text: `Area = min(${hL}, ${hR}) × ${width} = <b>${area}</b>${isNew ? " ← new max!" : ""}`,
        colorCn: isNew ? "text-green-600" : "text-blue-500",
      },
      justMoved: null,
    }
  }

  // ── Phase: move ─────────────────────────────────────────────────────────────
  const hL = heights[left]
  const hR = heights[right]
  const moveLeft = hL <= hR

  let newLeft = left
  let newRight = right
  let movedIdx: number
  let logType: LogType
  let logText: string

  if (moveLeft) {
    newLeft = left + 1
    movedIdx = newLeft
    logType = "move-left"
    logText = `h[L]=${hL} ≤ h[R]=${hR} → move <b>L</b> right (L=${newLeft})`
  } else {
    newRight = right - 1
    movedIdx = newRight
    logType = "move-right"
    logText = `h[L]=${hL} &gt; h[R]=${hR} → move <b>R</b> left (R=${newRight})`
  }

  const moveEntry: LogEntry = { id: nextId(), text: `Step ${step}: ${logText}`, type: logType }

  // Termination check
  if (newLeft >= newRight) {
    return {
      ...prev,
      heights: [...heights],
      left: newLeft,
      right: newRight,
      phase: "done",
      done: true,
      isNewMax: false,
      stepCount: step,
      log: [
        ...log,
        moveEntry,
        {
          id: nextId(),
          text: `Pointers met — final max area = <b>${prev.maxArea}</b>`,
          type: "done",
        },
      ],
      areaInfo: {
        text: `Final max area = <b>${prev.maxArea}</b>`,
        colorCn: "text-green-600",
      },
      justMoved: movedIdx,
    }
  }

  return {
    ...prev,
    heights: [...heights],
    left: newLeft,
    right: newRight,
    phase: "calc",
    isNewMax: false,
    stepCount: step,
    log: [...log, moveEntry],
    areaInfo: null,
    justMoved: movedIdx,
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULT_HEIGHTS = [1, 8, 6, 2, 5, 4, 8, 3, 7]
const DEFAULT_INPUT = "1, 8, 6, 2, 5, 4, 8, 3, 7"

export default function ContainerWaterVisualizer() {
  const [heightsInput, setHeightsInput] = useState(DEFAULT_INPUT)
  const [state, setState] = useState<AlgoState>(() => buildInitialState(DEFAULT_HEIGHTS))
  const [isPlaying, setIsPlaying] = useState(false)

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { heights, left, right, maxArea, currentArea, phase, isNewMax, done, log, areaInfo, justMoved } = state

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

  // Debounced re-init on input change
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

  const showWater = (phase === "calc" || phase === "done") && left < right
  const waterX = bx(left) + bw / 2
  const waterRight = bx(right) + bw / 2
  const waterW = Math.max(0, waterRight - waterX)
  const waterH = showWater ? bh(Math.min(heights[left], heights[right])) : 0
  const waterY = baselineY - waterH

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        Container With Most Water — Visualizer
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
          {/* Water fill */}
          <AnimatePresence>
            {showWater && (
              <motion.rect
                key="water"
                initial={{ opacity: 0 }}
                animate={{
                  x: waterX,
                  y: waterY,
                  width: waterW,
                  height: waterH,
                  fillOpacity: isNewMax ? 0.35 : 0.18,
                  opacity: 1,
                }}
                exit={{ opacity: 0 }}
                transition={SPRING}
                fill="#1D9E75"
                stroke="#1D9E75"
                strokeOpacity={0.6}
                strokeWidth={1}
                strokeDasharray="4 4"
                rx={2}
              />
            )}
          </AnimatePresence>

          {/* Bars */}
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
                    height: barH,
                    fill: isActive ? "#1D9E75" : "#C4C2B8",
                    stroke: isActive ? "#0F6E56" : "#9A9890",
                    scale: isPulsing ? [1, 1.08, 1] : 1,
                  }}
                  transition={isPulsing ? { duration: 0.3, ease: "easeOut" } : SPRING}
                  style={{ transformOrigin: `${barX + bw / 2}px ${baselineY}px` }}
                  strokeWidth={0.5}
                  rx={3}
                />
                {/* Height label above bar */}
                <motion.text
                  animate={{
                    x: barX + bw / 2,
                    y: barY - 5,
                    fill: isActive ? "#085041" : "#888780",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  transition={SPRING}
                  textAnchor="middle"
                  fontSize={Math.max(9, Math.min(11, bw - 2))}
                >
                  {v}
                </motion.text>
                {/* Index label below baseline */}
                <text
                  x={barX + bw / 2}
                  y={baselineY + 12}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#B4B2A9"
                >
                  {i}
                </text>
              </g>
            )
          })}

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
          <motion.g
            animate={{ x: bx(left) + bw / 2 }}
            transition={SPRING}
          >
            <line
              x1={0} y1={baselineY + 2}
              x2={0} y2={baselineY + 22}
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="3 2"
            />
            <rect x={-10} y={baselineY + 22} width={20} height={14} rx={3} fill="#3b82f6" fillOpacity={0.18} />
            <text
              x={0}
              y={baselineY + 33}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill="#3b82f6"
            >
              L
            </text>
          </motion.g>

          {/* R pointer */}
          <motion.g
            animate={{ x: bx(right) + bw / 2 }}
            transition={SPRING}
          >
            <line
              x1={0} y1={baselineY + 2}
              x2={0} y2={baselineY + 22}
              stroke="#f97316"
              strokeWidth={1.5}
              strokeDasharray="3 2"
            />
            <rect x={-10} y={baselineY + 22} width={20} height={14} rx={3} fill="#f97316" fillOpacity={0.18} />
            <text
              x={0}
              y={baselineY + 33}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill="#f97316"
            >
              R
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Stats row */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-6 text-xs">
        <span className="text-muted-foreground">
          Current: <span className="font-semibold text-foreground">{currentArea}</span>
        </span>
        <span className="text-muted-foreground">
          Max:{" "}
          <span className={cn("font-semibold", done || maxArea > 0 ? "text-green-600" : "text-foreground")}>
            {maxArea}
          </span>
        </span>
        <span className="text-muted-foreground">
          Width:{" "}
          <span className="font-semibold text-foreground">
            {done ? 0 : right - left}
          </span>
        </span>
      </div>

      {/* Area info bar */}
      <div className="mb-3 flex min-h-7 items-center justify-center">
        <AnimatePresence mode="wait">
          {areaInfo && (
            <motion.span
              key={areaInfo.text}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("text-sm font-medium", areaInfo.colorCn)}
              dangerouslySetInnerHTML={{ __html: areaInfo.text }}
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
          { colorCn: "bg-[#1D9E75]/30 border border-[#1D9E75]/60", label: "Water area" },
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
