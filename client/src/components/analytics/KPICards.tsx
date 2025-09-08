"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Building,
  Target,
  Calculator,
  Wallet,
} from "lucide-react";
import { KPIMetrics } from "@/lib/db/analytics/queries";

interface KPICardsProps {
  data?: KPIMetrics;
  previousData?: KPIMetrics; // For trend calculations
  isLoading?: boolean;
  error?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatPercentage(percentage: number, decimals: number = 1): string {
  return `${percentage.toFixed(decimals)}%`;
}

// Calculate trend between current and previous values
function calculateTrend(current: number, previous: number): {
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

function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  isLoading = false,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "blue" | "green" | "red" | "purple" | "orange" | "teal";
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    );
  }

  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    teal: "text-teal-600",
  };

  const trendColorClasses = {
    up: "text-green-600 bg-green-100",
    down: "text-red-600 bg-red-100",
    neutral: "text-gray-600 bg-gray-100",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && trendValue && (
          <div className="flex items-center space-x-1 mt-1">
            <Badge
              variant="secondary"
              className={`text-xs px-1.5 py-0.5 ${trend ? trendColorClasses[trend] : ""}`}
            >
              {trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
              {trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
              {trendValue}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {trend === "up"
                ? "increase"
                : trend === "down"
                  ? "decrease"
                  : "change"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function KPICards({ data, previousData, isLoading, error }: KPICardsProps) {
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="col-span-full">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading KPIs: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to get trend data for a metric
  const getTrendData = (current: number, previous?: number) => {
    if (!previous || !previousData) {
      return { trend: undefined, trendValue: undefined };
    }
    
    const trendData = calculateTrend(current, previous);
    return {
      trend: trendData.trend,
      trendValue: trendData.percentage > 0 ? `${trendData.percentage.toFixed(1)}%` : undefined,
    };
  };

  const kpiData: Array<{
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: "blue" | "green" | "red" | "purple" | "orange" | "teal";
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
  }> = [
    {
      title: "Total Properties",
      value: isLoading ? "..." : data?.totalProperties.toString() || "0",
      icon: Building,
      color: "blue" as const,
      ...getTrendData(data?.totalProperties || 0, previousData?.totalProperties),
    },
    {
      title: "Net Income",
      value: isLoading ? "..." : formatCurrency(data?.netIncome || 0),
      icon: DollarSign,
      color: "green" as const,
      ...getTrendData(data?.netIncome || 0, previousData?.netIncome),
    },
    {
      title: "Cash-on-Cash Return",
      value: isLoading ? "..." : formatPercentage(data?.cashOnCashReturn || 0),
      icon: Target,
      color: "purple" as const,
      ...getTrendData(data?.cashOnCashReturn || 0, previousData?.cashOnCashReturn),
    },
    {
      title: "Average Cap Rate",
      value: isLoading ? "..." : formatPercentage(data?.averageCapRate || 0),
      icon: Calculator,
      color: "teal" as const,
      ...getTrendData(data?.averageCapRate || 0, previousData?.averageCapRate),
    },
    {
      title: "Expense-to-Income Ratio",
      value: isLoading
        ? "..."
        : formatPercentage(data?.expenseToIncomeRatio || 0),
      icon: PieChart,
      color: "orange" as const,
      ...getTrendData(data?.expenseToIncomeRatio || 0, previousData?.expenseToIncomeRatio),
    },
    {
      title: "Average ROI",
      value: isLoading ? "..." : formatPercentage(data?.averageROI || 0),
      icon: TrendingUp,
      color: "green" as const,
      ...getTrendData(data?.averageROI || 0, previousData?.averageROI),
    },
    {
      title: "Portfolio Value",
      value: isLoading ? "..." : formatCurrency(data?.totalPortfolioValue || 0),
      icon: Wallet,
      color: "blue" as const,
      ...getTrendData(data?.totalPortfolioValue || 0, previousData?.totalPortfolioValue),
    },
    {
      title: "Total Investment",
      value: isLoading ? "..." : formatCurrency(data?.totalInvestment || 0),
      icon: DollarSign,
      color: "purple" as const,
      ...getTrendData(data?.totalInvestment || 0, previousData?.totalInvestment),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiData.map((kpi) => (
        <KPICard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          color={kpi.color}
          trend={kpi.trend}
          trendValue={kpi.trendValue}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
