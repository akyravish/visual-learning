import ContainerWaterVisualizer from "@/components/array/containerWater.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "Place pointers at the ends",
    detail: "L at index 0, R at the last index — the widest possible starting container.",
  },
  {
    label: "Compute area",
    detail:
      "area = min(height[L], height[R]) × (R − L). The shorter wall caps the water level; the gap between pointers is the width.",
  },
  {
    label: "Track the maximum",
    detail: "Keep maxArea = max(maxArea, area) across every iteration.",
  },
  {
    label: "Move the shorter wall inward",
    detail:
      "Width shrinks by 1 each step. Only a taller replacement can compensate. Moving the taller wall can never grow the area — moving the shorter one is the only chance.",
  },
  {
    label: "Stop when L meets R",
    detail: "Every meaningful pair has been considered in O(n) total steps.",
  },
]

const CODE = `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;

  while (left < right) {
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, (right - left) * h);

    if (height[left] < height[right]) left++;
    else right--;
  }

  return maxWater;
}

// maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])  →  49`

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {children}
    </span>
  )
}

function MetaRow() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Badge color="bg-blue-500/10 text-blue-500">Two Pointers</Badge>
      <Badge color="bg-violet-500/10 text-violet-500">Opposite Direction</Badge>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Time: O(n)</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Space: O(1)</span>
      <span className="text-muted-foreground">·</span>
      <Badge color="bg-yellow-500/10 text-yellow-600">Medium</Badge>
    </div>
  )
}

function ProblemStatement() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Problem
      </p>
      <p className="text-sm leading-relaxed text-foreground">
        Given <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">n</code> non-negative
        integers <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">height[0..n-1]</code>,
        where each value represents a vertical wall at position{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">i</code> with the given
        height, find two walls that together with the x-axis form a container holding the most water.
        Return the maximum amount of water the container can store. Note: you may not slant the
        container.
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">height = [1, 8, 6, 2, 5, 4, 8, 3, 7]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">49</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Constraint</span>
          <code className="rounded bg-muted px-2 py-1">
            2 ≤ n ≤ 10⁵, 0 ≤ height[i] ≤ 10⁴
          </code>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Explanation</span>
          <code className="rounded bg-muted px-2 py-1 leading-relaxed">
            walls at index 1 (h=8) and index 8 (h=7): min(8,7) × (8−1) = 7 × 7 = 49
          </code>
        </div>
      </div>
    </div>
  )
}

function ApproachSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Approach — Greedy Two Pointers</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Start with the widest possible container — pointers at each end. At every step, the area is
        bounded by the shorter wall. Since width always shrinks by one, the only way to possibly
        find a larger area is to replace the shorter wall with something taller. Greedy: always move
        the pointer at the shorter wall inward.
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
          <span className="ml-3 text-xs text-muted-foreground font-mono">maxArea.js</span>
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
          { label: "Time", value: "O(n)", note: "Single pass; each pointer moves ≤ n−1 times" },
          { label: "Space", value: "O(1)", note: "Only L, R, and maxArea — no extra array" },
          { label: "Best case", value: "O(n)", note: "No early exit; all pairs must be checked" },
          { label: "Worst case", value: "O(n)", note: "Not data-dependent; always linear" },
        ].map(({ label, value, note }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-1"
          >
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

export default function ContainerWithMostWaterPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Container With Most Water"
          subtitle="Find two walls forming the largest container — greedy two-pointer approach"
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
          Step through the algorithm or hit Auto-play to watch both pointers converge. Edit the
          heights array to try your own inputs — the visualizer resets automatically as you type.
        </p>
        <ContainerWaterVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Each bar represents a wall at that index, scaled proportionally to its height. The
          translucent green region between L and R shows the current water area — its height is
          capped by the shorter of the two walls.
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              borderCn: "border-l-blue-500",
              label: "L",
              labelCn: "text-blue-500",
              detail: "Left wall pointer. Starts at index 0 and only ever moves right.",
            },
            {
              borderCn: "border-l-orange-500",
              label: "R",
              labelCn: "text-orange-500",
              detail: "Right wall pointer. Starts at the last index and only ever moves left.",
            },
            {
              borderCn: "border-l-green-500",
              label: "Active wall",
              labelCn: "text-green-600",
              detail:
                "The two bars currently under consideration (L and R) are highlighted green. All others are gray.",
            },
            {
              borderCn: "border-l-green-500",
              label: "Water region",
              labelCn: "text-green-600",
              detail:
                "The translucent fill between L and R represents the current container area — height = min(h[L], h[R]), width = R − L.",
            },
            {
              borderCn: "border-l-green-500",
              label: "New max",
              labelCn: "text-green-600",
              detail:
                "The fill brightens and the info bar turns green when the latest area beats the previous maximum.",
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
            Why move the shorter wall?
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Width decreases by exactly 1 on every step. The area is always bounded by{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              min(h[L], h[R]) × width
            </code>
            . If we move the taller wall, the new minimum can only stay the same or get smaller
            while the width also shrinks — so the area can never grow. Moving the shorter wall is
            the only move that could yield a taller bottleneck and beat the current area.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
