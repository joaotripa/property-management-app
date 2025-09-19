export interface TimeRangeOption {
  label: string;
  value: string;
  months: number;
}

export const TIME_RANGES: TimeRangeOption[] = [
  { label: "1 Month", value: "1m", months: 1 },
  { label: "2 Months", value: "2m", months: 2 },
  { label: "6 Months", value: "6m", months: 6 },
  { label: "1 Year", value: "1y", months: 12 },
];

/**
 * Helper function to calculate date range from time range string
 * Can be used both client and server-side
 */
export function calculateDateRange(timeRange: string): {
  dateFrom: Date;
  dateTo: Date;
  monthsBack: number;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const range = TIME_RANGES.find(r => r.value === timeRange);
  const monthsBack = range?.months || 6;

  const dateFrom = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

  return {
    dateFrom,
    dateTo: today,
    monthsBack,
  };
}

/**
 * Helper function to get the previous period for trend calculations
 * Can be used both client and server-side
 */
export function calculatePreviousPeriod(timeRange: string): {
  dateFrom: Date;
  dateTo: Date;
} {
  const { monthsBack } = calculateDateRange(timeRange);
  const now = new Date();

  // Previous period starts monthsBack * 2 months ago and ends monthsBack months ago
  const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - (monthsBack * 2), 1);
  const previousPeriodEnd = new Date(now.getFullYear(), now.getMonth() - monthsBack, 0);

  return {
    dateFrom: previousPeriodStart,
    dateTo: previousPeriodEnd,
  };
}