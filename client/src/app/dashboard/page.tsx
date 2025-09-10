"use client";

import { OverviewKPIs } from "@/components/dashboard/overview/OverviewKPIs";
import { CashFlowSummary } from "@/components/dashboard/overview/CashFlowSummary";
import { TopPropertiesCard } from "@/components/dashboard/overview/TopPropertiesCard";
import { RecentActivity } from "@/components/dashboard/overview/RecentActivity";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome back,</h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s what&apos;s happening with your properties today
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <section>
        <OverviewKPIs />
      </section>

      {/* Middle Section: Cash Flow & Top Properties */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowSummary />
        <TopPropertiesCard />
      </section>

      {/* Bottom Section: Recent Activity */}
      <section>
        <RecentActivity />
      </section>
    </div>
  );
}
