import Link from "next/link"

interface CardLinkProps {
  href: string
  title: string
  description: string
}

export function CardLink({ href, title, description }: CardLinkProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-xl border p-6 transition-colors hover:bg-accent"
    >
      <span className="text-lg font-semibold group-hover:underline">
        {title}
      </span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </Link>
  )
}
