// ─── Types ────────────────────────────────────────────────────────────────────

export interface Algorithm {
  title: string
  href: string
  description: string
}

export interface StepGroup {
  step: string
  items: Algorithm[]
}

export interface Phase {
  phase: string
  groups: StepGroup[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const PHASES: Phase[] = [
  {
    phase: "Two Pointers",
    groups: [
      {
        step: "Fundamentals",
        items: [
          { title: "Two Sum II", href: "/dsa/array/two-sum-ii", description: "Canonical two-pointer template" },
          { title: "Valid Palindrome", href: "/dsa/array/valid-palindrome", description: "Same template, equality check" },
          { title: "Move Zeroes", href: "/dsa/array/move-zeroes", description: "Slow/fast pointer variant" },
          { title: "Remove Duplicates", href: "/dsa/array/remove-duplicates", description: "Remove duplicates from sorted array" },
          { title: "Squares of Sorted Array", href: "/dsa/array/squares-of-sorted-array", description: "Two-pointer squaring" },
        ],
      },
      {
        step: "Advanced",
        items: [
          { title: "Container With Most Water", href: "/dsa/array/container-with-most-water", description: "Greedy pointer move" },
          { title: "Three Sum", href: "/dsa/array/three-sum", description: "Two-pointer inside a loop" },
          { title: "Sort Colors", href: "/dsa/array/sort-colors", description: "Dutch National Flag, 3-pointer invariant" },
          { title: "Trapping Rain Water", href: "/dsa/array/trapping-rain-water", description: "Two-pointer with max tracking" },
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
          { title: "Max Sum of K Consecutive", href: "/dsa/array/max-sum-k-consecutive", description: "Fixed-size sliding window" },
          { title: "Min Size Subarray Sum", href: "/dsa/array/min-size-subarray-sum", description: "Shrink from left" },
          { title: "Longest Substr No Repeat", href: "/dsa/array/longest-substring-no-repeat", description: "Character frequency window" },
        ],
      },
      {
        step: "Variable Window",
        items: [
          { title: "Longest Subarray Sum K", href: "/dsa/array/longest-subarray-sum-k", description: "Prefix sum intuition required" },
          { title: "Subarray Product < K", href: "/dsa/array/subarray-product-less-than-k", description: "Variable window with product" },
          { title: "Max Consecutive Ones III", href: "/dsa/array/max-consecutive-ones-iii", description: "Flip budget pattern" },
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
          { title: "Range Sum Query", href: "/dsa/array/range-sum-query", description: "prefix[r] - prefix[l-1]" },
          { title: "Pivot Index", href: "/dsa/array/pivot-index", description: "Left sum equals right sum" },
        ],
      },
      {
        step: "Prefix + HashMap",
        items: [
          { title: "Subarray Sum Equals K", href: "/dsa/array/subarray-sum-equals-k", description: "Canonical prefix-sum hash" },
          { title: "Continuous Subarray Sum", href: "/dsa/array/continuous-subarray-sum", description: "Modular prefix hash" },
        ],
      },
      {
        step: "Optimization Variants",
        items: [
          { title: "Product Except Self", href: "/dsa/array/product-except-self", description: "Prefix × suffix, no division" },
          { title: "Maximum Subarray", href: "/dsa/array/maximum-subarray", description: "Running max subarray (Kadane)" },
          { title: "Max Product Subarray", href: "/dsa/array/maximum-product-subarray", description: "Track both min and max" },
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
          { title: "Spiral Matrix", href: "/dsa/array/spiral-matrix", description: "Layer-by-layer traversal" },
          { title: "Rotate Image", href: "/dsa/array/rotate-image", description: "Transpose + reverse" },
        ],
      },
      {
        step: "Logic-Heavy",
        items: [
          { title: "Set Matrix Zeroes", href: "/dsa/array/set-matrix-zeroes", description: "In-place marker trick" },
          { title: "Search a 2D Matrix", href: "/dsa/array/search-2d-matrix", description: "Binary search on flattened" },
          { title: "Valid Sudoku", href: "/dsa/array/valid-sudoku", description: "Row, col, box constraint check" },
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
          { title: "Merge Sorted Arrays", href: "/dsa/array/merge-sorted-arrays", description: "Merge from end" },
          { title: "Rotate Array", href: "/dsa/array/rotate-array", description: "Reverse trick" },
          { title: "Jump Game", href: "/dsa/array/jump-game", description: "Greedy reachability" },
          { title: "Insert Interval", href: "/dsa/array/insert-interval", description: "Three-phase merge" },
          { title: "Merge Intervals", href: "/dsa/array/merge-intervals", description: "Sort + greedy" },
        ],
      },
      {
        step: "Harder Manipulation",
        items: [
          { title: "Kth Largest Element", href: "/dsa/array/kth-largest-element", description: "Quickselect algorithm" },
          { title: "Next Permutation", href: "/dsa/array/next-permutation", description: "Find dip + swap + reverse" },
          { title: "First Missing Positive", href: "/dsa/array/first-missing-positive", description: "Index-as-hash (cycle sort)" },
        ],
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const ALL_ITEMS = PHASES.flatMap((p) => p.groups.flatMap((g) => g.items))

export function globalNum(href: string): number {
  return ALL_ITEMS.findIndex((item) => item.href === href) + 1
}
