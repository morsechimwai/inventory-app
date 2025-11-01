// React
import { ReactNode, Suspense } from "react"

// Components
import AppSidebar from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "sonner"

interface LayoutProvidersProps {
  children: ReactNode
}

export function LayoutProviders({ children }: LayoutProvidersProps) {
  return (
    <SidebarProvider>
      <Suspense fallback={<Skeleton className="h-screen w-60" />}>
        <AppSidebar />
      </Suspense>
      <main className="w-full">
        <Suspense fallback={<Skeleton className="h-16 w-full" />}>
          <SiteHeader />
        </Suspense>
        {children}
      </main>
      <Toaster />
    </SidebarProvider>
  )
}
