import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <section
      className={cn(
        "mx-auto flex max-w-7xl flex-col gap-12 px-8 py-6",
        className
      )}
    >
      {children}
    </section>
  )
}
