"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  left: number
  right: number
  sum: number
  minLen: number
  phase: "expand" | "shrink" | "done"
  best: { l: number; r: number } | null
  note: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ARR = [2, 3, 1, 2, 4, 3]
const TARGET = 7
const N = ARR.length

const PAD = 50
const CW = 72
const GAP = 10
const CELL_Y = 60
const CH = 56

const BLUE = "#185FA5"
const GREEN = "#0F6E56"

// ─── Step generation ─────────────────────────────────────────────────────────

function buildSteps(): Step[] {
  const steps: Step[] = []
  let sum = 0
  let left = 0
  let minLen = Infinity

  steps.push({
    left,
    right: -1,
    sum,
    minLen,
    phase: "expand",
    best: null,
    note: `target = ${TARGET}. Expand right pointer to grow window sum.`,
  })

  for (let right = 0; right < N; right++) {
    sum += ARR[right]
    steps.push({
      left,
      right,
      sum,
      minLen,
      phase: "expand",
      best: null,
      note: `Expand: add arr[${right}]=${ARR[right]} → sum=${sum}${
        sum >= TARGET
          ? " ≥ target, now shrink!"
          : ` < ${TARGET}, keep expanding.`
      }`,
    })

    while (sum >= TARGET) {
      const len = right - left + 1
      const isNew = len < minLen
      if (isNew) minLen = len
      steps.push({
        left,
        right,
        sum,
        minLen,
        phase: "shrink",
        best: isNew ? { l: left, r: right } : null,
        note: `sum=${sum} ≥ ${TARGET} → window [${left}..${right}] len=${len}${
          isNew ? " 🏆 new min!" : ""
        }. Shrink: remove arr[${left}]=${ARR[left]}.`,
      })
      sum -= ARR[left]
      left++
    }
  }

  steps.push({
    left,
    right: N - 1,
    sum,
    minLen,
    phase: "done",
    best: null,
    note: `Done. Minimum subarray length = ${minLen === Infinity ? 0 : minLen}.`,
  })

  return steps
}

const STEPS = buildSteps()

// ─── SVG diagram ─────────────────────────────────────────────────────────────

function cx(i: number) {
  return PAD + i * (CW + GAP)
}
function cmx(i: number) {
  return cx(i) + CW / 2
}

interface DiagramProps {
  step: Step
  bestWindow: { l: number; r: number } | null
}

