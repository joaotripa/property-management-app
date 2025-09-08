"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { PropertyRankingData } from "@/lib/db/analytics/queries";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

interface PropertyRankingChartProps {
  data?: PropertyRankingData[];
  isLoading?: boolean;
  error?: string;
}

type SortBy = 'netIncome' | 'totalIncome' | 'roi';

const sortOptions = [
  { value: 'netIncome', label: 'Net Income' },
  { value: 'totalIncome', label: 'Total Income' },
  { value: 'roi', label: 'ROI %' },
] as const;

const chartConfig = {
  netIncome: {
    label: "Net Income",
    color: "hsl(142, 76%, 36%)", // vibrant green for positive values
  },
  negativeNetIncome: {
    label: "Net Loss",
    color: "hsl(0, 84%, 60%)", // vibrant red for negative values
  },
  totalIncome: {
    label: "Total Income",
    color: "hsl(217, 91%, 60%)", // vibrant blue
  },
  roi: {
    label: "ROI",
    color: "hsl(271, 81%, 56%)", // vibrant purple
  },
} as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function truncatePropertyName(name: string, maxLength: number = 15): string {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
}

export function PropertyRankingChart({ 
  data = [], 
  isLoading, 
  error 
}: PropertyRankingChartProps) {
  const [sortBy, setSortBy] = useState<SortBy>('netIncome');

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Profitability Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            Error loading property ranking: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort data based on selected criteria
  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case 'totalIncome':
        return b.totalIncome - a.totalIncome;
      case 'roi':
        return b.roi - a.roi;
      case 'netIncome':
      default:
        return b.netIncome - a.netIncome;
    }
  });

  // Prepare chart data with truncated names and colors
  const chartData = sortedData.map(item => ({
    ...item,
    shortName: truncatePropertyName(item.propertyName),
    displayValue: sortBy === 'roi' ? item.roi : (sortBy === 'totalIncome' ? item.totalIncome : item.netIncome),
    fill: sortBy === 'netIncome' && item.netIncome < 0 
      ? "var(--color-negativeNetIncome)" 
      : `var(--color-${sortBy === 'roi' ? 'roi' : sortBy === 'totalIncome' ? 'totalIncome' : 'netIncome'})`,
  }));

  const getValueFormatter = (sortBy: SortBy) => {
    return sortBy === 'roi' ? formatPercentage : formatCurrency;
  };

  const currentFormatter = getValueFormatter(sortBy);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Property Profitability Ranking</CardTitle>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            No property data available for ranking.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="stroke-muted/30" 
                horizontal={true}
                vertical={false}
              />
              
              <XAxis 
                dataKey="shortName" 
                className="text-xs fill-muted-foreground"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, dy: 5 }}
              />
              
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickFormatter={currentFormatter}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, dx: -10 }}
              />
              
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    currentFormatter(Number(value)), 
                    sortOptions.find(opt => opt.value === sortBy)?.label || name
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    if (item) {
                      return (
                        <div className="space-y-1">
                          <p className="font-medium">{item.propertyName}</p>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>Net Income: {formatCurrency(item.netIncome)}</p>
                            <p>Total Income: {formatCurrency(item.totalIncome)}</p>
                            <p>ROI: {formatPercentage(item.roi)}</p>
                          </div>
                        </div>
                      );
                    }
                    return label;
                  }}
                  className="rounded-lg border bg-background p-2 shadow-md"
                />} 
                cursor={{ fill: "transparent" }}
              />
              
              <Bar
                dataKey="displayValue"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                style={{
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                }}
              />
            </BarChart>
          </ChartContainer>
        )}
        
        {/* Summary stats */}
        {!isLoading && chartData.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Best Performer</div>
              <div className="font-medium truncate">{chartData[0]?.propertyName}</div>
              <div className="text-xs text-green-600">
                {currentFormatter(chartData[0]?.displayValue)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Properties</div>
              <div className="font-medium">{chartData.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Average {sortOptions.find(opt => opt.value === sortBy)?.label}</div>
              <div className="font-medium">
                {currentFormatter(
                  chartData.reduce((sum, item) => sum + item.displayValue, 0) / chartData.length
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}