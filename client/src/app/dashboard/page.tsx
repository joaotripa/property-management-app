"use client";

import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { CashFlowSummary } from "@/components/dashboard/CashFlowSummary";
import { TopPropertiesCard } from "@/components/dashboard/TopPropertiesCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      {/* Welcome Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome back,</h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s what&apos;s happening with your properties today
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>+12.5% this month</span>
            </div>
            <div className="text-blue-600 text-sm font-medium">
              8 Properties Active
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <section>
        <DashboardKPIs />
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
