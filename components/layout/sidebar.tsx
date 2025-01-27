"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileIcon,
  FolderIcon,
  UsersIcon,
  HistoryIcon,
  BarChart3Icon,
  HomeIcon,
  ListTodoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Settings2Icon,
  HelpCircleIcon,
  BellIcon,
  Rss,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const routes = [
  {
    label: "Vue d'ensemble",
    icon: HomeIcon,
    href: "/dashboard",
    color: "text-blue-500",
  },
  {
    label: "Documents",
    icon: FileIcon,
    href: "/dashboard/files",
    color: "text-green-500",
  },
  {
    label: "Tâches",
    icon: ListTodoIcon,
    href: "/dashboard/tasks",
    color: "text-purple-500",
  },
  {
    label: "Utilisateurs",
    icon: UsersIcon,
    href: "/dashboard/users",
    color: "text-orange-500",
  },
  {
    label: "Activité",
    icon: HistoryIcon,
    href: "/dashboard/activity",
    color: "text-yellow-500",
    badge: "Nouveau",
  },
  {
    label: "Statistiques",
    icon: BarChart3Icon,
    href: "/dashboard/statistics",
    color: "text-pink-500",
  },
];

const bottomRoutes = [
  {
    label: "Paramètres",
    icon: Settings2Icon,
    href: "/dashboard/settings",
    color: "text-fuchsia-500",
  },
  {
    label: "Aide",
    icon: HelpCircleIcon,
    href: "/dashboard/help",
    color: "text-sky-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "fixed top-0 left-0 h-screen bg-card border-r transition-all duration-300 flex flex-col ",
          isCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        <div className="p-4 pb-2 flex justify-between items-center shrink-0">
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              isCollapsed && "opacity-0"
            )}
          >
            <Image
              src="/docusphere.png"
              alt="docusphere logo"
              width={80}
              height={80}
              className="object-cover object-center rounded"
            />
            <span className="font-extrabold text-xl">DocuSphere</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 w-full">
          <div className="space-y-2 p-2">
            {routes.map((route) => {
              const isActive = pathname === route.href;

              if (isCollapsed) {
                return (
                  <Tooltip key={route.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={route.href}
                        className={cn(
                          "flex items-center justify-center h-12 w-12 rounded-lg transition-all hover:bg-accent",
                          isActive && "bg-accent"
                        )}
                      >
                        <route.icon className={cn("h-5 w-5", route.color)} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="flex items-center gap-2"
                    >
                      {route.label}
                      {route.badge && (
                        <Badge variant="secondary" className="h-5 px-1.5">
                          {route.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-4 px-4 h-12 rounded-lg transition-all hover:bg-accent group relative",
                    isActive && "bg-accent"
                  )}
                >
                  <route.icon className={cn("h-5 w-5", route.color)} />
                  <span className="font-medium text-sm">{route.label}</span>
                  {route.badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ml-auto",
                        typeof route.badge === "number"
                          ? "h-5 w-5 p-0 flex items-center justify-center"
                          : "px-1.5"
                      )}
                    >
                      {route.badge}
                    </Badge>
                  )}
                  <div
                    className={cn(
                      "absolute left-0 h-full w-1 rounded-r-full bg-primary scale-y-0 transition-transform",
                      isActive && "scale-y-100"
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </ScrollArea>

        <div className="mt-auto p-2 border-t shrink-0">
          {bottomRoutes.map((route) => {
            if (isCollapsed) {
              return (
                <Tooltip key={route.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={route.href}
                      className="flex items-center justify-center h-12 w-12 rounded-lg transition-all hover:bg-accent"
                    >
                      <route.icon className={cn("h-5 w-5", route.color)} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{route.label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={route.href}
                href={route.href}
                className="flex items-center gap-4 px-4 h-12 rounded-lg transition-all hover:bg-accent"
              >
                <route.icon className={cn("h-5 w-5", route.color)} />
                <span className="font-medium text-sm">{route.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