function Diagram({ step: s, bestWindow }: DiagramProps) {
  const cells = ARR.map((val, i) => {
    const x = cx(i)
    const mx = cmx(i)
    const inWin = s.right >= 0 && i >= s.left && i <= s.right
    const isL = i === s.left
    const isR = i === s.right

    const col = inWin
      ? s.phase === "shrink"
        ? GREEN
        : BLUE
      : "var(--color-border-secondary, #d1d5db)"
    const fill = inWin
      ? s.phase === "shrink"
        ? "#0F6E5611"
        : "#185FA511"
      : "var(--color-background-secondary, #f9fafb)"
    const tFill = inWin
      ? s.phase === "shrink"
        ? GREEN
        : BLUE
      : "var(--color-text-secondary, #6b7280)"

    const ptrLabels: Array<{ t: string; c: string }> = []
    if (isL && isR && s.right >= 0) ptrLabels.push({ t: "L=R", c: BLUE })
    else {
      if (isL && s.right >= 0) ptrLabels.push({ t: "L", c: BLUE })
      if (isR && s.right >= 0)
        ptrLabels.push({ t: "R", c: s.phase === "shrink" ? GREEN : BLUE })
    }

    return (
      <g key={i}>
        {/* index label */}
        <text
          x={mx}
          y={CELL_Y - 10}
          textAnchor="middle"
          fontSize={11}
          fontFamily="var(--font-sans)"
          fill="var(--color-text-secondary, #6b7280)"
          opacity={0.55}
        >
          {i}
        </text>

        {/* cell box */}
        <rect
          x={x}
          y={CELL_Y}
          width={CW}
          height={CH}
          rx={8}
          fill={fill}
          stroke={col}
          strokeWidth={inWin ? 1.5 : 0.5}
        />

        {/* value */}
        <text
          x={mx}
          y={CELL_Y + CH / 2 + 6}
          textAnchor="middle"
          fontSize={20}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          fill={tFill}
        >
          {val}
        </text>

        {/* pointer labels */}
        {ptrLabels.length > 0 && (
          <text
            x={mx}
            y={CELL_Y + CH + 14}
            textAnchor="middle"
            fontSize={11}
            fontFamily="var(--font-sans)"
          >
            {ptrLabels.map((l, idx) => (
              <tspan key={idx} fill={l.c} fontWeight={500}>
                {idx > 0 ? " " : ""}
                {l.t}
              </tspan>
            ))}
          </text>
        )}
      </g>
    )
  })

  const windowCol = s.phase === "shrink" ? GREEN : BLUE

  const barMaxW = 160
  const barX = 680 - barMaxW - 8
  const barY = 12
  const barH = 14
  const pct = Math.min(1, s.sum / TARGET)
  const barFill = s.sum >= TARGET ? GREEN : BLUE

  return (
    <>
      {/* target label */}
      <text
        x={PAD}
        y={20}
        fontSize={12}
        fontFamily="var(--font-sans)"
        fill="var(--color-text-secondary, #6b7280)"
      >
        target ={" "}
        <tspan fontWeight={500} fill="var(--color-text-primary, #111827)">
          {TARGET}
        </tspan>
      </text>

      {/* window bracket */}
      {s.left <= s.right && s.right >= 0 && (
        <>
          <rect
            x={cx(s.left) - 4}
            y={CELL_Y - 4}
            width={cx(s.right) + CW - cx(s.left) + 8}
            height={CH + 8}
            rx={10}
            fill={windowCol}
            opacity={0.08}
          />
          <rect
            x={cx(s.left) - 4}
            y={CELL_Y - 4}
            width={cx(s.right) + CW - cx(s.left) + 8}
            height={CH + 8}
            rx={10}
            fill="none"
            stroke={windowCol}
            strokeWidth={1.5}
          />
        </>
      )}

      {/* best window underline */}
      {bestWindow && s.phase !== "done" && (
        <>
          <rect
            x={cx(bestWindow.l)}
            y={CELL_Y + CH + 8}
            width={cx(bestWindow.r) + CW - cx(bestWindow.l)}
            height={4}
            rx={2}
            fill={GREEN}
            opacity={0.35}
          />
          <text
            x={(cx(bestWindow.l) + cx(bestWindow.r) + CW) / 2}
            y={CELL_Y + CH + 26}
            textAnchor="middle"
            fontSize={10}
            fontFamily="var(--font-sans)"
            fill={GREEN}
          >
            best so far (len={bestWindow.r - bestWindow.l + 1})
          </text>
        </>
      )}

      {/* cells */}
      {cells}

      {/* sum progress bar */}
      <rect
        x={barX}
        y={barY}
        width={barMaxW}
        height={barH}
        rx={4}
        fill="var(--color-background-secondary, #f3f4f6)"
      />
      {pct > 0 && (
        <rect
          x={barX}
          y={barY}
          width={barMaxW * pct}
          height={barH}
          rx={4}
          fill={barFill}
          opacity={0.7}
        />
      )}
      <text
        x={barX + barMaxW / 2}
        y={barY + barH / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={500}
        fontFamily="var(--font-sans)"
        fill="#fff"
      >
        sum {s.sum} / {TARGET}
      </text>
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SlidingWindowVisualizer() {
  const [cur, setCur] = useState(0)
  const bestWindowRef = useRef<{ l: number; r: number } | null>(null)

  const s = STEPS[cur]

  // Track best window across steps
  if (s.best) bestWindowRef.current = s.best

  const prev = useCallback(() => setCur((c) => Math.max(0, c - 1)), [])
  const next = useCallback(
    () => setCur((c) => Math.min(STEPS.length - 1, c + 1)),
    []
  )
  const reset = useCallback(() => {
    bestWindowRef.current = null
    setCur(0)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [prev, next])

  const windowLabel =
    s.right >= 0 && s.left <= s.right
      ? `[${s.left}..${s.right}] len=${s.right - s.left + 1}`
      : "—"

  const minLenLabel = s.minLen === Infinity ? "∞" : String(s.minLen)

  return (
    <div className="py-4 font-sans">
      {/* SVG diagram */}
      <svg
        width="100%"
        viewBox="0 0 680 190"
        role="img"
        aria-label="Minimum Length Subarray — Sliding Window"
      >
        <title>Minimum Length Subarray — Sliding Window</title>
        <Diagram step={s} bestWindow={bestWindowRef.current} />
      </svg>

      {/* Note */}
      <p className="mt-2 min-h-4.5 text-sm leading-relaxed text-muted-foreground">
        {s.note}
      </p>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={prev}
          disabled={cur === 0}
          className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-40"
        >
          ← Prev
        </button>
        <button
          onClick={next}
          disabled={cur === STEPS.length - 1}
          className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-40"
        >
          Next →
        </button>
        <button
          onClick={reset}
          className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
        >
          ↺ Reset
        </button>

        <Stat label="sum" value={String(s.sum)} />
        <Stat label="window" value={windowLabel} />
        <Stat label="minLen" value={minLenLabel} />

        <span className="ml-auto text-sm text-muted-foreground">
          Step {cur + 1} / {STEPS.length}
        </span>
      </div>
    </div>
  )
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">
      {label}{" "}
      <strong className="font-medium text-foreground">{value}</strong>
    </div>
  )
}
