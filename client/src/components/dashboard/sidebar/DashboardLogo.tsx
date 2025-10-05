"use client";

import * as React from "react";
import Logo from "@/components/branding/Logo";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function DashboardLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="hover:!bg-transparent">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-foreground"
          >
            <Logo size="32px" />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
