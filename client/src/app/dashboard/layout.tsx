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
import { useRedirectIfSignedOut } from "@/hooks/useRedirectIfSignedOut";
import { useSession } from "next-auth/react";

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
  useRedirectIfSignedOut();
  const { status } = useSession();
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
        {status === "loading" ? (
          <div className="flex min-h-svh w-full items-center justify-center">
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="animate-spin rounded-full size-8 border-b-2 border-primary" />
              Loading...
            </div>
          </div>
        ) : (
          <>
            <header className="flex py-2 max-w-7xl shrink-0 items-center justify-between">
              <div className="flex items-center px-6">
                <SidebarTrigger className="hover:bg-primary" />
              </div>
            </header>
            <div>{children}</div>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
