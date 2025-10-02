import { auth } from "@/auth";
import { getOverviewPageData } from "@/lib/services/server/overviewService";
import { OverviewKPIs } from "@/components/dashboard/overview/OverviewKPIs";
import { CashFlowTrendChart } from "@/components/dashboard/overview/CashFlowTrendChart";
import { TopPropertiesCard } from "@/components/dashboard/overview/TopPropertiesCard";
import { RecentActivity } from "@/components/dashboard/overview/RecentActivity";
import { TrialBanner } from "@/components/billing/TrialBanner";
import { UserSettingsService } from "@/lib/services/server/userSettingsService";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [
    {
      previousKpis,
      properties,
      monthlyStats,
      cashFlowTrend,
      topProperties,
      previousTopProperties,
      recentActivities,
    },
    userCurrencyCode
  ] = await Promise.all([
    getOverviewPageData(session.user.id),
    UserSettingsService.getUserCurrency(session.user.id)
  ]);
  return (
    <div className="flex flex-col gap-8 px-6 pb-6 max-w-7xl mx-auto">
      {/* Trial Banner */}
      <TrialBanner />

      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold">Welcome back,</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your properties today
        </p>
      </div>

      {/* KPI Cards */}
      <section>
        <OverviewKPIs
          previousKpis={previousKpis}
          properties={properties}
          monthlyStats={monthlyStats}
          currencyCode={userCurrencyCode}
        />
      </section>

      {/* Middle Section: Cash Flow & Top Properties */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowTrendChart initialData={cashFlowTrend} />
        <TopPropertiesCard
          topProperties={topProperties}
          previousTopProperties={previousTopProperties}
          currencyCode={userCurrencyCode}
        />
      </section>

      {/* Bottom Section: Recent Activity */}
      <section>
        <RecentActivity activities={recentActivities} />
      </section>
    </div>
  );
}
