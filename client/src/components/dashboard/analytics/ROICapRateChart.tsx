"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
} from "recharts";
import { PropertyKPIMetrics } from "@/lib/db/analytics/queries";
import { formatPercentage } from "@/lib/utils/formatting";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";

interface ROICapRateChartProps {
  data?: PropertyKPIMetrics[];
  isLoading?: boolean;
  error?: string;
}

// Color scale based on performance (green = good, red = poor)
function getPerformanceColor(roi: number, capRate: number): string {
  const roiScore = roi > 10 ? 2 : roi > 5 ? 1 : 0;
  const capRateScore = capRate > 6 ? 2 : capRate > 4 ? 1 : 0;
  const totalScore = roiScore + capRateScore;

  switch (totalScore) {
    case 4:
      return "var(--color-emerald-500)"; // excellent
    case 3:
      return "var(--color-teal-500)"; // good
    case 2:
      return "var(--color-amber-500)"; // fair
    case 1:
      return "var(--color-coral-500)"; // poor
    default:
      return "var(--color-rose-500)"; // very poor
  }
}


const chartConfig = {
  roi: {
    label: "ROI %",
  },
  capRate: {
    label: "Cap Rate %",
  },
} as const;

export function ROICapRateChart({
  data = [],
  isLoading,
  error,
}: ROICapRateChartProps) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ROI vs Cap Rate Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            Error loading ROI/Cap Rate data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data with colors and Z-axis values for bubble sizing
  const chartData = data.map((item) => {
    // Calculate continuous performance score using actual ROI and Cap Rate values
    const normalizedRoi = Math.max(0, item.roi); // Ensure positive
    const normalizedCapRate = Math.max(0, item.capRate); // Ensure positive
    const performanceScore =
      (normalizedRoi * 0.6 + normalizedCapRate * 0.4) * 4; // Weighted score with base

    return {
      ...item,
      // Z-axis value for bubble size - continuous performance score
      z: performanceScore,
      fill: getPerformanceColor(item.roi, item.capRate),
    };
  });


  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI vs Cap Rate Analysis</CardTitle>
        <div className="text-sm text-muted-foreground">
          Properties positioned in the top-right quadrant indicate the best
          performance
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
            No property data available for ROI/Cap Rate analysis.
          </div>
        ) : (
          <div className="flex flex-row items-center">
            <ChartContainer config={chartConfig} className="w-full">
              <ScatterChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />

                <XAxis
                  type="number"
                  dataKey="capRate"
                  name="Cap Rate"
                  unit="%"
                  className="text-xs fill-muted-foreground"
                  label={{
                    value: "Cap Rate (%)",
                    position: "insideBottom",
                    offset: -5,
                    style: {
                      textAnchor: "middle",
                      fontSize: "12px",
                      fill: "oklch(var(--muted-foreground))",
                    },
                  }}
                  domain={["dataMin - 1", "dataMax + 1"]}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="number"
                  dataKey="roi"
                  name="ROI"
                  unit="%"
                  className="text-xs fill-muted-foreground"
                  label={{
                    value: "ROI (%)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -5,
                    style: {
                      textAnchor: "middle",
                      fontSize: "12px",
                      fill: "oklch(var(--muted-foreground))",
                    },
                  }}
                  domain={["dataMin - 1", "dataMax + 1"]}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />

                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[2, 20]}
                  name="Performance Score"
                />

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent 
                      indicator="line"
                      formatter={createChartTooltipFormatter(formatPercentage, chartConfig)}
                    />
                  }
                />

                <Scatter
                  name="Properties"
                  data={chartData}
                  fill="currentColor"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  shape={(props: unknown) => {
                    const { cx, cy, payload } = props as { cx: number; cy: number; payload: { z: number; fill: string } };
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={Math.sqrt(payload.z) * 2 + 6} // Continuous performance-based bubble sizes
                        fill={payload.fill}
                        stroke="oklch(var(--background))"
                        style={{
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        }}
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ChartContainer>

            {/* Performance legend */}

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(142, 76%, 36%)" }}
                />
                <span>Excellent</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(90, 70%, 45%)" }}
                />
                <span>Good</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(45, 93%, 47%)" }}
                />
                <span>Fair</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(25, 85%, 55%)" }}
                />
                <span>Poor</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(0, 84%, 60%)" }}
                />
                <span>Very Poor</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
