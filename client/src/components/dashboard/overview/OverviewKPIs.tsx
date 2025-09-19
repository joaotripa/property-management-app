import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatPercentage, formatCompactCurrency } from "@/lib/utils/formatting";
import { getTrendData } from "@/lib/utils/analytics";
import { KPIMetrics } from "@/lib/db/analytics/queries";
import { PropertyOption } from "@/types/transactions";

interface OverviewKPIsProps {
  previousKpis: KPIMetrics | null;
  properties: PropertyOption[];
  monthlyStats: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    transactionCount: number;
  } | null;
}

export function OverviewKPIs({
  previousKpis,
  properties,
  monthlyStats,
}: OverviewKPIsProps) {

  const getOverviewKPIConfigs = (): KPICardConfig[] => {
    const occupiedCount = properties.filter(
      (p) => p.occupancy === "OCCUPIED"
    ).length;
    const vacantCount = properties.filter(
      (p) => p.occupancy === "AVAILABLE"
    ).length;
    const totalProperties = properties.length;
    const occupancyRate =
      totalProperties > 0 ? (occupiedCount / totalProperties) * 100 : 0;

    const currentIncome = monthlyStats?.totalIncome || 0;
    const previousIncome = previousKpis?.totalIncome || 0;

    const incomeTrend = getTrendData(currentIncome, previousIncome);

    return [
      {
        title: "Monthly Revenue",
        value: formatCompactCurrency(currentIncome),
        trend: incomeTrend.trend,
        trendValue: incomeTrend.trendValue
          ? `${incomeTrend.trendValue}`
          : undefined,
      },
      {
        title: "Total Properties",
        value: totalProperties.toString(),
      },
      {
        title: "Occupied",
        value: occupiedCount.toString(),
      },
      {
        title: "Vacant",
        value: vacantCount.toString(),
      },
      {
        title: "Occupancy Rate",
        value: formatPercentage(occupancyRate),
      },
    ];
  };

  const overviewKPIConfigs = getOverviewKPIConfigs();

  return <KPICards kpiConfigs={overviewKPIConfigs} />;
}
