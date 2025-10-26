import Link from "next/link";

// Icons
import { BarChart2, Container, LucideIcon, Settings2 } from "lucide-react";

interface SideBarProps {
  currentPath: string;
}

interface Navigation {
  name: string;
  href: string;
  icon: LucideIcon;
}

export default function SideBar({ currentPath = "/dashboard" }: SideBarProps) {
  const navigation: Navigation[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart2,
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Container,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings2,
    },
  ];
  return (
    <div className="fixed left-0 top-0 bg-primary text-white w-64 min-h-screen p-6 z-10">
      <div className="mb-8">
        <div className="flex gap-2">
          <h2 className="text-2xl font-black font-sans">Inventory App</h2>
        </div>
      </div>

      <div className="text-sm text-background font-bold font-sans uppercase">
        Inventory
      </div>

      <nav className="space-y-2">
        <div className="text-sm text-foreground"></div>
        {navigation.map((item) => {
          const isActive = currentPath === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              href={item.href}
              key={item.name}
              className={`flex items-center gap-2 p-2 rounded-md ${
                isActive
                  ? "bg-primary-foreground"
                  : "hover:bg-primary-foreground/20"
              }`}
            >
              <IconComponent
                className={`size-4.5 ${
                  isActive ? "text-foreground" : "text-background"
                }`}
              />
              <span
                className={`text-sm font-bold font-sans ${
                  isActive ? "text-foreground" : "text-background"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
