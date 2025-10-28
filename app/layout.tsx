// SEO Metadata
import type { Metadata } from "next";

// Stackframe
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";

// Fonts
import { Geist_Mono, Nunito } from "next/font/google";

// global CSS
import "@/app/globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StocKit - Inventory Management",
  description: "Manage your inventory with StocKit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${geistMono.variable} antialiased`}>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <main className="w-full">{children}</main>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
