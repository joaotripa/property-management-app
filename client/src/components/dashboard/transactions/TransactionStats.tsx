import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatCurrency } from "@/lib/utils";
import { useTransactionStats } from "@/hooks/useTransactionStats";
import { TransactionFilters } from "@/types/transactions";
import { Card, CardContent } from "@/components/ui/card";

interface TransactionStatsProps {
  filters: TransactionFilters;
}

const TransactionStats = ({ filters }: TransactionStatsProps) => {
  const { stats, loading: statsLoading } = useTransactionStats(filters);

  if (statsLoading || !stats) {
    const loadingKpis: KPICardConfig[] = [
      { title: "Total Income", value: formatCurrency(0) },
      { title: "Total Expenses", value: formatCurrency(0) },
      { title: "Net Income", value: formatCurrency(0) },
    ];

    return <KPICards kpiConfigs={loadingKpis} />;
  }

  const kpiConfigs: KPICardConfig[] = [
    {
      title: "Total Income",
      value: formatCurrency(stats.totalIncome),
    },
    {
      title: "Total Expenses",
      value: formatCurrency(stats.totalExpenses),
    },
    {
      title: "Net Income",
      value: formatCurrency(stats.netIncome),
    },
  ];

  return <KPICards kpiConfigs={kpiConfigs} />;
};

export default TransactionStats;
