interface PageHeaderProps {
  title: string
  subtitle: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="max-w-lg text-lg text-muted-foreground">{subtitle}</p>
    </div>
  )
}
