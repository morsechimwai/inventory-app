// React
import { ReactNode } from "react"

// Components
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "sonner"

interface LayoutProvidersProps {
  children: ReactNode
}

export function LayoutProviders({ children }: LayoutProvidersProps) {
  return (
    <SidebarProvider>
      {children}
      <Toaster />
    </SidebarProvider>
  )
}
