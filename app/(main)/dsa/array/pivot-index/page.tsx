import PivotIndexVisualizer from "@/components/array/pivotIndex.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "Compute totalSum in one pass",
    detail:
      "Sum all elements first: O(n). This gives us a fixed reference that makes rightSum computable in O(1) at any index.",
  },
  {
    label: "Walk left to right; compute rightSum = totalSum − leftSum − nums[i]",
    detail:
      "At each index i, we know leftSum (accumulated) and totalSum. Subtracting both removes the left region and the current element, leaving exactly the right region's sum.",
  },
  {
    label: "If leftSum === rightSum → return i (pivot found)",
    detail:
      "The current index is balanced: everything to its left equals everything to its right. Return immediately — no need to continue.",
  },
  {
    label: "Otherwise accumulate: leftSum += nums[i] and continue",
    detail:
      "The current element joins the left region for the next step. If we exhaust the array without a match, return -1.",
  },
]

const CODE = `function pivotIndex(nums) {
  const totalSum = nums.reduce((a, b) => a + b, 0);
  let leftSum = 0;

  for (let i = 0; i < nums.length; i++) {
    const rightSum = totalSum - leftSum - nums[i];
    if (leftSum === rightSum) return i;
    leftSum += nums[i];
  }

  return -1;
}

// nums = [1, 7, 3, 6, 5, 6]   totalSum = 28
// i=0: leftSum=0,  rightSum=27  → 0 ≠ 27
// i=1: leftSum=1,  rightSum=20  → 1 ≠ 20
// i=2: leftSum=8,  rightSum=17  → 8 ≠ 17
// i=3: leftSum=11, rightSum=11  → 11 = 11 ✓  → return 3`

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
      <Badge color="bg-blue-500/10 text-blue-500">Prefix Sum</Badge>
      <Badge color="bg-violet-500/10 text-violet-500">Pivot Index</Badge>
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
        Given an integer array{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums</code>, return the{" "}
        <strong>pivot index</strong> — the index where the sum of all elements strictly to the left
        equals the sum of all elements strictly to the right. If no such index exists, return{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">-1</code>. If there are
        multiple valid pivot indices, return the leftmost one.
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">nums = [1, 7, 3, 6, 5, 6]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">3</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">nums = [1, 2, 3]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">-1</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-muted-foreground">Constraint</span>
          <code className="rounded bg-muted px-2 py-1">
            1 ≤ n ≤ 10⁴, −1000 ≤ nums[i] ≤ 1000
          </code>
        </div>
      </div>
    </div>
  )
}

function ApproachSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Approach — Prefix Sum Scan</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Pre-compute the total sum once, then scan left to right in a single pass. At each index{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">i</code>, the right-side
        sum is just{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          totalSum − leftSum − nums[i]
        </code>{" "}
        — computable in O(1) without a separate array. No extra space needed, and the answer pops
        out the moment{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">leftSum === rightSum</code>.
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
          <span className="ml-3 text-xs text-muted-foreground font-mono">pivotIndex.js</span>
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
          { label: "Time", value: "O(n)", note: "Two passes: one for totalSum, one for scan" },
          { label: "Space", value: "O(1)", note: "Only two running sums, no extra array" },
          { label: "Best case", value: "O(1)", note: "Pivot at index 0" },
          { label: "Worst case", value: "O(n)", note: "No pivot or pivot at last index" },
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

export default function PivotIndexPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Pivot Index"
          subtitle="Find the index where left sum equals right sum using a single-pass prefix scan"
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
          Step through the algorithm or hit Auto-play. Each step advances the scan by one index,
          showing the live{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">leftSum</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums[i]</code>, and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">rightSum</code> values
          below the array. Edit the array to try your own inputs — the visualizer resets
          automatically as you type.
        </p>
        <PivotIndexVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          One row of cells represents the input array. The pointer label{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">i</code> floats above
          the cell currently being evaluated. Three live values below the array show the running
          computation at each step.
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              borderCn: "border-l-blue-500",
              label: "Blue cell (i)",
              labelCn: "text-blue-500",
              detail: "The index currently being checked. leftSum is everything to its left; rightSum is everything to its right.",
            },
            {
              borderCn: "border-l-border",
              label: "Dimmed cells",
              labelCn: "text-muted-foreground",
              detail: "Already scanned — their values are part of leftSum and no longer active.",
            },
            {
              borderCn: "border-l-green-500",
              label: "Green cell (PIVOT)",
              labelCn: "text-green-600",
              detail: "Pivot found: leftSum equals rightSum at this index.",
            },
            {
              borderCn: "border-l-red-500",
              label: "Red cells",
              labelCn: "text-red-500",
              detail: "No pivot exists — every cell turns red and the algorithm returns -1.",
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
            Why not store rightSum separately?
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              rightSum = totalSum − leftSum − nums[i]
            </code>{" "}
            is computed in O(1) from values we already have. Storing it in a separate variable or
            array would waste space. The formula works because{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              leftSum + nums[i] + rightSum = totalSum
            </code>{" "}
            must hold at every index — rearranging gives rightSum for free.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
