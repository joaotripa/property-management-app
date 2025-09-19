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

  // Await search params and get time range
  const params = await searchParams;
  const timeRange =
    typeof params.timeRange === "string" ? params.timeRange : "6m";

  // Fetch all data server-side with time range
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
    <div className="flex flex-col px-6 pb-6 gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your property portfolio performance
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <section>
        <KPICards kpiConfigs={kpiConfigs} />
      </section>

      {/* Charts Section */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Performance Charts
            </h2>
          </div>
          <TimeRangeSelector />
        </div>

        <div className="flex flex-col gap-8">
          <CashFlowChart
            properties={properties}
            initialData={cashFlowTrend}
            timeRange={timeRange}
          />
          <ExpenseBreakdownChart
            properties={properties}
            initialData={expenseBreakdown}
            timeRange={timeRange}
          />
        </div>
      </section>

      {/* Property Comparison Section */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Property Analysis
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <TopIncomeChart data={propertyRanking} timeRange={timeRange} />
          <NetIncomeChart data={propertyRanking} timeRange={timeRange} />
          <ROIChart data={propertyRanking} timeRange={timeRange} />
        </div>
      </section>
    </div>
  );
}
