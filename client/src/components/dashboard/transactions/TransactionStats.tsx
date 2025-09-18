import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatCompactCurrency } from "@/lib/utils/formatting";
import { useTransactionStats } from "@/hooks/useTransactionStats";
import { TransactionFilters } from "@/types/transactions";

interface TransactionStatsProps {
  filters: TransactionFilters;
}

const TransactionStats = ({ filters }: TransactionStatsProps) => {
  const { stats, loading: statsLoading } = useTransactionStats(filters);

  if (statsLoading || !stats) {
    const loadingKpis: KPICardConfig[] = [
      { title: "Total Income", value: formatCompactCurrency(0) },
      { title: "Total Expenses", value: formatCompactCurrency(0) },
      { title: "Net Income", value: formatCompactCurrency(0) },
    ];

    return <KPICards kpiConfigs={loadingKpis} />;
  }

  const kpiConfigs: KPICardConfig[] = [
    {
      title: "Total Income",
      value: formatCompactCurrency(stats.totalIncome),
    },
    {
      title: "Total Expenses",
      value: formatCompactCurrency(stats.totalExpenses),
    },
    {
      title: "Net Income",
      value: formatCompactCurrency(stats.netIncome),
    },
  ];

  return <KPICards kpiConfigs={kpiConfigs} />;
};

export default TransactionStats;
