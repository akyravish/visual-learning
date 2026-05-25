import ValidPalindromeVisualizer from "@/components/array/validPalindrome.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "Start at both ends",
    detail: "Place left at index 0 (first element) and right at index n−1 (last element).",
  },
  {
    label: "Compare the pair",
    detail:
      "If nums[left] !== nums[right] → stop immediately. The array is not a palindrome.",
  },
  {
    label: "Match → move both inward",
    detail: "left++ and right-- to check the next inner pair.",
  },
  {
    label: "Pointers meet → done",
    detail:
      "When left >= right every pair has matched — the array is a palindrome.",
  },
]

const CODE = `function isPalindromeArray(arr) {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    if (arr[left] !== arr[right]) return false;
    left++;
    right--;
  }

  return true;
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
        Given an array of integers, determine whether it reads the same forwards and backwards.
        Return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">true</code> if
        it is a palindrome, <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">false</code> otherwise.
        You may only use two pointers — no extra arrays or reversal.
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">[1, 2, 3, 2, 1]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">true</code>
        </div>
        <div className="flex items-start gap-2 pt-1">
          <span className="w-24 shrink-0 text-muted-foreground">Counter-ex.</span>
          <div className="flex flex-col gap-1">
            <code className="rounded bg-muted px-2 py-1">[1, 2, 3, 4, 5]  →  false</code>
            <code className="rounded bg-muted px-2 py-1">1 ≠ 5, mismatch on first comparison</code>
          </div>
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
        A palindrome is symmetric around its center. Instead of reversing the array (O(n) space),
        we check symmetry directly by comparing the outermost pair and moving inward. The moment
        any pair mismatches we can{" "}
        <span className="text-foreground font-medium">stop immediately</span> — no need to check
        the rest.
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
          <span className="ml-3 text-xs text-muted-foreground font-mono">isPalindromeArray.js</span>
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
          { label: "Time", value: "O(n)", note: "at most n/2 comparisons" },
          { label: "Space", value: "O(1)", note: "no extra memory" },
          { label: "Best case", value: "O(1)", note: "first pair mismatches" },
          { label: "Worst case", value: "O(n)", note: "full palindrome traversal" },
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

export default function ValidPalindromePage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Valid Palindrome"
          subtitle="Check if an array reads the same forwards and backwards."
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
          Step through the algorithm or hit Auto-play. Edit the array to try your
          own inputs — the visualizer resets automatically as you type.
        </p>
        <ValidPalindromeVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The two pointers start at opposite ends —{" "}
          <span className="font-medium text-blue-500">L</span> at index 0 and{" "}
          <span className="font-medium text-blue-500">R</span> at the last index.
          Each step compares the pair and moves both inward:
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              borderCn: "border-l-green-500",
              label: "Match",
              labelCn: "text-green-600",
              detail:
                "nums[L] = nums[R] — the pair is symmetric. Both pointers move one step inward.",
            },
            {
              borderCn: "border-l-red-500",
              label: "Mismatch",
              labelCn: "text-red-500",
              detail:
                "nums[L] ≠ nums[R] — symmetry is broken. The algorithm stops immediately and returns false.",
            },
            {
              borderCn: "border-l-blue-500",
              label: "Pointers meet",
              labelCn: "text-blue-500",
              detail:
                "When left ≥ right every pair has been verified. The array is a palindrome.",
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
            Why only half the array is checked
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Each comparison covers a symmetric pair — index 0 with n−1, index 1 with n−2, and so
            on. The pointers converge at the center, so the loop runs at most{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              ⌊n/2⌋
            </code>{" "}
            times regardless of array length — which is still{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              O(n)
            </code>
            . Try a non-palindrome like{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              1, 2, 3, 4, 5
            </code>{" "}
            — notice it stops on the very first step.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
