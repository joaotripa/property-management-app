import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatCompactCurrency } from "@/lib/utils/formatting";

interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  transactionCount: number;
  recurringCount: number;
}

interface TransactionStatsProps {
  stats: TransactionStats;
}

const TransactionStats = ({ stats }: TransactionStatsProps) => {
  const kpiConfigs: KPICardConfig[] = [
    {
      title: "Income",
      value: formatCompactCurrency(stats.totalIncome),
    },
    {
      title: "Expenses",
      value: formatCompactCurrency(stats.totalExpenses),
    },
    {
      title: "Cash Flow",
      value: (
        <span
          className={stats.cashFlow >= 0 ? "text-success" : "text-destructive"}
        >
          {stats.cashFlow >= 0 ? "+" : ""}
          {formatCompactCurrency(stats.cashFlow)}
        </span>
      ),
    },
  ];

  return <KPICards kpiConfigs={kpiConfigs} />;
};

export default TransactionStats;
