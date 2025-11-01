// React
import { ReactNode } from "react"

// Next.js
import { Metadata } from "next"

// Auth
import { getUserServer } from "@/lib/auth/get-user"

// Providers
import { LayoutProviders } from "@/app/(protected)/providers"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your inventory with stocKit",
}

interface HandlerLayoutProps {
  children: ReactNode
}

export default async function HandlerLayout({ children }: HandlerLayoutProps) {
  const { user } = await getUserServer()

  if (!user) return <>{children}</>

  return <LayoutProviders>{children}</LayoutProviders>
}
