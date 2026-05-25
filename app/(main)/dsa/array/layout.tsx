import React, { type ReactNode } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ArraySidebar } from "@/components/array/array-sidebar"

export default function ArrayLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      className="flex flex-1"
      style={{ "--sidebar-top": "var(--nav-height)" } as React.CSSProperties}
    >
      <ArraySidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">Array</span>
        </div>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
