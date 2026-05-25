import MoveZeroesVisualizer from "@/components/array/moveZeroes.component"
import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

// ─── Static content ───────────────────────────────────────────────────────────

const APPROACH_STEPS = [
  {
    label: "insertPos = 0",
    detail:
      "The slow pointer marks the next available slot for a non-zero element. It only advances when something is written.",
  },
  {
    label: "Scan with i (fast pointer)",
    detail:
      "i visits every element. If nums[i] !== 0, copy it to nums[insertPos] and advance both pointers.",
  },
  {
    label: "Skip zeros",
    detail:
      "If nums[i] === 0, advance i only. insertPos stays — the slot stays open for the next non-zero.",
  },
  {
    label: "Fill the tail",
    detail:
      "Once i reaches the end, every index from insertPos onward is set to 0. This is a second linear pass.",
  },
]

const CODE = `function moveZeroes(nums) {
  let insertPos = 0;

  // Phase 1: place all non-zeros at the front
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nums[insertPos] = nums[i];
      insertPos++;
    }
  }

  // Phase 2: fill the rest with zeros
  while (insertPos < nums.length) {
    nums[insertPos] = 0;
    insertPos++;
  }

  return nums;
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
        Given an integer array{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">nums</code>, move all{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">0</code>s to the end
        while maintaining the relative order of the non-zero elements. Do it{" "}
        <span className="font-medium">in-place</span> with no extra array.
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Input</span>
          <code className="rounded bg-muted px-2 py-1">[0, 1, 0, 3, 12]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Output</span>
          <code className="rounded bg-muted px-2 py-1">[1, 3, 12, 0, 0]</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">Constraint</span>
          <code className="rounded bg-muted px-2 py-1">relative order of non-zeros preserved</code>
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
        Unlike the opposite-direction pattern, both pointers here start at index 0 and move{" "}
        <span className="font-medium text-foreground">in the same direction</span>. The fast pointer{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">i</code> scans every
        element. The slow pointer{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">insertPos</code> only
        advances when a non-zero is written — creating a growing "clean" prefix at the front.
      </p>
      <ol className="flex flex-col gap-3">
        {APPROACH_STEPS.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {i + 1}
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
          <span className="ml-3 text-xs text-muted-foreground font-mono">moveZeroes.js</span>
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
          { label: "Time", value: "O(n)", note: "two linear passes" },
          { label: "Space", value: "O(1)", note: "in-place, no extra array" },
          { label: "Best case", value: "O(n)", note: "no zeros — full scan, no fill" },
          { label: "Worst case", value: "O(n)", note: "all zeros — scan + full fill" },
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

export default function MoveZeroesPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Move Zeroes"
          subtitle="Move all zeros to the end while preserving the order of non-zero elements."
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
        <MoveZeroesVisualizer />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">How to read the visualizer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Two pointers start at index 0 and move rightward — but at different speeds:
        </p>
        <ul className="flex flex-col gap-3">
          {[
            {
              borderCn: "border-l-purple-500",
              label: "S — insertPos (write head)",
              labelCn: "text-purple-500",
              detail:
                "The slow pointer. Only advances when a non-zero is written to its slot. It marks the boundary of the clean prefix.",
            },
            {
              borderCn: "border-l-blue-500",
              label: "F — i (scanner)",
              labelCn: "text-blue-500",
              detail:
                "The fast pointer. Advances every step — whether it found a zero or non-zero.",
            },
            {
              borderCn: "border-l-green-500",
              label: "Green cells",
              labelCn: "text-green-600",
              detail:
                "Non-zero elements that have been placed into their final positions. The green region grows from the left.",
            },
            {
              borderCn: "border-l-border",
              label: "Gray cells (Phase 2)",
              labelCn: "text-muted-foreground",
              detail:
                "Positions filled with 0 in the second pass. Everything from insertPos onward becomes gray.",
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
            Why two phases instead of swapping?
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A swap-based approach also works in O(n) but does more writes. This version writes each
            non-zero once (Phase 1) and fills zeros once (Phase 2) — minimising total write
            operations. Try{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              0, 0, 0
            </code>{" "}
            to see Phase 1 skip everything and Phase 2 fill all three slots, or{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              1, 2, 3
            </code>{" "}
            to see Phase 1 place all elements and Phase 2 do nothing.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
