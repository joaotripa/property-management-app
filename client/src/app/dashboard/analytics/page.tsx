import { auth } from "@/auth";
import { getAnalyticsPageData } from "@/lib/services/server/analyticsService";
import { UserSettingsService } from "@/lib/services/server/userSettingsService";
import { redirect } from "next/navigation";
import { TimeRangeSelector } from "@/components/dashboard/analytics/TimeRangeSelector";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { DASHBOARD_EVENTS } from "@/lib/analytics/events";
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
import { IncomeExpensesChart } from "@/components/dashboard/analytics/IncomeExpensesChart";
import { ExpenseBreakdownChart } from "@/components/dashboard/analytics/ExpenseBreakdownChart";
import { PropertyPerformanceChart } from "@/components/dashboard/analytics/PropertyPerformanceChart";
import { PropertySelector } from "@/components/dashboard/analytics/PropertySelector";

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
  const propertyId =
    typeof params.propertyId === "string" ? params.propertyId : undefined;

  const [
    {
      kpis,
      previousKpis,
      cashFlowTrend,
      expenseBreakdown,
      propertyRanking,
      properties,
    },
    userCurrencyCode
  ] = await Promise.all([
    getAnalyticsPageData(session.user.id, timeRange, propertyId),
    UserSettingsService.getUserCurrency(session.user.id)
  ]);

  const getAnalyticsKPIConfigs = (): KPICardConfig[] => {
    return [
      {
        title: "Capital Invested",
        value: formatCompactCurrency(kpis.totalInvestment || 0, userCurrencyCode),
        ...getTrendData(
          kpis.totalInvestment || 0,
          previousKpis.totalInvestment
        ),
      },
      {
        title: "Income",
        value: formatCompactCurrency(kpis.totalIncome || 0, userCurrencyCode),
        ...getTrendData(kpis.totalIncome || 0, previousKpis.totalIncome),
      },
      {
        title: "Expenses",
        value: formatCompactCurrency(kpis.totalExpenses || 0, userCurrencyCode),
        ...getTrendData(kpis.totalExpenses || 0, previousKpis.totalExpenses),
      },
      {
        title: "Cash Flow",
        value: formatCompactCurrency(kpis.cashFlow || 0, userCurrencyCode),
        ...getTrendData(kpis.cashFlow || 0, previousKpis.cashFlow),
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
        title: "ROI %",
        value: formatPercentage(kpis.protfolioROI || 0),
        ...getTrendData(kpis.protfolioROI || 0, previousKpis.protfolioROI),
      },
    ];
  };

  const kpiConfigs = getAnalyticsKPIConfigs();

  return (
    <PageViewTracker
      event={DASHBOARD_EVENTS.ANALYTICS_VIEWED}
      properties={{
        time_range: timeRange,
        property_filter: propertyId || null,
      }}
    >
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
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <PropertySelector properties={properties} />
          <TimeRangeSelector />
        </div>
      </div>

      {/* KPI Cards */}
      <section className="flex-shrink-0">
        <KPICards kpiConfigs={kpiConfigs} />
      </section>

      {/* Charts Section */}
      <section className="flex flex-col gap-4 sm:gap-6 lg:gap-8 min-h-0">
        <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 min-h-0">
            <div className="min-h-0">
              <IncomeExpensesChart initialData={cashFlowTrend} currencyCode={userCurrencyCode} />
            </div>
            <div className="min-h-0">
              <CashFlowChart initialData={cashFlowTrend} currencyCode={userCurrencyCode} />
            </div>
          </div>
          <div className="min-h-0">
            <ExpenseBreakdownChart initialData={expenseBreakdown} currencyCode={userCurrencyCode} />
          </div>
        </div>
      </section>

      {/* Property Comparison Section */}
      <section className="flex flex-col gap-4 sm:gap-6 lg:gap-8 min-h-0">
        <div className="min-h-0">
          <PropertyPerformanceChart
            data={propertyRanking}
            timeRange={timeRange}
            currencyCode={userCurrencyCode}
          />
        </div>
      </section>
    </div>
    </PageViewTracker>
  );
}
