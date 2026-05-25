"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayersIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const ARRAY_ALGORITHMS = [
  {
    label: "Sliding Window",
    href: "/dsa/array",
    description: "Min length subarray",
  },
]

export function ArraySidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <LayersIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Array</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Algorithms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ARRAY_ALGORITHMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.description}
                      render={<Link href={item.href} />}
                    >
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
