"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar/DashboardSidebar";
import { Separator } from "@/components/ui/separator";
import { UserDropdown } from "@/components/dashboard/header/UserDropdown";
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

  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
  };

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 justify-between">
          <div className="flex items-center gap-3 px-6">
            <SidebarTrigger className="-ml-1 hover:bg-primary" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-xl font-semibold text-foreground">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-4 px-4">
            <UserDropdown user={user} />
          </div>
        </header>
        <Separator orientation="horizontal" className="mb-4" />
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
