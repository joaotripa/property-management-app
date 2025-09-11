"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

export interface KPICardConfig {
  title: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

interface KPICardsProps {
  kpiConfigs: KPICardConfig[];
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

function KPICard({ title, value, trend, trendValue }: KPICardConfig) {
  return (
    <Card className="border-secondary py-4 justify-between !gap-2">
      <CardHeader className="px-6">
        <CardTitle className="font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row items-end px-6 gap-2">
        <div className="text-3xl font-medium">{value}</div>
        {trendValue && (
          <div className="flex items-center mb-1">
            {trend === "up" && <ArrowUp className="h-3 w-3 text-success" />}
            {trend === "down" && (
              <ArrowDown className="h-4 w-4 text-destructive" />
            )}
            <span
              className={`text-sm ${
                trend === "up"
                  ? "text-success"
                  : trend === "down"
                    ? "text-destructive"
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

export function KPICards({ kpiConfigs }: KPICardsProps) {
  return (
    <div
      className="grid gap-4 mb-6"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
      }}
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
