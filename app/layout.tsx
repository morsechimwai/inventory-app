// SEO Metadata
import type { Metadata } from "next"

// Fonts
import { Geist_Mono, Nunito } from "next/font/google"

// global CSS
import "@/app/globals.css"

// Providers
import { AppProviders } from "./providers"

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "StocKit - Inventory Management",
  description: "Manage your inventory with StocKit",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          try {
            const theme = localStorage.getItem("theme")
            if (theme === "dark") {
              document.documentElement.classList.add("dark")
            }
          } catch (_) {}
        `,
          }}
        />
      </head>
      <body className={`${nunito.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
