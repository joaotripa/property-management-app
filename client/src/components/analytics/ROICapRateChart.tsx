"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
      return "hsl(142, 76%, 36%)"; // excellent - bright green
    case 3:
      return "hsl(90, 70%, 45%)"; // good - lime green
    case 2:
      return "hsl(45, 93%, 47%)"; // fair - orange
    case 1:
      return "hsl(25, 85%, 55%)"; // poor - orange-red
    default:
      return "hsl(0, 84%, 60%)"; // very poor - red
  }
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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

  // Calculate quadrant averages for reference lines
  const avgROI =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.roi, 0) / data.length
      : 0;
  const avgCapRate =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.capRate, 0) / data.length
      : 0;

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
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <ScatterChart
                data={chartData}
                margin={{ top: 30, right: 30, bottom: 50, left: 50 }}
              >
                <defs>
                  {/* Performance zone gradients */}
                  <radialGradient id="excellentZone" cx="50%" cy="50%" r="50%">
                    <stop
                      offset="0%"
                      stopColor="hsl(142, 76%, 36%)"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(142, 76%, 36%)"
                      stopOpacity={0.05}
                    />
                  </radialGradient>
                  <radialGradient id="goodZone" cx="50%" cy="50%" r="50%">
                    <stop
                      offset="0%"
                      stopColor="hsl(45, 93%, 47%)"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(45, 93%, 47%)"
                      stopOpacity={0.03}
                    />
                  </radialGradient>
                </defs>

                {/* Performance zone background rectangles */}
                <rect
                  x="70%"
                  y="0%"
                  width="30%"
                  height="30%"
                  fill="url(#excellentZone)"
                  opacity={0.3}
                />

                <CartesianGrid
                  strokeDasharray="2 4"
                  className="stroke-muted/20"
                  horizontal={true}
                  vertical={true}
                />

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
                      fill: "hsl(var(--muted-foreground))",
                    },
                  }}
                  domain={["dataMin - 1", "dataMax + 1"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, dy: 5 }}
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
                    style: {
                      textAnchor: "middle",
                      fontSize: "12px",
                      fill: "hsl(var(--muted-foreground))",
                    },
                  }}
                  domain={["dataMin - 2", "dataMax + 2"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, dx: -5 }}
                />

                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[2, 20]}
                  name="Performance Score"
                />

                {/* Reference lines for averages */}
                {data.length > 0 && (
                  <>
                    <line
                      x1="0%"
                      y1="50%"
                      x2="100%"
                      y2="50%"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="4 4"
                      strokeOpacity={0.4}
                      strokeWidth={1}
                    />
                    <line
                      x1="50%"
                      y1="0%"
                      x2="50%"
                      y2="100%"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="4 4"
                      strokeOpacity={0.4}
                      strokeWidth={1}
                    />
                  </>
                )}

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const item = props.payload;
                        if (name === "roi") {
                          return [formatPercentage(item.roi), "ROI"];
                        } else if (name === "capRate") {
                          return [formatPercentage(item.capRate), "Cap Rate"];
                        }
                        return [formatPercentage(Number(value)), name];
                      }}
                      labelFormatter={(_, payload) => {
                        const item = payload?.[0]?.payload;
                        if (item) {
                          return (
                            <div className="space-y-1">
                              <p className="font-medium">{item.propertyName}</p>
                              <div className="text-xs text-muted-foreground space-y-0.5">
                                <p>
                                  Market Value:{" "}
                                  {formatCurrency(item.marketValue)}
                                </p>
                                <p>
                                  Net Income: {formatCurrency(item.netIncome)}
                                </p>
                                <p>
                                  Monthly Rent:{" "}
                                  {formatCurrency(item.monthlyRent)}
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return "";
                      }}
                      className="rounded-lg border bg-background p-2 shadow-md"
                    />
                  }
                  cursor={false}
                />

                <Scatter
                  name="Properties"
                  data={chartData}
                  fill="currentColor"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={Math.sqrt(payload.z) * 2 + 6} // Continuous performance-based bubble sizes
                        fill={payload.fill}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-1">
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

            {/* Summary statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Avg ROI</div>
                <Badge variant="secondary">{formatPercentage(avgROI)}</Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Avg Cap Rate
                </div>
                <Badge variant="secondary">
                  {formatPercentage(avgCapRate)}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Best ROI</div>
                <Badge variant="outline" className="text-green-600">
                  {data.length > 0
                    ? formatPercentage(Math.max(...data.map((d) => d.roi)))
                    : "N/A"}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Best Cap Rate
                </div>
                <Badge variant="outline" className="text-blue-600">
                  {data.length > 0
                    ? formatPercentage(Math.max(...data.map((d) => d.capRate)))
                    : "N/A"}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
