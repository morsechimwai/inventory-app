"use client"

import { useCallback, useEffect, useMemo } from "react"
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
    label: "overview",
    items: [
      { title: "dashboard", url: "/dashboard", icon: BarChart2 },
      { title: "activity", url: "/inventory-activities", icon: ArrowUpDown },
    ],
  },
  {
    label: "inventory",
    items: [{ title: "product", url: "/products", icon: Package }],
  },
  {
    label: "setup",
    items: [
      { title: "category", url: "/categories", icon: Tags },
      { title: "unit", url: "/units", icon: Hash },
    ],
  },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { isMobile, setOpenMobile } = useSidebar()

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

  const handleToggleTheme = useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(next)
  }, [resolvedTheme, setTheme])

  // Memoized UserButton
  const MemoizedUserButton = useMemo(
    () => <UserButton showUserInfo colorModeToggle={handleToggleTheme} />,
    [handleToggleTheme]
  )

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
            <Origami className="size-7 stroke-3 stroke-sky-400" />
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
