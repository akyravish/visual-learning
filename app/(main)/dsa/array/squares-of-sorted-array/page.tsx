import SortedSquaresVisualizer from "@/components/array/sortedSquares.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "Key insight — extremes hold the largest squares",
    detail:
      "After squaring, the largest values come from either end: the most negative (large absolute value) or the most positive. The middle values are always the smallest.",
  },
  {
    label: "left = 0, right = n−1, pos = n−1",
    detail:
      "Two pointers at both ends of the input; pos starts at the last slot of the result array, ready to receive the largest value first.",
  },
  {
    label: "Compare |nums[left]|² vs |nums[right]|²",
    detail:
      "Whichever absolute value is larger contributes the bigger square — place it at result[pos].",
  },
  {
    label: "Advance the pointer that just contributed",
    detail:
      "If left won, left++. If right won, right--. Then pos-- to move the write head one step left.",
  },
  {
    label: "Repeat until left > right",
    detail:
      "Every step fills one slot from right to left. When the pointers cross, all n positions are filled and the result is sorted ascending.",
  },
]

const CODE = `function sortedSquares(nums) {
  const result = new Array(nums.length);
  let left = 0;
  let right = nums.length - 1;
  let pos = nums.length - 1;

  while (left <= right) {
    const leftSq  = nums[left]  * nums[left];
    const rightSq = nums[right] * nums[right];

    if (leftSq > rightSq) {
      result[pos] = leftSq;
      left++;
    } else {
      result[pos] = rightSq;
      right--;
    }
    pos--;
  }

  return result;
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
        Given a sorted integer array{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">nums</code> (may
        include negatives), return a new array of each element's square, sorted in{" "}
        <span className="font-medium">non-decreasing</span> order.
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">[-4, -1, 0, 3, 10]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">[0, 1, 9, 16, 100]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Note</span>
          <code className="rounded bg-muted px-2 py-1">result is a new array — O(n) space</code>
        </div>
      </div>
    </div>
  )
}

function ApproachSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Approach — Two Pointers, Fill Back to Front</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Naively squaring and sorting costs O(n log n). The two-pointer approach exploits the
        sorted structure to do it in O(n). Because the array is sorted, the{" "}
        <span className="font-medium text-foreground">largest squares always live at the two ends</span>{" "}
        — not in the middle. We compare the extremes, place the winner at the back of the result,
        and repeat.
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
          <span className="ml-3 text-xs text-muted-foreground font-mono">sortedSquares.js</span>
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
          { label: "Time", value: "O(n)", note: "single pass, one step per element" },
          { label: "Space", value: "O(n)", note: "result array of length n" },
          { label: "Best case", value: "O(n)", note: "all non-negative — right always wins" },
          { label: "Worst case", value: "O(n)", note: "mixed signs — alternates each side" },
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

export default function SquaresOfSortedArrayPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Squares of Sorted Array"
          subtitle="Return sorted squares of a sorted array in O(n) using two pointers."
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
          Step through the algorithm or hit Auto-play. Edit the array (negatives allowed) — the
          visualizer resets automatically as you type.
        </p>
        <SortedSquaresVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The visualizer shows two rows — the original input on top and the result being built
          below. Watch how the result fills from right to left:
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              borderCn: "border-l-blue-500",
              label: "L — left pointer",
              labelCn: "text-blue-500",
              detail:
                "Starts at index 0. Advances inward when the left square is larger than the right square.",
            },
            {
              borderCn: "border-l-orange-500",
              label: "R — right pointer",
              labelCn: "text-orange-500",
              detail:
                "Starts at the last index. Advances inward when the right square is larger or equal.",
            },
            {
              borderCn: "border-l-border",
              label: "Gray input cells",
              labelCn: "text-muted-foreground",
              detail:
                "Input cells that have already contributed their square. Once a pointer passes a cell it turns gray.",
            },
            {
              borderCn: "border-l-green-500",
              label: "Green result cells",
              labelCn: "text-green-600",
              detail:
                "Each step places one square into the result. The cell pops with a scale animation and stays green. The pos label shows where the next value will land.",
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
            Why fill back to front?
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We always know the current largest square (it's at one of the two ends), but we
            don't know the current smallest. Filling from the back lets us place confidently
            without needing to shift anything. Each step is a single comparison and a single
            write — no sorting required. Try{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              -3, -2, -1
            </code>{" "}
            (left always wins) or{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              1, 2, 3
            </code>{" "}
            (right always wins) to see the two extremes.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
