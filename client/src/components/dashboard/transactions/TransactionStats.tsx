import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatCompactCurrency } from "@/lib/utils/formatting";

interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  recurringCount: number;
}

interface TransactionStatsProps {
  stats: TransactionStats;
}

const TransactionStats = ({ stats }: TransactionStatsProps) => {
  const kpiConfigs: KPICardConfig[] = [
    {
      title: "Current Month Income",
      value: formatCompactCurrency(stats.totalIncome),
    },
    {
      title: "Current Month Expenses",
      value: formatCompactCurrency(stats.totalExpenses),
    },
    {
      title: "Current Month Cash Flow",
      value: formatCompactCurrency(stats.netIncome),
    },
  ];

  return <KPICards kpiConfigs={kpiConfigs} />;
};

export default TransactionStats;
