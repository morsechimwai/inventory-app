"use client"

// React
import { ReactNode } from "react"
// Components
import { ThemeProvider } from "@/components/theme-provider"

// Stackframe
import { stackClientApp } from "@/stack/client"
import { StackProvider, StackTheme } from "@stackframe/stack"

// Analytics
import { Analytics } from "@vercel/analytics/next"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <StackProvider app={stackClientApp}>
        <StackTheme>{children}</StackTheme>
        <Analytics />
      </StackProvider>
    </ThemeProvider>
  )
}
