# Visual Learning

An interactive DSA (Data Structures & Algorithms) visualization app built with Next.js. Step through algorithms visually to build intuition.

## Features

- **Phase-grouped navigation** — algorithms organized by learning phase (Two Pointers, Sliding Window, etc.)
- **Step-by-step visualizers** — interactive SVG animations for each algorithm
- **Dark / light mode** — via `next-themes`
- **Global error handling** — custom 404 and 500 error pages

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI primitives | Base UI (`@base-ui/react`) |
| Component library | shadcn/ui |
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
│   └── (main)/                 # Route group (no URL segment)
│       ├── page.tsx            # Home — DSA topic picker
│       └── dsa/
│           ├── page.tsx        # DSA index — Array / String cards
│           ├── array/
│           │   └── page.tsx    # Array index — phase-grouped algorithm cards
│           └── string/
│               └── page.tsx    # String index (stub)
│
├── components/
│   ├── navigation/
│   │   └── mainNav.component.tsx   # Top navigation bar
│   ├── array/
│   │   └── array-data.ts           # Single source of truth for all array algorithm data
│   └── ui/
│       ├── card-link.tsx           # Reusable navigation card
│       ├── page-header.tsx         # Reusable page title + subtitle block
│       ├── page-layout.tsx         # Reusable page wrapper with max-width and padding
│       ├── navigation-menu.tsx     # Base UI navigation menu primitives
│       ├── button.tsx              # Button primitive
│       ├── separator.tsx           # Separator line
│       └── ...                     # Other shadcn/ui primitives
│
├── hooks/                      # Custom React hooks
├── lib/                        # Shared utilities (cn, etc.)
├── public/                     # Static assets
├── package.json
└── tsconfig.json
```

## Page Hierarchy

```
/               Home            DSA topic picker card
└── /dsa        DSA             Array + String cards
    ├── /dsa/array   Array      Phase-grouped algorithm cards
    └── /dsa/string  String     (coming soon)
```

## Algorithm Data

All array algorithm metadata lives in [components/array/array-data.ts](components/array/array-data.ts).

It exports:

| Export | Description |
|--------|-------------|
| `PHASES` | Full phase → step group → algorithm tree |
| `ALL_ITEMS` | Flat list of every algorithm (in order) |
| `globalNum(href)` | Returns the 1-based sequential number for an algorithm |

### Current Phases

1. **Two Pointers** — Opposite ends, same direction, fast & slow
2. **Sliding Window** — Fixed size, variable size, multi-window
3. **Prefix Sum + Counting** — Prefix sums, frequency maps, difference arrays
4. **Matrix / 2D Array** — Traversal, spiral, in-place rotation, diagonals
5. **Advanced Manipulation** — Sorting tricks, next permutation, partition

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

1. Add the entry to `PHASES` in [components/array/array-data.ts](components/array/array-data.ts)
2. Create the page at `app/(main)/dsa/array/<slug>/page.tsx`
3. Build the visualizer component in `components/array/`
4. The card will appear automatically on the array index page

## Adding a New Topic (e.g. String)

1. Create `app/(main)/dsa/string/page.tsx` with a `PageLayout` + `PageHeader` + cards
2. Create `components/string/string-data.ts` following the same shape as `array-data.ts`
3. Add the route to the `DSA_TOPICS` navigation list in `mainNav.component.tsx`
