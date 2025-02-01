"use client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { CustomSidebar } from "@/components/CustomSidebar";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";


export default function DashboardLayout({ children }: {children: React.ReactNode;}) {
  return (
    <SidebarProvider>
      <div className="dashboard">
        <DashboardSidebar/>
        <div className="dashboard__content">
          <Navbar/>
          <main className="dashboard__body">
              {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}