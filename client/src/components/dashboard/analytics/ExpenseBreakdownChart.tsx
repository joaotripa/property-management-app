"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ExpenseBreakdownData } from "@/lib/db/analytics/queries";
import { PropertySelector, PropertyOption } from "./PropertySelector";
import { useState, useEffect, useCallback } from "react";
import { getExpenseBreakdown } from "@/lib/services/analyticsService";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface ExpenseBreakdownChartProps {
  properties: PropertyOption[];
}

// Modern color palette for expense categories
const COLORS = [
  "var(--color-sky-500)",      // sky blue
  "var(--color-emerald-500)",  // emerald green
  "var(--color-coral-500)",    // coral orange
  "var(--color-violet-500)",   // violet
  "var(--color-teal-500)",     // teal
  "var(--color-rose-500)",     // rose
  "var(--color-amber-500)",    // amber
  "var(--color-indigo-500)",   // indigo
];


export function ExpenseBreakdownChart({ properties }: ExpenseBreakdownChartProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(undefined);
  const [data, setData] = useState<ExpenseBreakdownData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getExpenseBreakdown({
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

  // Prepare chart data with colors
  const chartData = filteredData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = filteredData.reduce((config, item, index) => {
    config[item.categoryName] = {
      label: item.categoryName,
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {} as Record<string, { label: string; color: string }>);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Breakdown</CardTitle>
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
            Error loading expense data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalExpenses = filteredData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Expense Breakdown</CardTitle>
          <PropertySelector
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={handlePropertyChange}
            isLoading={isLoading}
          />
        </div>
        {!isLoading && totalExpenses > 0 && (
          <div className="text-sm text-muted-foreground">
            Total Expenses: {formatCurrency(totalExpenses)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full rounded-full mx-auto" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No expense data available for the selected period.
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Chart Section */}
            <div className="flex-1 lg:flex-none lg:w-1/2">
              <div className="relative h-[400px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={2}
                      dataKey="amount"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill}
                          style={{
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                          }}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value, name) => [
                          `${formatCurrency(Number(value))} (${formatPercentage(
                            filteredData.find(d => d.categoryName === name)?.percentage || 0
                          )})`, 
                          name
                        ]}
                        className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg"
                      />} 
                    />
                  </PieChart>
                </ChartContainer>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(totalExpenses)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Total Expenses
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {filteredData.length} categories
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend Section */}
            <div className="flex-1 lg:w-1/2 space-y-4">
              <div className="flex items-center justify-between text-sm font-medium text-foreground border-b pb-2">
                <span>Expense Categories</span>
                <span className="text-muted-foreground">Amount</span>
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin">
                {chartData.map((item) => (
                  <div key={item.categoryName} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted/50">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm ring-2 ring-background" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.categoryName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.transactionCount} {item.transactionCount === 1 ? 'transaction' : 'transactions'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {formatCurrency(item.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {formatPercentage(item.percentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}