import { PageLayout } from "@/components/ui/page-layout"
import { PageHeader } from "@/components/ui/page-header"
import { CardLink } from "@/components/ui/card-link"
import { PHASES } from "@/components/array/array-data"

export default function ArrayPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Array"
        subtitle="Pick a topic to start visualizing."
      />
      {PHASES.map((phase) => (
        <div key={phase.phase} className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">{phase.phase}</h2>
          {phase.groups.map((group) => (
            <div key={group.step} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {group.step}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <CardLink key={item.href} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </PageLayout>
  )
}
