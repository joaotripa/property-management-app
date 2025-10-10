
import React from "react";
import { formatPercentage } from "@/lib/utils/formatting";

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

  if (Math.abs(percentageChange) < 1) {
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
        ? formatPercentage(trendData.percentage)
        : undefined,
  };
}

interface TooltipProps {
  payload?: {
    fill?: string;
  };
  color?: string;
}

interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

export function createChartTooltipFormatter(
  valueFormatter: (value: number) => string = (value) => value.toLocaleString(),
  chartConfig?: ChartConfig
) {
  const TooltipFormatter = (value: unknown, name: unknown, props: TooltipProps) => {
    const displayName = chartConfig?.[String(name)]?.label || String(name);
    
    return React.createElement("div", { className: "flex items-center gap-2 w-full" },
      React.createElement("div", {
        className: "h-2.5 w-2.5 shrink-0 rounded-[2px]",
        style: {
          backgroundColor: props.payload?.fill || props.color,
        }
      }),
      React.createElement("div", { className: "flex justify-between items-center flex-1" },
        React.createElement("span", { className: "text-muted-foreground" }, displayName),
        React.createElement("span", { className: "text-foreground font-mono font-medium tabular-nums ml-4" },
          valueFormatter(Number(value))
        )
      )
    );
  };
  
  TooltipFormatter.displayName = "ChartTooltipFormatter";
  return TooltipFormatter;
}