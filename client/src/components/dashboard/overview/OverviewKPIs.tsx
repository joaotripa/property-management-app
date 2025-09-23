import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatCompactCurrency } from "@/lib/utils/formatting";
import { getTrendData } from "@/lib/utils/analytics";
import { KPIMetrics } from "@/lib/db/analytics/queries";
import { PropertyOption } from "@/types/transactions";

interface OverviewKPIsProps {
  previousKpis: KPIMetrics | null;
  properties: PropertyOption[];
  monthlyStats: {
    totalIncome: number;
    totalExpenses: number;
    cashFlow: number;
    transactionCount: number;
  } | null;
}

export function OverviewKPIs({
  previousKpis,
  properties,
  monthlyStats,
}: OverviewKPIsProps) {
  const occupiedCount = properties.filter(
    (p) => p.occupancy === "OCCUPIED"
  ).length;
  const totalProperties = properties.length;

  const currentIncome = monthlyStats?.totalIncome || 0;
  const previousIncome = previousKpis?.totalIncome || 0;

  const incomeTrend = getTrendData(currentIncome, previousIncome);

  const currentExpenses = monthlyStats?.totalExpenses || 0;
  const previousExpenses = previousKpis?.totalExpenses || 0;
  const expensesTrend = getTrendData(currentExpenses, previousExpenses);

  const overviewKPIConfigs: KPICardConfig[] = [
    {
      title: "Monthly Revenue",
      value: formatCompactCurrency(currentIncome),
      trend: incomeTrend.trend,
      trendValue: incomeTrend.trendValue
        ? `${incomeTrend.trendValue}`
        : undefined,
    },
    {
      title: "Monthly Expenses",
      value: formatCompactCurrency(currentExpenses),
      trend: expensesTrend.trend,
      trendValue: expensesTrend.trendValue
        ? `${expensesTrend.trendValue}`
        : undefined,
      invertTrendColors: true,
    },
    {
      title: "Total Properties",
      value: totalProperties.toString(),
    },
    {
      title: "Occupied Properties",
      value: (
        <>
          <span className="text-3xl font-semibold">{occupiedCount}</span>
          <span className="ml-1 text-xl font-medium text-muted-foreground">
            /{totalProperties}
          </span>
        </>
      ),
    },
  ];

  return <KPICards kpiConfigs={overviewKPIConfigs} />;
}
