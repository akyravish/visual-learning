import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { CardLink } from "@/components/ui/card-link"

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
    <PageLayout>
      <PageHeader
        title="Data Structures & Algorithms"
        subtitle="Pick a topic to start visualizing."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DSA_TOPICS.map((topic) => (
          <CardLink key={topic.href} {...topic} />
        ))}
      </div>
    </PageLayout>
  )
}
