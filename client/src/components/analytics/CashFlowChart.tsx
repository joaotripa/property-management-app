"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { CashFlowTrendData } from "@/lib/db/analytics/queries";
import { PropertySelector, PropertyOption } from "./PropertySelector";
import { useState, useEffect, useCallback } from "react";
import { getCashFlowTrend } from "@/lib/services/analyticsService";

interface CashFlowChartProps {
  properties: PropertyOption[];
}

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--color-emerald-500)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--color-coral-500)",
  },
  netIncome: {
    label: "Net Income",
    color: "var(--color-indigo-500)",
  },
} as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonthYear(monthString: string): string {
  const [year, month] = monthString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function CashFlowChart({ properties }: CashFlowChartProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<
    string | undefined
  >(undefined);
  const [data, setData] = useState<CashFlowTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getCashFlowTrend({
        monthsBack: 6,
        propertyId: selectedPropertyId,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePropertyChange = (propertyId: string | undefined) => {
    setSelectedPropertyId(propertyId);
  };

  // Use local data
  const filteredData = data;

  const chartData = filteredData.map((item) => ({
    ...item,
    monthLabel: formatMonthYear(item.month),
  }));

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cash Flow Trend</CardTitle>
            <PropertySelector
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertyChange={handlePropertyChange}
              isLoading={isLoading}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            Error loading cash flow data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cash Flow Trend</CardTitle>
          <PropertySelector
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={handlePropertyChange}
            isLoading={isLoading}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No cash flow data available for the selected period.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-income)" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="var(--color-income)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-expenses)" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="var(--color-expenses)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="netIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-netIncome)" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="var(--color-netIncome)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="2 4" 
                className="stroke-muted/25" 
                horizontal={true}
                vertical={false}
              />
              
              <XAxis
                dataKey="monthLabel"
                className="text-xs fill-muted-foreground"
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, dy: 10 }}
              />
              
              <YAxis 
                className="text-xs fill-muted-foreground" 
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, dx: -10 }}
              />
              
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name,
                    ]}
                    className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg"
                  />
                }
                cursor={{ strokeDasharray: "4 4", strokeWidth: 1, stroke: "var(--color-border)" }}
              />
              
              <ChartLegend content={<ChartLegendContent />} />
              
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                strokeWidth={2.5}
                fill="url(#incomeGradient)"
                dot={{ fill: "var(--color-income)", strokeWidth: 2, r: 4 }}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 2,
                  fill: "var(--color-income)",
                  stroke: "hsl(var(--background))",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                }}
              />
              
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="var(--color-expenses)"
                strokeWidth={2.5}
                fill="url(#expensesGradient)"
                dot={{ fill: "var(--color-expenses)", strokeWidth: 2, r: 4 }}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 2,
                  fill: "var(--color-expenses)",
                  stroke: "hsl(var(--background))",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                }}
              />
              
              <Area
                type="monotone"
                dataKey="netIncome"
                stroke="var(--color-netIncome)"
                strokeWidth={2.5}
                fill="url(#netIncomeGradient)"
                dot={{ fill: "var(--color-netIncome)", strokeWidth: 2, r: 4 }}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 2,
                  fill: "var(--color-netIncome)",
                  stroke: "hsl(var(--background))",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                }}
                strokeDasharray="6 4"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
