"use client";

import * as React from "react";
import {
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import { NavMain } from "@/components/dashboard/sidebar/NavMain";
import { NavInsights } from "./NavInsights";
import { NavUser } from "@/components/dashboard/sidebar/NavUser";
import { DashboardLogo } from "@/components/dashboard/sidebar/DashboardLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Properties",
      url: "/dashboard/properties",
      icon: Building2,
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: CreditCard,
    },
  ],
  navInsights: [
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
};

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="group-data-[collapsible=icon]:justify-center"
      {...props}
    >
      <SidebarHeader>
        <DashboardLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavInsights items={data.navInsights} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
