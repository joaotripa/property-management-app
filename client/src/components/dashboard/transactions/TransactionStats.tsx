"use client";

import { useState } from "react";
import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { formatCompactCurrency } from "@/lib/utils/formatting";
import { useTransactionStatsQuery } from "@/hooks/queries/useTransactionStatsQuery";
import { TransactionStatsData } from "@/types/transactions";

interface TransactionStatsProps {
  initialStats: TransactionStatsData;
}

const TransactionStats = ({ initialStats }: TransactionStatsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"current-month" | "ytd">(
    "current-month"
  );

  const { data: stats, error } = useTransactionStatsQuery(
    selectedPeriod,
    selectedPeriod === "current-month" ? initialStats : undefined
  );

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Failed to load transaction stats
        </p>
      </div>
    );
  }

  const totalIncome = stats?.totalIncome ?? 0;
  const totalExpenses = stats?.totalExpenses ?? 0;
  const cashFlow = stats?.cashFlow ?? 0;

  const kpiConfigs: KPICardConfig[] = [
    {
      title: "Income",
      value: formatCompactCurrency(totalIncome),
    },
    {
      title: "Expenses",
      value: formatCompactCurrency(totalExpenses),
    },
    {
      title: "Cash Flow",
      value: (
        <span className={cashFlow >= 0 ? "text-success" : "text-destructive"}>
          {cashFlow >= 0 ? "+" : ""}
          {formatCompactCurrency(cashFlow)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ButtonGroup>
          <Button
            variant={selectedPeriod === "current-month" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("current-month")}
          >
            Current Month
          </Button>
          <Button
            variant={selectedPeriod === "ytd" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("ytd")}
          >
            Year to Date (YTD)
          </Button>
        </ButtonGroup>
      </div>
      <KPICards kpiConfigs={kpiConfigs} />
    </div>
  );
};

export default TransactionStats;
