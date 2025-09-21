import { auth } from "@/auth";
import { getAnalyticsPageData } from "@/lib/services/server/analyticsService";
import { redirect } from "next/navigation";
import { TimeRangeSelector } from "@/components/dashboard/analytics/TimeRangeSelector";
import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import {
  formatPercentage,
  formatCompactCurrency,
} from "@/lib/utils/formatting";
import { getTrendData } from "@/lib/utils/analytics";
import { CashFlowChart } from "@/components/dashboard/analytics/CashFlowChart";
import { ExpenseBreakdownChart } from "@/components/dashboard/analytics/ExpenseBreakdownChart";
import { TopIncomeChart } from "@/components/dashboard/analytics/TopIncomeChart";
import { NetIncomeChart } from "@/components/dashboard/analytics/NetIncomeChart";
import { ROIChart } from "@/components/dashboard/analytics/ROIChart";

interface AnalyticsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const timeRange =
    typeof params.timeRange === "string" ? params.timeRange : "semester";

  const {
    kpis,
    previousKpis,
    cashFlowTrend,
    expenseBreakdown,
    propertyRanking,
    properties,
  } = await getAnalyticsPageData(session.user.id, timeRange);

  const getAnalyticsKPIConfigs = (): KPICardConfig[] => {
    return [
      {
        title: "Total Invested",
        value: formatCompactCurrency(kpis.totalInvestment || 0),
        ...getTrendData(
          kpis.totalInvestment || 0,
          previousKpis.totalInvestment
        ),
      },
      {
        title: "Income",
        value: formatCompactCurrency(kpis.totalIncome || 0),
        ...getTrendData(kpis.totalIncome || 0, previousKpis.totalIncome),
      },
      {
        title: "Expenses",
        value: formatCompactCurrency(kpis.totalExpenses || 0),
        ...getTrendData(kpis.totalExpenses || 0, previousKpis.totalExpenses),
      },
      {
        title: "Cash Flow",
        value: formatCompactCurrency(kpis.netIncome || 0),
        ...getTrendData(kpis.netIncome || 0, previousKpis.netIncome),
      },
      {
        title: "Expense/Income Ratio",
        value: formatPercentage(kpis.expenseToIncomeRatio || 0),
        ...getTrendData(
          kpis.expenseToIncomeRatio || 0,
          previousKpis.expenseToIncomeRatio
        ),
      },
      {
        title: "Average ROI",
        value: formatPercentage(kpis.averageROI || 0),
        ...getTrendData(kpis.averageROI || 0, previousKpis.averageROI),
      },
    ];
  };

  const kpiConfigs = getAnalyticsKPIConfigs();

  return (
    <div className="flex flex-col px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 gap-4 sm:gap-6 lg:gap-8 min-h-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Analytics Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive insights into your property portfolio performance
          </p>
        </div>
        <div className="flex justify-end">
          <TimeRangeSelector />
        </div>
      </div>

      {/* KPI Cards */}
      <section className="flex-shrink-0">
        <KPICards kpiConfigs={kpiConfigs} />
      </section>

      {/* Charts Section */}
      <section className="flex flex-col gap-4 sm:gap-6 lg:gap-8 min-h-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Performance Charts
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 min-h-0">
          <div className="min-h-0">
            <CashFlowChart
              properties={properties}
              initialData={cashFlowTrend}
              timeRange={timeRange}
            />
          </div>
          <div className="min-h-0">
            <ExpenseBreakdownChart
              properties={properties}
              initialData={expenseBreakdown}
              timeRange={timeRange}
            />
          </div>
        </div>
      </section>

      {/* Property Comparison Section */}
      <section className="flex flex-col gap-4 sm:gap-6 lg:gap-8 min-h-0">
        <div className="flex items-center">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Property Analysis
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 min-h-0">
          <div className="min-h-0">
            <TopIncomeChart data={propertyRanking} timeRange={timeRange} />
          </div>
          <div className="min-h-0">
            <NetIncomeChart data={propertyRanking} timeRange={timeRange} />
          </div>
          <div className="lg:col-span-2 min-h-0">
            <ROIChart data={propertyRanking} timeRange={timeRange} />
          </div>
        </div>
      </section>
    </div>
  );
}
