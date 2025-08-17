"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar/Sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getPageTitle = (pathname: string): string => {
  const pathSegments = pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];

  const titleMap: Record<string, string> = {
    dashboard: "Overview",
    properties: "Properties",
    transactions: "Transactions",
    categories: "Categories",
    reports: "Reports",
    settings: "Settings",
    profile: "Profile",
    billing: "Billing",
    notifications: "Notifications",
  };

  return titleMap[lastSegment] || "Dashboard";
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-3xl font-semibold text-foreground">
              {pageTitle}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
