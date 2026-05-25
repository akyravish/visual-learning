# Visual Learning

An interactive DSA (Data Structures & Algorithms) visualization app built with Next.js. Each algorithm gets a full learning post — problem statement, approach, code, complexity analysis, and a step-through visualizer.

## Features

- **Phase-grouped navigation** — algorithms organized by learning phase (Two Pointers, Sliding Window, etc.)
- **Step-by-step visualizers** — animated array cells with pointer labels, step log, and auto-play
- **Live input** — edit the array (and target where applicable) and the visualizer resets automatically
- **Dark / light mode** — via `next-themes`
- **Global error handling** — custom 404 and 500 error pages

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| UI primitives | Base UI (`@base-ui/react`) |
| Component library | shadcn/ui |
| Animation | Framer Motion |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Language | TypeScript |
| Package manager | pnpm |

## Project Structure

```
visual-learning/
├── app/
│   ├── layout.tsx              # Root layout — MainNav + ThemeProvider
│   ├── globals.css             # Global styles and CSS custom properties
│   ├── not-found.tsx           # Global 404 page
│   ├── error.tsx               # Global runtime error page
│   └── (main)/
│       ├── page.tsx            # Home — DSA topic picker
│       └── dsa/
│           ├── page.tsx        # DSA index — Array / String cards
│           ├── array/
│           │   ├── page.tsx                          # Array index — phase-grouped cards
│           │   ├── two-sum-ii/page.tsx
│           │   ├── valid-palindrome/page.tsx
│           │   ├── move-zeroes/page.tsx
│           │   ├── remove-duplicates/page.tsx
│           │   └── squares-of-sorted-array/page.tsx
│           └── string/
│               └── page.tsx    # String index (stub)
│
├── components/
│   ├── navigation/
│   │   └── mainNav.component.tsx
│   ├── array/
│   │   ├── array-data.ts               # Nav registry — all algorithm metadata
│   │   ├── twoSum.component.tsx
│   │   ├── validPalindrome.component.tsx
│   │   ├── moveZeroes.component.tsx
│   │   ├── removeDuplicates.component.tsx
│   │   └── sortedSquares.component.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── separator.tsx
│       ├── card-link.tsx
│       ├── page-header.tsx
│       ├── page-layout.tsx
│       └── ...                         # Other shadcn/ui primitives
│
├── hooks/                      # Custom React hooks
├── lib/                        # Shared utilities (cn, etc.)
├── CLAUDE.md                   # Recipe book for adding new visualizer pages
├── package.json
└── tsconfig.json
```

## Implemented Algorithms

| # | Algorithm | Pattern | Route |
|---|-----------|---------|-------|
| Q1 | Two Sum II | Opposite-direction pointers | `/dsa/array/two-sum-ii` |
| Q2 | Valid Palindrome | Opposite-direction pointers | `/dsa/array/valid-palindrome` |
| Q6 | Move Zeroes | Slow / fast same-direction | `/dsa/array/move-zeroes` |
| Q7 | Remove Duplicates | Slow / fast same-direction | `/dsa/array/remove-duplicates` |
| Q8 | Squares of Sorted Array | Opposite-direction, fill back-to-front | `/dsa/array/squares-of-sorted-array` |

## Page Hierarchy

```
/                         Home
└── /dsa                  DSA index
    ├── /dsa/array        Array index (phase-grouped cards)
    │   ├── /two-sum-ii
    │   ├── /valid-palindrome
    │   ├── /move-zeroes
    │   ├── /remove-duplicates
    │   └── /squares-of-sorted-array
    └── /dsa/string       String index (coming soon)
```

## Each Algorithm Page

Every implemented page follows the same structure:

1. **Header** — title, subtitle, tags (pattern, time, space, difficulty)
2. **Problem statement** — description, input/output examples, constraints
3. **Approach** — numbered steps with prose explanation
4. **Implementation** — code in a terminal-style block
5. **Complexity** — 4-card grid (Time / Space / Best / Worst)
6. **Interactive visualizer** — step-through with auto-play and live input
7. **How to read the visualizer** — pointer legend and key insight callout

## Algorithm Data

All array algorithm metadata lives in [components/array/array-data.ts](components/array/array-data.ts).

| Export | Description |
|--------|-------------|
| `PHASES` | Full phase → step group → algorithm tree |
| `ALL_ITEMS` | Flat list of every algorithm (in order) |
| `globalNum(href)` | Returns the 1-based sequential number for an algorithm |

### Phases

1. **Two Pointers** — Fundamentals (opposite-direction + slow/fast) and Advanced
2. **Sliding Window** — Fixed and variable window
3. **Prefix Sum + Counting** — Basic prefix, prefix + HashMap, optimization variants
4. **Matrix / 2D Array** — Traversal and logic-heavy
5. **Advanced Manipulation** — Core interview and harder manipulation

## Reusable UI Components

| Component | File | Props |
|-----------|------|-------|
| `PageLayout` | `components/ui/page-layout.tsx` | `children`, `className?` |
| `PageHeader` | `components/ui/page-header.tsx` | `title`, `subtitle` |
| `CardLink` | `components/ui/card-link.tsx` | `href`, `title`, `description` |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type check
pnpm typecheck

# Format code
pnpm format

# Production build
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Adding a New Algorithm Page

See [CLAUDE.md](CLAUDE.md) for the full recipe with copy-paste templates.

Quick steps:

1. Check `components/array/array-data.ts` — the entry likely already exists
2. Create `components/array/<camelCase>.component.tsx` (visualizer)
3. Create `app/(main)/dsa/array/<slug>/page.tsx` (learning post)
4. The card appears automatically on the array index page

## Adding a New Topic (e.g. String)

1. Create `app/(main)/dsa/string/page.tsx` with `PageLayout` + `PageHeader` + cards
2. Create `components/string/string-data.ts` following the same shape as `array-data.ts`
3. Add the route to the `DSA_TOPICS` navigation list in `mainNav.component.tsx`
