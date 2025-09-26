"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar/DashboardSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRedirectIfSignedOut } from "@/hooks/useRedirectIfSignedOut";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  useRedirectIfSignedOut();

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex py-2 max-w-7xl shrink-0 items-center justify-between">
          <div className="flex items-center px-6">
            <SidebarTrigger className="hover:bg-primary" />
          </div>
        </header>
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
