// React
import { ReactNode } from "react"

// Components
import AppSidebar from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "sonner"

interface LayoutProvidersProps {
  children: ReactNode
}

export function LayoutProviders({ children }: LayoutProvidersProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SiteHeader />
        {children}
      </main>
      <Toaster />
    </SidebarProvider>
  )
}
