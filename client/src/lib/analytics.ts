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