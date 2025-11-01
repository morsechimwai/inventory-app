// React
import { ReactNode } from "react"

// Next.js
import type { Metadata } from "next"

// Components
import { redirect } from "next/navigation"
import { LayoutProviders } from "./providers"

// Auth
import { getUserServer } from "@/lib/auth/get-user"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Dashboard | stocKit",
  description: "Manage your inventory with stocKit",
}

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function RootLayout({ children }: Readonly<DashboardLayoutProps>) {
  const { user } = await getUserServer()

  if (!user) {
    const headersList = await headers()
    const path = headersList.get("x-invoke-path") || "/dashboard"
    redirect(`/?next=${path}`)
  }

  return <LayoutProviders>{children}</LayoutProviders>
}
