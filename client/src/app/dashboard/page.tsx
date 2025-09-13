"use client";

import { OverviewKPIs } from "@/components/dashboard/overview/OverviewKPIs";
import { RevenueTrend } from "@/components/dashboard/overview/RevenueTrend";
import { TopPropertiesCard } from "@/components/dashboard/overview/TopPropertiesCard";
import { RecentActivity } from "@/components/dashboard/overview/RecentActivity";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 px-6 pb-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold">Welcome back,</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your properties today
        </p>
      </div>

      {/* KPI Cards */}
      <section>
        <OverviewKPIs />
      </section>

      {/* Middle Section: Cash Flow & Top Properties */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrend />
        <TopPropertiesCard />
      </section>

      {/* Bottom Section: Recent Activity */}
      <section>
        <RecentActivity />
      </section>
    </div>
  );
}
