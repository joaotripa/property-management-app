"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar/DashboardSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRedirectIfSignedOut } from "@/hooks/useRedirectIfSignedOut";
import { useSession } from "next-auth/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  useRedirectIfSignedOut();
  const { status } = useSession();

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
