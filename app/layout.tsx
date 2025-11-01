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
  metadataBase: new URL("https://stockit-nextjs-prisma-neon.vercel.app"),

  title: {
    default: "StocKit — Simple Inventory for Small Sellers",
    template: "%s | StocKit",
  },

  description:
    "Lightweight stock management for solo sellers and small shops. Track products, stock movements, and costs without Excel or complexity.",

  keywords: [
    "inventory software",
    "stock system",
    "simple stock app",
    "small business inventory",
    "StocKit",
    "Next.js inventory",
    "Prisma SaaS",
    "Neon Postgres",
    "ระบบสต๊อกสินค้า",
    "โปรแกรมจัดการสต๊อก",
    "ระบบคลังสินค้าออนไลน์",
    "จัดการสต๊อกแม่ค้าออนไลน์",
    "โปรแกรมขายของร้านค้า",
    "ระบบร้านค้า SME",
    "ไม่ต้องใช้ Excel จัดการสต๊อก",
  ],

  alternates: {
    canonical: "/",
  },

  other: {
    sitemap: "https://stockit-nextjs-prisma-neon.vercel.app/sitemap.xml",
  },

  openGraph: {
    type: "website",
    url: "https://stockit-nextjs-prisma-neon.vercel.app",
    siteName: "StocKit",
    title: "StocKit — Easy Stock Manager",
    description: "Simple inventory management for micro-business and solo entrepreneurs.",
  },

  twitter: {
    card: "summary_large_image",
    site: "@morsechimwai",
    title: "StocKit — Simple Inventory",
    description: "Track stock easily without spreadsheets.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
