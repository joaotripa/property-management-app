"use client";

import { useState } from "react";
import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Loading state
  if (isLoading) {
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
        </Tabs>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-6">
              <Skeleton className="h-4 w-16 mb-4 bg-muted rounded-full" />
              <Skeleton className="h-6 w-24 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Failed to load transaction stats
        </p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

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
