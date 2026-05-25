import Link from "next/link"

const DSA_TOPICS = [
  {
    title: "Array",
    href: "/dsa/array",
    description: "Visualize array operations and algorithms.",
  },
  {
    title: "String",
    href: "/dsa/string",
    description: "Explore string manipulation step by step.",
  },
]

export default function DsaPage() {
  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight">
          Data Structures & Algorithms
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Pick a topic to start visualizing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DSA_TOPICS.map((topic) => (
          <Link
            key={topic.href}
            href={topic.href}
            className="group flex flex-col gap-2 rounded-xl border p-6 transition-colors hover:bg-accent"
          >
            <span className="text-lg font-semibold group-hover:underline">
              {topic.title}
            </span>
            <span className="text-sm text-muted-foreground">
              {topic.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
