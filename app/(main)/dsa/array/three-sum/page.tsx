import ThreeSumVisualizer from "@/components/array/threeSum.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "Sort the array",
    detail:
      "Sorting enables two-pointer convergence and lets us skip duplicate values to avoid duplicate triplets in the output.",
  },
  {
    label: "Fix nums[i] as the first element",
    detail:
      "Outer loop from i=0 to n-3. Each iteration anchors one number and reduces the problem to a Two Sum II on the remaining subarray.",
  },
  {
    label: "Skip duplicate i values",
    detail:
      "If nums[i] === nums[i-1] (and i > 0), continue — the same anchor would produce the same triplets already recorded.",
  },
  {
    label: "Two-pointer inner scan",
    detail:
      "L starts at i+1, R at n-1. If sum < 0 move L right; if sum > 0 move R left; if sum === 0 record the triplet.",
  },
  {
    label: "Skip duplicate L/R after a found triplet",
    detail:
      "Advance L past equal neighbours, advance R past equal neighbours, then do L++/R-- to shrink the window.",
  },
]

const CODE = `function threeSum(arr) {
  const result = [];
  arr.sort((a, b) => a - b);

  for (let i = 0; i < arr.length - 2; i++) {
    if (i > 0 && arr[i] === arr[i - 1]) continue; // skip dup i

    let left = i + 1;
    let right = arr.length - 1;

    while (left < right) {
      const sum = arr[i] + arr[left] + arr[right];

      if (sum === 0) {
        result.push([arr[i], arr[left], arr[right]]);
        while (left < right && arr[left] === arr[left + 1]) left++;  // skip dup L
        while (left < right && arr[right] === arr[right - 1]) right--; // skip dup R
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

// threeSum([-1, 0, 1, 2, -1, -4])  →  [[-1,-1,2], [-1,0,1]]`

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
      <Badge color="bg-violet-500/10 text-violet-500">Sort + Two Pointers</Badge>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Time: O(n²)</span>
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
        Given an integer array{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums</code>, return all
        unique triplets{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          [nums[i], nums[j], nums[k]]
        </code>{" "}
        such that{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">i ≠ j ≠ k</code> and{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          nums[i] + nums[j] + nums[k] = 0
        </code>
        . The solution set must not contain duplicate triplets.
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">nums = [-1, 0, 1, 2, -1, -4]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">[[-1, -1, 2], [-1, 0, 1]]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Constraint</span>
          <code className="rounded bg-muted px-2 py-1">
            3 ≤ n ≤ 3000, −10⁵ ≤ nums[i] ≤ 10⁵
          </code>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Note</span>
          <code className="rounded bg-muted px-2 py-1 leading-relaxed">
            Order of triplets and values within each triplet does not matter
          </code>
        </div>
      </div>
    </div>
  )
}

function ApproachSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Approach — Sort + Two Pointers</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The key insight is that <strong>Three Sum = fix one element + Two Sum II</strong>. After
        sorting, anchoring{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums[i]</code> turns the
        remaining problem into finding a pair that sums to{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">−nums[i]</code> in a
        sorted subarray — which two-pointer solves in O(n). Duplicates are handled by skipping equal
        values rather than using a hash set.
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
          <span className="ml-3 text-xs text-muted-foreground font-mono">threeSum.js</span>
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
          { label: "Time", value: "O(n²)", note: "Sort O(n log n) + outer × inner loop dominates" },
          { label: "Space", value: "O(1)", note: "Only i, L, R pointers; output not counted" },
          { label: "Best case", value: "O(n²)", note: "No early exit once sorted" },
          { label: "Worst case", value: "O(n²)", note: "Not data-dependent after sorting" },
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

export default function ThreeSumPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Three Sum"
          subtitle="Find all unique triplets summing to zero — sort, fix one element, two-pointer the rest"
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
          Step through the algorithm or hit Auto-play to watch the outer{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">i</code> pointer advance
          and the inner two-pointer window converge. Triplets appear in the results panel as they
          are found. Edit the array to try your own inputs — the visualizer resets automatically.
        </p>
        <ThreeSumVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The sorted array is shown as cells with two rows of pointer labels above each cell — one
          for{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">i</code> and one for{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">L</code>/
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">R</code> — so all three
          pointers can be visible simultaneously.
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              borderCn: "border-l-violet-500",
              label: "i",
              labelCn: "text-violet-500",
              detail:
                "Fixed anchor element. Advances once the inner window is exhausted. Elements to its left are already processed (muted).",
            },
            {
              borderCn: "border-l-blue-500",
              label: "L",
              labelCn: "text-blue-500",
              detail:
                "Inner left pointer. Starts at i+1 each outer iteration and moves right when sum < 0.",
            },
            {
              borderCn: "border-l-orange-500",
              label: "R",
              labelCn: "text-orange-500",
              detail:
                "Inner right pointer. Starts at n-1 each outer iteration and moves left when sum > 0.",
            },
            {
              borderCn: "border-l-green-500",
              label: "Green cells",
              labelCn: "text-green-600",
              detail:
                "All three of i, L, R flash green simultaneously when a valid triplet is found.",
            },
            {
              borderCn: "border-l-border",
              label: "Muted cells",
              labelCn: "text-muted-foreground",
              detail:
                "Cells at indices < i. These positions have already been fully explored as the anchor.",
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
            Three Sum = fix one + Two Sum II
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            After sorting, fixing{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">nums[i]</code> reduces
            the problem to finding two numbers in{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              nums[i+1..n-1]
            </code>{" "}
            that sum to{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">−nums[i]</code> —
            exactly Two Sum II on a sorted array. Sorting also enables O(1) duplicate skipping: if{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              nums[i] === nums[i-1]
            </code>
            , the entire outer iteration is redundant and can be skipped with a single{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">continue</code>.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
