"use client"

import { useCallback, useState, useEffect, useMemo } from "react"
// Next.js
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

// Components
import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

// Icons
import { ArrowUpDown, BarChart2, Hash, LucideIcon, Origami, Package, Tags } from "lucide-react"

// Stack Auth (โหลดเฉพาะฝั่ง client)
import dynamic from "next/dynamic"
const UserButton = dynamic(() => import("@stackframe/stack").then((mod) => mod.UserButton), {
  ssr: false,
})

interface Navigation {
  title: string
  url: string
  icon: LucideIcon
}

interface NavigationGroup {
  label: string
  items: Navigation[]
}

const navigationGroups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "dashboard", url: "/dashboard", icon: BarChart2 },
      { title: "activity", url: "/inventory-activity", icon: ArrowUpDown },
      { title: "product", url: "/product", icon: Package },
    ],
  },
  {
    label: "Setup",
    items: [
      { title: "category", url: "/category", icon: Tags },
      { title: "unit", url: "/unit", icon: Hash },
    ],
  },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { isMobile, setOpenMobile } = useSidebar()

  // Ensure mounted for theme detection
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  // Handlers
  const handleNavigate = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, setOpenMobile])

  // Toggle theme
  const handleToggleTheme = useCallback(() => {
    const nextTheme = (resolvedTheme ?? "light") === "dark" ? "light" : "dark"
    setTheme(nextTheme)
  }, [resolvedTheme, setTheme])

  // Memoized UserButton
  const MemoizedUserButton = useMemo(
    () => <UserButton showUserInfo colorModeToggle={handleToggleTheme} />,
    [handleToggleTheme]
  )

  // Render after mount
  if (!mounted) return null

  const normalizePath = (path: string) =>
    path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path

  const currentPath = normalizePath(pathname)
  const isActive = (path: string) => currentPath === normalizePath(path)

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="h-(--header-height) border-b">
        <SidebarMenuButton variant="default" asChild>
          <Link
            className="flex items-center text-sky-400 hover:text-sky-300 active:text-sky-200"
            href="#"
            onClick={handleNavigate}
          >
            <div className="rounded-sm bg-sky-400 p-1">
              <Origami className="text-sky-50 size-2" />
            </div>
            <span className="text-xl font-black font-sans">StocKit</span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent className="px-2 mt-6">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <SidebarGroupLabel className="uppercase">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.url)
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          aria-current={active ? "page" : undefined}
                        >
                          <Link href={item.url} onClick={handleNavigate}>
                            <item.icon />
                            <span className="capitalize">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t">
        <div className="px-2">{MemoizedUserButton}</div>
      </SidebarFooter>
    </Sidebar>
  )
}
