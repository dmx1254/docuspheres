"use client";

import { UserNav } from "@/components/layout/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Rss } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileMenu from "../mobile-menu";

export function Header() {
  const pathname = usePathname();
  const showDashboardButton = pathname.startsWith("/blog");

  return (
    <div className="border-b text-center">
      <MobileMenu />
      <div className="flex h-16 items-center px-4">
        {showDashboardButton && (
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        )}
        <div className="ml-auto flex items-center space-x-4">
          {!showDashboardButton && (
            <div className="flex items-center gap-2">
              <Rss className="text-violet-500" size={22} />
              <Link href="/blog" className="text-sm">
                Voir le blog
              </Link>
            </div>
          )}

          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </div>
  );
}
