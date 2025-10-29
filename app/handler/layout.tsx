// React
import { ReactNode, Suspense } from "react";

// Next.js
import type { Metadata } from "next";

// Components
import AppSidebar from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Stackframe
import { stackServerApp } from "@/stack/server";

export const metadata: Metadata = {
  title: "Dashboard | stocKit",
  description: "Manage your inventory with stocKit",
};

interface HandlerLayoutProps {
  children: ReactNode;
}

export default async function HandlerLayout({ children }: HandlerLayoutProps) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return <>{children}</>;
  }

  return (
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
  );
}
