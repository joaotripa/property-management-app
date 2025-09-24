"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar/DashboardSidebar";
import { Loading } from "@/components/ui/loading";
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
            <Loading />
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
