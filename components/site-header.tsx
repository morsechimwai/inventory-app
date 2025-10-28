"use client";

// Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";

// Components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Github } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const normalizePath = (path: string) =>
    path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  const currentPath = normalizePath(pathname).split("/").pop();

  return (
    <header className="flex h-(--header-height) items-center border-b px-4">
      <div className="flex w-full items-center gap-1 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium capitalize font-sans">
          {currentPath}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Link
              href="https://github.com/morsechimwai/stockit-nextjs-prisma-neon"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground font-sans"
            >
              <div className="flex items-center gap-1">
                <Github className="mr-2 size-4" />
                <span>View on GitHub</span>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
