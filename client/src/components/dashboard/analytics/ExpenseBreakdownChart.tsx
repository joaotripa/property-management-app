"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Label } from "recharts";
import { ExpenseBreakdownData } from "@/lib/db/analytics/queries";
import { PropertySelector, PropertyOption } from "./PropertySelector";
import { useState, useEffect, useCallback } from "react";
import { getExpenseBreakdown } from "@/lib/services/client/analyticsService";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercentage,
} from "@/lib/utils/formatting";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";

interface ExpenseBreakdownChartProps {
  properties: PropertyOption[];
  initialData?: ExpenseBreakdownData[];
}

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
  "var(--color-chart-9)",
  "var(--color-chart-10)",
  "var(--color-chart-11)",
  "var(--color-chart-12)",
];

export function ExpenseBreakdownChart({
  properties,
  initialData = [],
}: ExpenseBreakdownChartProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<
    string | undefined
  >(undefined);
  const [data, setData] = useState<ExpenseBreakdownData[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
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
    // Only fetch if a property is selected (property-specific data)
    if (selectedPropertyId) {
      fetchData();
    } else if (!selectedPropertyId && initialData.length > 0) {
      // Use initial data for portfolio view
      setData(initialData);
    }
  }, [fetchData, selectedPropertyId, initialData]);

  const handlePropertyChange = (propertyId: string | undefined) => {
    setSelectedPropertyId(propertyId);
  };

  const filteredData = data;

  const chartConfig = filteredData.reduce(
    (config, item, index) => {
      config[item.categoryName] = {
        label: item.categoryName,
        color: COLORS[index % COLORS.length],
      };
      return config;
    },
    {} as Record<string, { label: string; color: string }>
  );

  const chartData = filteredData.map((item) => ({
    ...item,
    fill: chartConfig[item.categoryName]?.color,
  }));

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

  const totalExpenses = filteredData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

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
        <CardDescription className="text-sm text-muted-foreground">
          Breakdown of {formatCurrency(totalExpenses)} total expenses by
          category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
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
                      dataKey="amount"
                      nameKey="categoryName"
                      innerRadius={80}
                      paddingAngle={2}
                      strokeWidth={1}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          style={{
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                          }}
                        />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="text-muted-foreground text-3xl font-bold"
                                >
                                  {formatCompactCurrency(totalExpenses)}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="text-muted-foreground"
                                >
                                  Total Expenses
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          formatter={createChartTooltipFormatter(
                            formatCurrency,
                            chartConfig
                          )}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
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
                  <div
                    key={item.categoryName}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted/50"
                  >
                    <div
                      className="w-4 h-4 rounded-full shadow-sm ring-2 ring-background"
                      style={{ backgroundColor: item.fill }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.categoryName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.transactionCount}{" "}
                        {item.transactionCount === 1
                          ? "transaction"
                          : "transactions"}
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
