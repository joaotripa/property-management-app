"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar/DashboardSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRedirectIfSignedOut } from "@/hooks/useRedirectIfSignedOut";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { OnboardingPreferencesDialog } from "@/components/onboarding/OnboardingPreferencesDialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  useRedirectIfSignedOut();
  const { needsOnboarding } = useOnboardingStatus();

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

      {/* Onboarding Dialog - Shows only if user needs onboarding */}
      <OnboardingPreferencesDialog
        isOpen={needsOnboarding}
        onComplete={() => {}}
      />
    </SidebarProvider>
  );
};

export default DashboardLayout;
