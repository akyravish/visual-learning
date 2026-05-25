import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { CardLink } from "@/components/ui/card-link"

const CATEGORIES = [
  {
    title: "DSA",
    href: "/dsa",
    description: "Data structures and algorithms, visualized step by step.",
  },
]

export default function HomePage() {
  return (
    <PageLayout>
      <PageHeader
        title="Visual Learning"
        subtitle="Pick a category to get started."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <CardLink key={cat.href} {...cat} />
        ))}
      </div>
    </PageLayout>
  )
}
