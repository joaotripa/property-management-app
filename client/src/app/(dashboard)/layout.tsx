"use client";
import Navbar from "@/components/Navbar";


export default function DashboardLayout({ children }: {children: React.ReactNode;}) {
  return (
    <div className="dashboard">
      <div className="dashboard__content">
        <Navbar/>
        <main className="dashboard__body">
            {children}
        </main>
      </div>
    </div>
  )
}