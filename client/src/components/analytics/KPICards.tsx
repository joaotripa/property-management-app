"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface KPICardConfig {
  title: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

interface KPICardsProps {
  kpiConfigs: KPICardConfig[];
  isLoading?: boolean;
  error?: string;
  columns?: 2 | 3 | 4 | 5;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatPercentage(
  percentage: number,
  decimals: number = 1
): string {
  return `${percentage.toFixed(decimals)}%`;
}

export function calculateTrend(
  current: number,
  previous: number
): {
  trend: "up" | "down" | "neutral";
  percentage: number;
} {
  if (previous === 0) {
    return { trend: "neutral", percentage: 0 };
  }

  const percentageChange = ((current - previous) / Math.abs(previous)) * 100;

  if (Math.abs(percentageChange) < 0.1) {
    return { trend: "neutral", percentage: 0 };
  }

  return {
    trend: percentageChange > 0 ? "up" : "down",
    percentage: Math.abs(percentageChange),
  };
}

export function getTrendData(
  current: number,
  previous?: number
): { trend?: "up" | "down" | "neutral"; trendValue?: string } {
  if (!previous) {
    return { trend: undefined, trendValue: undefined };
  }

  const trendData = calculateTrend(current, previous);
  return {
    trend: trendData.trend,
    trendValue:
      trendData.percentage > 0
        ? `${trendData.percentage.toFixed(1)}%`
        : undefined,
  };
}

function KPICard({
  title,
  value,
  trend,
  trendValue,
}: KPICardConfig & { isLoading?: boolean }) {
  return (
    <Card className="border-secondary hover:bg-muted/60 py-3 gap-2">
      <CardHeader className="pb-1 px-6 pt-0">
        <CardTitle className="text-md font-semibold text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row items-end pt-0 px-6 pb-0">
        <div className="text-4xl font-medium">{value}</div>
        {trendValue && (
          <div className="flex text-sm gap-1">
            {trend === "up" && (
              <TrendingUp className="h-3 w-3 text-emerald-600" />
            )}
            {trend === "down" && (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span
              className={`text-xs ${
                trend === "up"
                  ? "text-emerald-600"
                  : trend === "down"
                    ? "text-red-600"
                    : "text-muted-foreground"
              }`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function KPICards({ kpiConfigs, error, columns = 5 }: KPICardsProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
  };

  if (error) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${gridCols[columns]} gap-4 mb-6`}
      >
        <Card className="col-span-full">
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              Error loading KPIs.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 ${gridCols[columns]} gap-4 mb-6`}
    >
      {kpiConfigs.map((kpi) => (
        <KPICard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          trend={kpi.trend}
          trendValue={kpi.trendValue}
        />
      ))}
    </div>
  );
}
