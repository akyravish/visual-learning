import TwoSumVisualizer from "@/components/array/twoSum.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "Start at both ends",
    detail: "Place left at index 0 (smallest) and right at the last index (largest).",
  },
  {
    label: "Compute the sum",
    detail: "If sum === target → done. The two pointers have found the pair.",
  },
  {
    label: "Sum too small → move left right",
    detail: "left++ pulls in a larger value, increasing the sum.",
  },
  {
    label: "Sum too large → move right left",
    detail: "right-- pulls in a smaller value, decreasing the sum.",
  },
  {
    label: "Guaranteed termination",
    detail: "Pointers converge. Every step eliminates an impossible pair.",
  },
]

const CODE = `function twoSumSorted(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    else if (sum < target) left++;
    else right--;
  }

  return [];
}`

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
      <Badge color="bg-violet-500/10 text-violet-500">Opposite Direction</Badge>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Time: O(n)</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Space: O(1)</span>
      <span className="text-muted-foreground">·</span>
      <Badge color="bg-green-500/10 text-green-600">Easy</Badge>
    </div>
  )
}

function ProblemStatement() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Problem</p>
      <p className="text-sm leading-relaxed text-foreground">
        Given a <span className="font-medium">1-indexed</span> sorted array of integers{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">numbers</code> and an
        integer <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">target</code>,
        find two numbers that add up to{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">target</code> and return
        their indices as{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">[index1, index2]</code>{" "}
        where <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">index1 &lt; index2</code>.
        You may not use the same element twice, and there is exactly one solution.
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">numbers = [2, 7, 11, 15], target = 9</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">[1, 2]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-muted-foreground">Why</span>
          <code className="rounded bg-muted px-2 py-1">numbers[1] + numbers[2] = 2 + 7 = 9</code>
        </div>
      </div>
    </div>
  )
}

function ApproachSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Approach — Two Pointers (Opposite Direction)</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Because the array is sorted, we know moving the left pointer right{" "}
        <span className="text-foreground font-medium">increases</span> the sum, and moving the right
        pointer left <span className="text-foreground font-medium">decreases</span> it. This means we
        can always make a meaningful decision — no element is ever reconsidered unnecessarily.
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
          <span className="ml-3 text-xs text-muted-foreground font-mono">twoSumSorted.js</span>
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
          { label: "Time", value: "O(n)", note: "single pass" },
          { label: "Space", value: "O(1)", note: "no extra memory" },
          { label: "Best case", value: "O(1)", note: "pair at both ends" },
          { label: "Worst case", value: "O(n)", note: "pointers traverse all" },
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

export default function TwoSumIIPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Two Sum II"
          subtitle="Find two numbers in a sorted array that add up to a target."
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
          Step through the algorithm or hit Auto-play. Edit the array and target
          to try your own inputs — the visualizer resets automatically.
        </p>
        <TwoSumVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The two pointers start at opposite ends —{" "}
          <span className="font-medium text-blue-500">L</span> at index 0 (smallest) and{" "}
          <span className="font-medium text-orange-500">R</span> at the last index (largest).
          Each step, they squeeze inward based on the sum:
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              color: "border-l-blue-500",
              label: "Sum < target",
              labelColor: "text-blue-500",
              detail:
                "The current sum is too small, so we need a bigger number. Moving L right replaces the smallest value with a larger one.",
            },
            {
              color: "border-l-orange-500",
              label: "Sum > target",
              labelColor: "text-orange-500",
              detail:
                "The current sum is too large, so we need a smaller number. Moving R left replaces the largest value with a smaller one.",
            },
            {
              color: "border-l-green-500",
              label: "Sum = target",
              labelColor: "text-green-600",
              detail: "Done. Both indices are returned (1-indexed).",
            },
          ].map(({ color, label, labelColor, detail }) => (
            <li
              key={label}
              className={`border-l-2 pl-4 text-sm ${color}`}
            >
              <span className={`font-semibold font-mono ${labelColor}`}>{label}</span>
              <span className="text-muted-foreground"> → {detail}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Why this works with a sorted array
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Because the array is sorted, moving left{" "}
            <span className="font-medium text-foreground">always increases</span> the sum and
            moving right <span className="font-medium text-foreground">always decreases</span> it.
            You have perfect control over the sum at every step — no backtracking needed. This is
            what makes it{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              O(n)
            </code>{" "}
            instead of{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              O(n²)
            </code>{" "}
            like the brute-force nested loop approach.
          </p>
          <p className="text-sm text-muted-foreground">
            Try changing the array and target in the inputs above — the visualizer resets
            automatically as you type.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
