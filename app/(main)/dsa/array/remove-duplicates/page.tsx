import RemoveDuplicatesVisualizer from "@/components/array/removeDuplicates.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "insertPos = 1",
    detail:
      "The first element is always unique by definition — no comparison needed. The write head starts at index 1, ready for the next unique value.",
  },
  {
    label: "Scan with i from index 1",
    detail:
      "Compare nums[i] with nums[i−1]. Because the array is sorted, duplicates are always adjacent.",
  },
  {
    label: "Unique → write and advance both",
    detail:
      "nums[i] !== nums[i−1]: copy nums[i] to nums[insertPos], then insertPos++ and i++.",
  },
  {
    label: "Duplicate → skip",
    detail:
      "nums[i] === nums[i−1]: advance i only. insertPos stays — the slot stays open for the next unique value.",
  },
  {
    label: "Return insertPos",
    detail:
      "After the scan, insertPos equals the count of unique elements. Elements beyond that index are irrelevant.",
  },
]

const CODE = `function removeDuplicatesSorted(nums) {
  if (nums.length === 0) return 0;

  let insertPos = 1;

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) {
      nums[insertPos] = nums[i];
      insertPos++;
    }
  }

  return insertPos;
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
      <Badge color="bg-purple-500/10 text-purple-500">Slow / Fast</Badge>
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
        Given a <span className="font-medium">sorted</span> integer array{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">nums</code>, remove
        duplicates <span className="font-medium">in-place</span> so each element appears only once.
        Return the number of unique elements. The relative order must be maintained. Elements
        beyond the returned length do not matter.
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">5</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Array after</span>
          <code className="rounded bg-muted px-2 py-1">[0, 1, 2, 3, 4, ...]  ← tail ignored</code>
        </div>
      </div>
    </div>
  )
}

function ApproachSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Approach — Slow / Fast Pointer</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Because the array is sorted, duplicates are always{" "}
        <span className="font-medium text-foreground">adjacent</span>. We never need a hash set —
        a single comparison with the previous element is enough. The slow pointer{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">insertPos</code> builds
        the deduplicated prefix in-place while the fast pointer{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">i</code> scans ahead.
      </p>
      <ol className="flex flex-col gap-3">
        {APPROACH_STEPS.map((s, idx) => (
          <li key={idx} className="flex gap-3 text-sm">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {idx + 1}
            </span>
            <span>
              <span className="font-medium text-foreground font-mono">{s.label}</span>
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
          <span className="ml-3 text-xs text-muted-foreground font-mono">removeDuplicatesSorted.js</span>
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
          { label: "Time", value: "O(n)", note: "single pass through array" },
          { label: "Space", value: "O(1)", note: "in-place, no extra memory" },
          { label: "Best case", value: "O(n)", note: "no duplicates — all placed" },
          { label: "Worst case", value: "O(n)", note: "all duplicates — all skipped" },
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

export default function RemoveDuplicatesPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Remove Duplicates"
          subtitle="Remove duplicates from a sorted array in-place and return the new length."
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
          own inputs — the visualizer resets automatically as you type. The array
          must be sorted for the algorithm to work correctly.
        </p>
        <RemoveDuplicatesVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Two pointers start at index 1 and move rightward. Cell [0] is always green
          from the start — the first element is trivially unique:
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              borderCn: "border-l-purple-500",
              label: "S — insertPos",
              labelCn: "text-purple-500",
              detail:
                "The write head. Only advances when a unique value is found and written. Marks the boundary of the deduplicated prefix.",
            },
            {
              borderCn: "border-l-blue-500",
              label: "F — i (scanner)",
              labelCn: "text-blue-500",
              detail:
                "The fast scanner. Advances every step — whether the current element is unique or a duplicate.",
            },
            {
              borderCn: "border-l-green-500",
              label: "Green cells [0 .. insertPos−1]",
              labelCn: "text-green-600",
              detail:
                "The confirmed unique prefix. Each unique value found is written here. This region grows by one on every unique step.",
            },
            {
              borderCn: "border-l-border",
              label: "Gray cells [insertPos .. end]",
              labelCn: "text-muted-foreground",
              detail:
                "The stale tail — shown with strikethrough when done. These positions hold old duplicate values and are not part of the answer.",
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
            Why sorted order is required
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The algorithm only compares{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              nums[i]
            </code>{" "}
            with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              nums[i−1]
            </code>
            . This works because in a sorted array all copies of a value are grouped together —
            so a single adjacent comparison is sufficient to detect duplicates. On an unsorted array
            you would need a hash set (O(n) space). Try{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              1, 2, 3, 4
            </code>{" "}
            (no duplicates — every step places) or{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              5, 5, 5
            </code>{" "}
            (all duplicates — all skipped, badge shows 1).
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
