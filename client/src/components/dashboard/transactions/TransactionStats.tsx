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

const TransactionStats = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"current-month" | "ytd">(
    "current-month"
  );

  const {
    data: stats,
    isLoading,
    error,
  } = useTransactionStatsQuery(selectedPeriod);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Failed to load transaction stats
        </p>
      </div>
    );
  }

  const kpiConfigs: KPICardConfig[] = isLoading || !stats ? [
    {
      title: "Income",
      value: formatCompactCurrency(0),
    },
    {
      title: "Expenses",
      value: formatCompactCurrency(0),
    },
    {
      title: "Cash Flow",
      value: formatCompactCurrency(0),
    },
  ] : [
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
