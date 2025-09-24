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
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercentage,
} from "@/lib/utils/formatting";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";

interface ExpenseBreakdownChartProps {
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
  initialData = [],
}: ExpenseBreakdownChartProps) {
  const chartConfig = initialData.reduce(
    (config, item, index) => {
      config[item.categoryName] = {
        label: item.categoryName,
        color: COLORS[index % COLORS.length],
      };
      return config;
    },
    {} as Record<string, { label: string; color: string }>
  );

  const chartData = initialData.map((item) => ({
    ...item,
    fill: chartConfig[item.categoryName]?.color,
  }));

  const totalExpenses = initialData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <Card className="min-h-0">
      <CardHeader className="pb-3 sm:pb-4 md:pb-5">
        <CardTitle className="text-lg sm:text-xl md:text-2xl">
          Expense Breakdown
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Breakdown of {formatCurrency(totalExpenses)} total expenses by
          category.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-0">
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No expense data available for the selected period.
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 min-h-0">
            <div className="flex-1 xl:flex-none xl:w-1/2 min-h-0">
              <div className="relative h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px] xl:h-[400px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="amount"
                      nameKey="categoryName"
                      innerRadius="40%"
                      outerRadius="75%"
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
                                  className="text-muted-foreground text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold"
                                >
                                  {formatCompactCurrency(totalExpenses)}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="text-muted-foreground text-sm hidden sm:flex"
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

            <div className="flex-1 xl:w-1/2 space-y-3 lg:space-y-4 min-h-0">
              <div className="flex items-center justify-between text-sm font-medium text-foreground border-b pb-2">
                <span>Expense Categories</span>
                <span className="text-muted-foreground">Amount</span>
              </div>
              <div className="space-y-2 max-h-[200px] sm:max-h-[250px] lg:max-h-[300px] xl:max-h-[350px] overflow-y-auto scrollbar-thin">
                {chartData.map((item) => (
                  <div
                    key={item.categoryName}
                    className="flex items-center gap-3 lg:gap-4 p-2 lg:p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted/50"
                  >
                    <div
                      className="w-3 h-3 lg:w-4 lg:h-4 rounded-full shadow-sm ring-2 ring-background flex-shrink-0"
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
                    <div className="text-right flex-shrink-0">
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
