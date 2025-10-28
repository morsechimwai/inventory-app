// SEO Metadata
import type { Metadata } from "next";

// Sidebar
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";

// Toasters
import { Toaster } from "@/components/ui/sonner";

// Stackframe
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";

// Fonts
import { Geist_Mono, Nunito } from "next/font/google";

// global CSS
import "@/app/globals.css";
import { SiteHeader } from "@/components/site-header";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Dashboard | stocKit",
  description: "Manage your inventory with stocKit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StackProvider app={stackClientApp}>
      <StackTheme>
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
      </StackTheme>
    </StackProvider>
  );
}
