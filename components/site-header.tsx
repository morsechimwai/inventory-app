"use client"

// Next.js
import Link from "next/link"
import { usePathname } from "next/navigation"

// Components
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

// Icons
import { Github } from "lucide-react"

export function SiteHeader() {
  // Get current pathname
  const pathname = usePathname()

  // Normalize path to avoid trailing slashes
  const normalizePath = (path: string) =>
    path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path

  // Determine current path name
  const currentPath =
    normalizePath(pathname).split("/").pop() === "dashboard"
      ? "dashboard"
      : normalizePath(pathname).split("/").pop() === "inventory-activity"
      ? "activity"
      : normalizePath(pathname).split("/").pop() === "product"
      ? "product"
      : normalizePath(pathname).split("/").pop() === "category"
      ? "category"
      : normalizePath(pathname).split("/").pop() === "unit"
      ? "unit"
      : normalizePath(pathname).split("/").pop() === "account-settings"
      ? "settings"
      : null

  return (
    <header className="flex h-(--header-height) items-center border-b px-4 sticky top-0 z-10 bg-background">
      <div className="flex w-full items-center gap-1 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium capitalize font-sans">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{currentPath}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="link" asChild className="p-0 h-auto font-medium text-sm">
            <Link
              href="https://github.com/morsechimwai/stockit-nextjs-prisma-neon"
              target="_blank"
              className="inline-flex items-center gap-1"
            >
              <Github className="size-4" />
              View code on GitHub
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
