"use client"

import * as React from "react"
import Link from "next/link"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleDashedIcon,
} from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const DSA_TOPICS: { title: string; href: string; description: string }[] = [
  {
    title: "Array",
    href: "/dsa/array",
    description: "Visualize array operations and algorithms step by step.",
  },
  {
    title: "String",
    href: "/dsa/string",
    description: "Explore string manipulation techniques interactively.",
  },
]

const STATUS_ITEMS = [
  { label: "Backlog", href: "/tasks?status=backlog", icon: CircleAlertIcon },
  { label: "To Do", href: "/tasks?status=todo", icon: CircleDashedIcon },
  { label: "Done", href: "/tasks?status=done", icon: CircleCheckIcon },
]

export function MainNav() {
  return (
    <div className="mx-8 my-2 flex items-center justify-between">
      {/* Logo / Home link */}
      <Link
        href="/"
        className="text-sm font-semibold tracking-tight transition-opacity hover:opacity-70"
      >
        Visual Learning
      </Link>

      <NavigationMenu>
        <NavigationMenuList>
          {/* Top-level link */}
          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              render={<Link href="/" />}
            >
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
          {/* DSA */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>DSA</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-64 p-1">
                {DSA_TOPICS.map((topic) => (
                  <ListItem
                    key={topic.href}
                    href={topic.href}
                    title={topic.title}
                  >
                    {topic.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string; title: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink
        render={<Link href={href} />}
        className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
      >
        <div className="mb-0.5 leading-none font-medium">{title}</div>
        <div className="line-clamp-2 text-muted-foreground">{children}</div>
      </NavigationMenuLink>
    </li>
  )
}
