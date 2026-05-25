import TrappingRainWaterVisualizer from "@/components/array/trappingRainWater.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "Water at any bar = min(leftMax, rightMax) − height[i]",
    detail:
      "The water level is capped by the shorter of the tallest walls seen so far on both sides. Any excess spills over.",
  },
  {
    label: "Two pointers from both ends",
    detail:
      "L starts at 0, R starts at n-1. Process whichever side currently has the smaller height — that side's water is fully determined.",
  },
  {
    label: "If height[L] < height[R] — process the left bar",
    detail:
      "The right wall is at least height[R], which is already taller than height[L]. So leftMax is guaranteed to be the binding constraint. Compute water and advance L.",
  },
  {
    label: "Track leftMax and rightMax as pointers move",
    detail:
      "If the current bar is taller than the running max, update the max (no water trapped here). Otherwise, water = max − height[bar].",
  },
]

const CODE = `function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else water += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else water += rightMax - height[right];
      right--;
    }
  }

  return water;
}

// trap([0,1,0,2,1,0,1,3,2,1,2,1])  →  6`

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${color}`}>
      {children}
    </span>
  )
}

function MetaRow() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Badge color="bg-blue-500/10 text-blue-500">Two Pointers</Badge>
      <Badge color="bg-cyan-500/10 text-cyan-600">Max Tracking</Badge>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Time: O(n)</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Space: O(1)</span>
      <span className="text-muted-foreground">·</span>
      <Badge color="bg-red-500/10 text-red-500">Hard</Badge>
    </div>
  )
}

function ProblemStatement() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Problem</p>
      <p className="text-sm leading-relaxed text-foreground">
        Given{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">n</code> non-negative
        integers representing an elevation map where the width of each bar is 1, compute how much
        water can be trapped after raining.
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">height = [0,1,0,2,1,0,1,3,2,1,2,1]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">6</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Constraint</span>
          <code className="rounded bg-muted px-2 py-1">1 ≤ n ≤ 2×10⁴, 0 ≤ height[i] ≤ 10⁵</code>
        </div>
      </div>
    </div>
  )
}

function ApproachSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Approach — Two Pointers with Max Tracking</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Water trapped at any bar is{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          min(leftMax, rightMax) − height[i]
        </code>
        . The two-pointer trick eliminates the need for precomputed max arrays: always process the
        side with the smaller height — that side&apos;s water ceiling is already fully determined by
        the running max on that side alone.
      </p>
      <ol className="flex flex-col gap-3">
        {APPROACH_STEPS.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {i + 1}
            </span>
            <span>
              <span className="font-medium text-foreground">{s.label}</span>
              {" — "}
              <span className="text-muted-foreground">{s.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function CodeSection() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Implementation</h2>
      <div className="relative rounded-xl border border-border bg-muted/50 overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-yellow-400" />
          <span className="size-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-muted-foreground font-mono">trap.js</span>
        </div>
        <pre className="overflow-x-auto p-5 text-xs leading-relaxed">
          <code className="font-mono text-foreground">{CODE}</code>
        </pre>
      </div>
    </div>
  )
}

function ComplexitySection() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Complexity</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Time", value: "O(n)", note: "Single pass; each bar processed exactly once" },
          { label: "Space", value: "O(1)", note: "Only L, R, leftMax, rightMax, water" },
          { label: "Best case", value: "O(n)", note: "No early exit; all bars must be visited" },
          { label: "Worst case", value: "O(n)", note: "Not data-dependent; always linear" },
        ].map(({ label, value, note }) => (
          <div key={label} className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-mono text-lg font-bold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrappingRainWaterPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Trapping Rain Water"
          subtitle="Compute trapped water using two pointers and running max tracking — O(n) time, O(1) space"
        />
        <MetaRow />
      </div>

      <Separator />

      <ProblemStatement />
      <ApproachSection />
      <CodeSection />
      <ComplexitySection />

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Interactive Visualizer</h2>
        <p className="text-sm text-muted-foreground">
          Step through or Auto-play to watch L and R converge. Sky-blue fills accumulate above each
          bar as water is trapped. The dashed blue line shows the current leftMax ceiling; the dashed
          orange line shows rightMax. The stats row updates live with the running water total.
        </p>
        <TrappingRainWaterVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Each vertical bar represents a wall height. Sky-blue fills accumulate above bars as water
          is computed. Dashed horizontal lines show the running max on each side.
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              borderCn: "border-l-blue-500",
              label: "L",
              labelCn: "text-blue-500",
              detail: "Left pointer. Processed when height[L] < height[R]. Advances rightward.",
            },
            {
              borderCn: "border-l-orange-500",
              label: "R",
              labelCn: "text-orange-500",
              detail: "Right pointer. Processed when height[R] ≤ height[L]. Advances leftward.",
            },
            {
              borderCn: "border-l-sky-400",
              label: "Sky-blue fill",
              labelCn: "text-cyan-600",
              detail: "Trapped water above a bar. Height = min(leftMax, rightMax) − height[bar].",
            },
            {
              borderCn: "border-l-blue-500",
              label: "Blue dashed line",
              labelCn: "text-blue-500",
              detail: "leftMax — the tallest wall seen so far on the left side. The water ceiling for bars L processes.",
            },
            {
              borderCn: "border-l-orange-500",
              label: "Orange dashed line",
              labelCn: "text-orange-500",
              detail: "rightMax — the tallest wall seen so far on the right side. The water ceiling for bars R processes.",
            },
            {
              borderCn: "border-l-green-500",
              label: "Green active bar",
              labelCn: "text-green-600",
              detail: "The bar currently being processed (L or R position).",
            },
          ].map(({ borderCn, label, labelCn, detail }) => (
            <li key={label} className={`border-l-2 pl-4 text-sm ${borderCn}`}>
              <span className={`font-semibold font-mono ${labelCn}`}>{label}</span>
              <span className="text-muted-foreground"> — {detail}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Why process the smaller side?
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Water at any bar is{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              min(leftMax, rightMax) − height[bar]
            </code>
            . If{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              height[L] &lt; height[R]
            </code>
            , the right wall is at least{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">height[R]</code> which
            already exceeds{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">height[L]</code>.
            Whatever <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">rightMax</code>{" "}
            grows to later can only be ≥{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">height[R]</code>, so{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">leftMax</code> is
            guaranteed to be the binding constraint — we can compute the trapped water at L with
            certainty and advance.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
