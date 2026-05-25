"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayersIcon, ChevronDownIcon } from "lucide-react"
import { Collapsible } from "@base-ui/react/collapsible"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Algorithm {
  label: string
  href: string
  description: string
}

interface StepGroup {
  step: string
  items: Algorithm[]
}

interface Phase {
  phase: string
  groups: StepGroup[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PHASES: Phase[] = [
  {
    phase: "Two Pointers",
    groups: [
      {
        step: "Fundamentals",
        items: [
          {
            label: "Two Sum II",
            href: "/dsa/array/two-sum-ii",
            description: "Canonical two-pointer template",
          },
          {
            label: "Valid Palindrome",
            href: "/dsa/array/valid-palindrome",
            description: "Same template, equality check",
          },
          {
            label: "Move Zeroes",
            href: "/dsa/array/move-zeroes",
            description: "Slow/fast pointer variant",
          },
          {
            label: "Remove Duplicates",
            href: "/dsa/array/remove-duplicates",
            description: "Remove duplicates from sorted array",
          },
          {
            label: "Squares of Sorted Array",
            href: "/dsa/array/squares-of-sorted-array",
            description: "Two-pointer squaring",
          },
        ],
      },
      {
        step: "Advanced",
        items: [
          {
            label: "Container With Most Water",
            href: "/dsa/array/container-with-most-water",
            description: "Greedy pointer move",
          },
          {
            label: "Three Sum",
            href: "/dsa/array/three-sum",
            description: "Two-pointer inside a loop",
          },
          {
            label: "Sort Colors",
            href: "/dsa/array/sort-colors",
            description: "Dutch National Flag, 3-pointer invariant",
          },
          {
            label: "Trapping Rain Water",
            href: "/dsa/array/trapping-rain-water",
            description: "Two-pointer with max tracking",
          },
        ],
      },
    ],
  },
  {
    phase: "Sliding Window",
    groups: [
      {
        step: "Fixed Window",
        items: [
          {
            label: "Max Sum of K Consecutive",
            href: "/dsa/array/max-sum-k-consecutive",
            description: "Fixed-size sliding window",
          },
          {
            label: "Min Size Subarray Sum",
            href: "/dsa/array",
            description: "Shrink from left",
          },
          {
            label: "Longest Substr No Repeat",
            href: "/dsa/array/longest-substring-no-repeat",
            description: "Character frequency window",
          },
        ],
      },
      {
        step: "Variable Window",
        items: [
          {
            label: "Longest Subarray Sum K",
            href: "/dsa/array/longest-subarray-sum-k",
            description: "Prefix sum intuition required",
          },
          {
            label: "Subarray Product < K",
            href: "/dsa/array/subarray-product-less-than-k",
            description: "Variable window with product",
          },
          {
            label: "Max Consecutive Ones III",
            href: "/dsa/array/max-consecutive-ones-iii",
            description: "Flip budget pattern",
          },
        ],
      },
    ],
  },
  {
    phase: "Prefix Sum + Counting",
    groups: [
      {
        step: "Basic Prefix",
        items: [
          {
            label: "Range Sum Query",
            href: "/dsa/array/range-sum-query",
            description: "prefix[r] - prefix[l-1]",
          },
          {
            label: "Pivot Index",
            href: "/dsa/array/pivot-index",
            description: "Left sum equals right sum",
          },
        ],
      },
      {
        step: "Prefix + HashMap",
        items: [
          {
            label: "Subarray Sum Equals K",
            href: "/dsa/array/subarray-sum-equals-k",
            description: "Canonical prefix-sum hash",
          },
          {
            label: "Continuous Subarray Sum",
            href: "/dsa/array/continuous-subarray-sum",
            description: "Modular prefix hash",
          },
        ],
      },
      {
        step: "Optimization Variants",
        items: [
          {
            label: "Product Except Self",
            href: "/dsa/array/product-except-self",
            description: "Prefix × suffix, no division",
          },
          {
            label: "Maximum Subarray",
            href: "/dsa/array/maximum-subarray",
            description: "Running max subarray (Kadane)",
          },
          {
            label: "Max Product Subarray",
            href: "/dsa/array/maximum-product-subarray",
            description: "Track both min and max",
          },
        ],
      },
    ],
  },
  {
    phase: "Matrix / 2D Array",
    groups: [
      {
        step: "Traversal",
        items: [
          {
            label: "Spiral Matrix",
            href: "/dsa/array/spiral-matrix",
            description: "Layer-by-layer traversal",
          },
          {
            label: "Rotate Image",
            href: "/dsa/array/rotate-image",
            description: "Transpose + reverse",
          },
        ],
      },
      {
        step: "Logic-Heavy",
        items: [
          {
            label: "Set Matrix Zeroes",
            href: "/dsa/array/set-matrix-zeroes",
            description: "In-place marker trick",
          },
          {
            label: "Search a 2D Matrix",
            href: "/dsa/array/search-2d-matrix",
            description: "Binary search on flattened",
          },
          {
            label: "Valid Sudoku",
            href: "/dsa/array/valid-sudoku",
            description: "Row, col, box constraint check",
          },
        ],
      },
    ],
  },
  {
    phase: "Advanced Manipulation",
    groups: [
      {
        step: "Core Interview",
        items: [
          {
            label: "Merge Sorted Arrays",
            href: "/dsa/array/merge-sorted-arrays",
            description: "Merge from end",
          },
          {
            label: "Rotate Array",
            href: "/dsa/array/rotate-array",
            description: "Reverse trick",
          },
          {
            label: "Jump Game",
            href: "/dsa/array/jump-game",
            description: "Greedy reachability",
          },
          {
            label: "Insert Interval",
            href: "/dsa/array/insert-interval",
            description: "Three-phase merge",
          },
          {
            label: "Merge Intervals",
            href: "/dsa/array/merge-intervals",
            description: "Sort + greedy",
          },
        ],
      },
      {
        step: "Harder Manipulation",
        items: [
          {
            label: "Kth Largest Element",
            href: "/dsa/array/kth-largest-element",
            description: "Quickselect algorithm",
          },
          {
            label: "Next Permutation",
            href: "/dsa/array/next-permutation",
            description: "Find dip + swap + reverse",
          },
          {
            label: "First Missing Positive",
            href: "/dsa/array/first-missing-positive",
            description: "Index-as-hash (cycle sort)",
          },
        ],
      },
    ],
  },
]

// Sequential numbering across all phases and steps
const ALL_ITEMS = PHASES.flatMap((p) => p.groups.flatMap((g) => g.items))
function globalNum(href: string): number {
  return ALL_ITEMS.findIndex((item) => item.href === href) + 1
}

// Check if a phase contains the current pathname
function phaseContainsPath(phase: Phase, pathname: string): boolean {
  return phase.groups.some((g) =>
    g.items.some((item) => item.href === pathname)
  )
}

// ─── Collapsible Step Group ───────────────────────────────────────────────────

function CollapsibleStepGroup({
  group,
  pathname,
}: {
  group: StepGroup
  pathname: string
}) {
  const hasActive = group.items.some((item) => item.href === pathname)

  return (
    <Collapsible.Root defaultOpen={hasActive || true}>
      <SidebarGroup className="py-0">
        <SidebarGroupLabel className="cursor-pointer font-normal text-muted-foreground/70 select-none hover:text-muted-foreground">
          <Collapsible.Trigger className="group/trigger flex w-full items-center justify-between">
            <span>{group.step}</span>
            <ChevronDownIcon className="size-3 transition-transform duration-200 group-data-panel-open/trigger:rotate-180" />
          </Collapsible.Trigger>
        </SidebarGroupLabel>
        <Collapsible.Panel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.description}
                      render={<Link href={item.href} />}
                    >
                      <span className="w-6 shrink-0 text-xs text-muted-foreground">
                        {globalNum(item.href)}.
                      </span>
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </Collapsible.Panel>
      </SidebarGroup>
    </Collapsible.Root>
  )
}

// ─── Collapsible Phase ────────────────────────────────────────────────────────

function CollapsiblePhase({
  phase,
  pathname,
}: {
  phase: Phase
  pathname: string
}) {
  const isOpen = phaseContainsPath(phase, pathname)

  return (
    <Collapsible.Root defaultOpen={isOpen || true}>
      <Collapsible.Trigger className="group/trigger flex w-full items-center justify-between px-3 pt-4 pb-1 text-left">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {phase.phase}
        </span>
        <ChevronDownIcon className="size-3 text-muted-foreground transition-transform duration-200 group-data-panel-open/trigger:rotate-180" />
      </Collapsible.Trigger>
      <Collapsible.Panel>
        {phase.groups.map((group) => (
          <CollapsibleStepGroup
            key={group.step}
            group={group}
            pathname={pathname}
          />
        ))}
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function ArraySidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <LayersIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Array</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {PHASES.map((phase) => (
          <CollapsiblePhase
            key={phase.phase}
            phase={phase}
            pathname={pathname}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
