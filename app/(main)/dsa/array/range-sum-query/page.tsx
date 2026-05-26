import RangeSumQueryVisualizer from "@/components/array/rangeSumQuery.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "Build a prefix array of length n+1",
    detail:
      "prefix[0] = 0 (sentinel), then prefix[i+1] = prefix[i] + nums[i]. One pass, O(n).",
  },
  {
    label: "prefix[i] stores the cumulative sum of nums[0..i-1]",
    detail:
      "It answers 'what is the sum of all elements before index i?' — the sentinel at index 0 means 'sum of zero elements = 0'.",
  },
  {
    label: "sumRange(left, right) = prefix[right+1] − prefix[left]",
    detail:
      "prefix[right+1] is the sum up to and including nums[right]. Subtracting prefix[left] removes everything before nums[left]. Result in O(1).",
  },
  {
    label: "prefix[0] = 0 eliminates the edge case for left = 0",
    detail:
      "Without the sentinel, sumRange(0, right) would need special handling. With it, prefix[right+1] − prefix[0] = prefix[right+1] − 0 works uniformly.",
  },
]

const CODE = `class NumArray {
  constructor(nums) {
    this.prefix = [0];
    for (const num of nums) {
      this.prefix.push(this.prefix[this.prefix.length - 1] + num);
    }
  }

  sumRange(left, right) {
    return this.prefix[right + 1] - this.prefix[left];
  }
}

// nums    = [-2,  0,  3, -5,  2, -1]
// prefix  = [ 0, -2, -2,  1, -4, -2, -3]

// sumRange(0, 2) = prefix[3] - prefix[0] = 1  - 0  =  1
// sumRange(2, 5) = prefix[6] - prefix[2] = -3 - (-2) = -1`

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
      <Badge color="bg-violet-500/10 text-violet-500">Data Structure</Badge>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Build: O(n)</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Query: O(1)</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Space: O(n)</span>
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
        Design a data structure that accepts an integer array{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums</code> and efficiently
        answers multiple range sum queries.{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">sumRange(left, right)</code>{" "}
        returns the sum of elements between indices{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">left</code> and{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">right</code> inclusive.
        The array does not change after construction.
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-32 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">nums = [-2, 0, 3, -5, 2, -1]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-32 shrink-0 text-muted-foreground">sumRange(0, 2)</span>
          <code className="rounded bg-muted px-2 py-1">1</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-32 shrink-0 text-muted-foreground">sumRange(2, 5)</span>
          <code className="rounded bg-muted px-2 py-1">-1</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-32 shrink-0 text-muted-foreground">Constraint</span>
          <code className="rounded bg-muted px-2 py-1">
            1 ≤ n ≤ 10⁴, −10⁵ ≤ nums[i] ≤ 10⁵, up to 10⁴ queries
          </code>
        </div>
      </div>
    </div>
  )
}

function ApproachSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Approach — Prefix Sum Array</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Pre-compute a cumulative sum array once in O(n). Each query then reduces to a single
        array lookup and subtraction — O(1) regardless of the range size or the number of queries.
        This is the classic trade-off: spend O(n) time and space up front to make every future
        query instant.
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
          <span className="ml-3 text-xs text-muted-foreground font-mono">rangeSumQuery.js</span>
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
          { label: "Build time", value: "O(n)", note: "One pass to fill the prefix array" },
          { label: "Query time", value: "O(1)", note: "Single subtraction: prefix[r+1] − prefix[l]" },
          { label: "Space", value: "O(n)", note: "One extra array of length n+1" },
          { label: "Per query", value: "O(1)", note: "No matter how many queries; build cost amortised" },
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

export default function RangeSumQueryPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Range Sum Query"
          subtitle="Precompute a prefix array once to answer any range sum in O(1)"
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
          The visualizer has two phases. First, step through (or auto-play) the prefix array
          construction — watch each cell fill in from left to right. Once built, switch to the
          query panel and enter any{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">left</code> /{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">right</code> pair to
          see which two prefix cells are subtracted and what the answer is.
        </p>
        <RangeSumQueryVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Two rows are shown: the original{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums</code> array on
          top and the{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">prefix</code> array
          below (one cell longer). Cells fill in with a blue tint during the build phase.
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              borderCn: "border-l-blue-500",
              label: "Blue tint (prefix row)",
              labelCn: "text-blue-500",
              detail: "Cells that have been computed during the build phase.",
            },
            {
              borderCn: "border-l-green-500",
              label: "P[R+1]",
              labelCn: "text-green-600",
              detail:
                "prefix[right+1] — the cumulative sum up to and including nums[right]. Shown in green.",
            },
            {
              borderCn: "border-l-orange-500",
              label: "P[L]",
              labelCn: "text-orange-500",
              detail:
                "prefix[left] — the cumulative sum of everything before nums[left]. Subtracted to isolate the range.",
            },
            {
              borderCn: "border-l-blue-500",
              label: "Blue tint (nums row)",
              labelCn: "text-blue-500",
              detail: "The queried range [left, right] highlighted in the nums row.",
            },
            {
              borderCn: "border-l-border",
              label: "Dashed cell",
              labelCn: "text-muted-foreground",
              detail: "A prefix cell not yet computed during the build phase.",
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
            Why prefix[0] = 0?
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Setting{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">prefix[0] = 0</code>{" "}
            means{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">prefix[i]</code>{" "}
            represents the sum of the first{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">i</code> elements (0
            elements = 0). This makes{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              sumRange(0, right)
            </code>{" "}
            work without any special case:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              prefix[right+1] − prefix[0] = prefix[right+1]
            </code>
            . The offset-by-one is the key:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              prefix[right+1]
            </code>{" "}
            includes{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums[right]</code>,
            and subtracting{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">prefix[left]</code>{" "}
            removes everything before{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums[left]</code>.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
