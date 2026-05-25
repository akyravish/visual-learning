import SortColorsVisualizer from "@/components/array/sortColors.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "Three pointers define invariant regions",
    detail:
      "low marks the boundary of the 0-region, mid is the scanner, high marks the boundary of the 2-region. Everything in [low, mid) is a confirmed 1.",
  },
  {
    label: "nums[mid] = 0 → swap with low, advance both",
    detail:
      "The 0 goes to the left boundary. The value swapped from low is always a 1 (it was in the 1-region), so mid can safely advance.",
  },
  {
    label: "nums[mid] = 1 → just advance mid",
    detail: "Already in the correct position between the 0s and 2s — no swap needed.",
  },
  {
    label: "nums[mid] = 2 → swap with high, advance high only",
    detail:
      "The 2 goes to the right boundary. The value arriving at mid from high is unknown, so mid must not advance — it needs to be inspected next step.",
  },
]

const CODE = `function sortColors(nums) {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;

  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
      // NOTE: mid does NOT advance — must re-check swapped value
    }
  }

  return nums;
}

// sortColors([2, 0, 2, 1, 1, 0])  →  [0, 0, 1, 1, 2, 2]`

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
      <Badge color="bg-violet-500/10 text-violet-500">Three Pointers</Badge>
      <Badge color="bg-blue-500/10 text-blue-500">Dutch National Flag</Badge>
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
        Given an array{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums</code> containing
        only the values <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">0</code>,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">1</code>, and{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">2</code>, sort it
        in-place so that all 0s come first, then 1s, then 2s. You must solve this in a{" "}
        <strong>single pass</strong> without using a built-in sort. (Values represent the colors
        red, white, and blue of the Dutch national flag.)
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">nums = [2, 0, 2, 1, 1, 0]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">[0, 0, 1, 1, 2, 2]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Constraint</span>
          <code className="rounded bg-muted px-2 py-1">{"1 ≤ n ≤ 300, values ∈ {0, 1, 2}"}</code>
        </div>
      </div>
    </div>
  )
}

function ApproachSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Approach — Dutch National Flag (Three Pointers)</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Maintain three invariant regions at all times:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">[0, low)</code> holds all
        0s, <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">[low, mid)</code>{" "}
        holds all 1s,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">(high, n)</code> holds
        all 2s, and{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">[mid, high]</code> is
        unsorted. The scanner{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">mid</code> shrinks the
        unsorted region one element at a time.
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
          <span className="ml-3 text-xs text-muted-foreground font-mono">sortColors.js</span>
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
          { label: "Time", value: "O(n)", note: "Single pass; mid moves at most n times total" },
          { label: "Space", value: "O(1)", note: "Only low, mid, high — no auxiliary array" },
          { label: "Best case", value: "O(n)", note: "Already sorted — all mid++ operations" },
          { label: "Worst case", value: "O(n)", note: "Not data-dependent; always one pass" },
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

export default function SortColorsPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Sort Colors"
          subtitle="Sort 0s, 1s, and 2s in-place with a single pass — Dutch National Flag algorithm"
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
          Step through or Auto-play to watch the three pointers carve out their invariant regions.
          Cell backgrounds tint green (0-region), blue (1-region), or orange (2-region) as each
          zone expands. Edit the array with values 0, 1, and 2 to try your own input.
        </p>
        <SortColorsVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Three pointer labels appear above each cell. The background tint shows which invariant
          region the cell currently belongs to.
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              borderCn: "border-l-green-500",
              label: "low",
              labelCn: "text-green-600",
              detail: "Left boundary of the 1-region. Everything to its left is a confirmed 0.",
            },
            {
              borderCn: "border-l-blue-500",
              label: "mid",
              labelCn: "text-blue-500",
              detail: "Scanner. Inspects the current element and decides which swap (if any) to make.",
            },
            {
              borderCn: "border-l-orange-500",
              label: "high",
              labelCn: "text-orange-500",
              detail: "Right boundary of the unsorted region. Everything to its right is a confirmed 2.",
            },
            {
              borderCn: "border-l-violet-500",
              label: "overlap",
              labelCn: "text-violet-500",
              detail: "When mid meets high (or low), the cell turns violet — the algorithm is near completion.",
            },
            {
              borderCn: "border-l-border",
              label: "tinted cell",
              labelCn: "text-muted-foreground",
              detail: "Background tint (green/blue/orange) shows the settled region — no pointer needed for those cells.",
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
            Why not advance mid after swapping a 2?
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            When swapping{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums[mid]</code> with{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums[high]</code>, the
            value arriving at{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">mid</code> from the
            unsorted right side is unknown — it could be 0, 1, or 2 and must be inspected before
            advancing. But when swapping with{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums[low]</code>, we
            know that value is a 1 (it lived in the confirmed 1-region{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">[low, mid)</code>), so
            advancing <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">mid</code> is
            safe.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
