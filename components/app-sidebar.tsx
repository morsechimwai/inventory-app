"use client";

import { useCallback } from "react";
// Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

// Components
import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

// Icons
import { BarChart2, Container, LucideIcon, Origami } from "lucide-react";

// Stack Auth
import { UserButton } from "@stackframe/stack";

interface Navigation {
  title: string;
  url: string;
  icon: LucideIcon;
}

const navigation: Navigation[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart2,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Container,
  },
];

export default function SideBar2() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const normalizePath = (path: string) =>
    path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  const currentPath = normalizePath(pathname);

  const isActive = (path: string) => {
    return currentPath === normalizePath(path);
  };

  const handleToggleTheme = useCallback(() => {
    const nextTheme = (resolvedTheme ?? "light") === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="h-(--header-height) border-b">
        <SidebarMenuButton variant="default" asChild>
          <Link
            className="flex items-center text-sky-400 hover:text-sky-300 active:text-sky-200"
            href="#"
          >
            <div className="rounded-md bg-sky-400 p-1.5">
              <Origami className="text-sky-50 size-3.5" />
            </div>
            <span className="text-lg font-black font-sans">StocKit</span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="px-2 mt-6">
        <SidebarGroupLabel className="uppercase">Inventory</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <div className="space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      aria-current={active ? "page" : undefined}
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t">
        <div className="px-2">
          <UserButton showUserInfo colorModeToggle={handleToggleTheme} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
