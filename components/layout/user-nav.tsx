"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { useSession } from "next-auth/react";
import { Badge } from "../ui/badge";

export function UserNav() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative border h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user.avatar} alt={session?.user.name} />
            <AvatarFallback>
              {(session?.user.name || "Admin").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="w-full gap-4 flex items-center justify-between">
              <p className="text-sm font-medium leading-none">
                {session?.user.name}
              </p>
              <Badge className="bg-lime-500 text-black cursor-pointer">
                {session?.user.role === "Viewer"
                  ? "Lecteur"
                  : session?.user.role === "Editor"
                  ? "Editeur"
                  : "Admin"}
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">Paramétres</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <button onClick={handleLogout} className="cursor-pointer px-2">
          Se déconnecter
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
