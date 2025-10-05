"use client";

import * as React from "react";
import {
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { NavMain } from "@/components/dashboard/sidebar/NavMain";
import { NavUser } from "@/components/dashboard/sidebar/NavUser";
import { DashboardLogo } from "@/components/dashboard/sidebar/DashboardLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

const data = {
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
  const { data: session } = useSession();

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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
