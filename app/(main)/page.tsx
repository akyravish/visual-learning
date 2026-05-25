import Link from "next/link"

const CATEGORIES = [
  {
    title: "DSA",
    href: "/dsa",
    description: "Data structures and algorithms, visualized step by step.",
  },
]

export default function HomePage() {
  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Visual Learning</h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Pick a category to get started.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group flex flex-col gap-2 rounded-xl border p-6 transition-colors hover:bg-accent"
          >
            <span className="text-lg font-semibold group-hover:underline">
              {cat.title}
            </span>
            <span className="text-sm text-muted-foreground">
              {cat.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
