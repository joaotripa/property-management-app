"use client";

import { useState } from "react";
import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
      <Tabs
        value={selectedPeriod}
        onValueChange={(value) =>
          setSelectedPeriod(value as "current-month" | "ytd")
        }
      >
        <div className="flex justify-end">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="current-month">Current Month</TabsTrigger>
            <TabsTrigger value="ytd">Year to Date (YTD)</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={selectedPeriod} className="mt-4">
          <KPICards kpiConfigs={kpiConfigs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionStats;
