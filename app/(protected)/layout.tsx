// React
import { ReactNode } from "react"

// Next.js
import type { Metadata } from "next"

// Components
import { redirect } from "next/navigation"
import { LayoutProviders } from "./providers"

// Auth
import { getUserServer } from "@/lib/auth/get-user"

export const metadata: Metadata = {
  title: "Dashboard | stocKit",
  description: "Manage your inventory with stocKit",
}

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function RootLayout({ children }: Readonly<DashboardLayoutProps>) {
  const { user } = await getUserServer()

  if (!user) redirect("/?next=/dashboard")

  return <LayoutProviders>{children}</LayoutProviders>
}
