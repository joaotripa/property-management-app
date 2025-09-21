export interface FinanceTimeRangeOption {
  label: string;
  value: string;
  months: number | null; // null for "full history"
  financialPeriod: 'operational' | 'tactical' | 'strategic' | 'historical';
  description: string;
}

export const FINANCE_TIME_RANGES: FinanceTimeRangeOption[] = [
  {
    label: "Current Month",
    value: "current",
    months: 1,
    financialPeriod: 'operational',
    description: "Day-to-day cash flow monitoring"
  },
  {
    label: "Quarter",
    value: "quarter",
    months: 3,
    financialPeriod: 'tactical',
    description: "Quarterly performance analysis"
  },
  {
    label: "Semester",
    value: "semester",
    months: 6,
    financialPeriod: 'tactical',
    description: "Semi-annual trends and planning"
  },
  {
    label: "Year",
    value: "year",
    months: 12,
    financialPeriod: 'strategic',
    description: "Annual performance and tax planning"
  },
  {
    label: "Full History",
    value: "full",
    months: null,
    financialPeriod: 'historical',
    description: "Complete investment timeline"
  },
];

// Maintain backward compatibility
export const TIME_RANGES = FINANCE_TIME_RANGES;

/**
 * Helper function to calculate date range from finance time range string
 * Can be used both client and server-side
 */
export function calculateDateRange(timeRange: string): {
  dateFrom: Date;
  dateTo: Date;
  monthsBack: number | null;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const range = FINANCE_TIME_RANGES.find(r => r.value === timeRange);

  if (range?.value === 'full') {
    return {
      dateFrom: new Date(1900, 0, 1), 
      dateTo: today,
      monthsBack: null,
    };
  }

  const monthsBack = range?.months || 6;
  const dateFrom = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

  return {
    dateFrom,
    dateTo: today,
    monthsBack,
  };
}

/**
 * Get the financial period type for a given time range
 */
export function getFinancialPeriodType(timeRange: string): string {
  const range = FINANCE_TIME_RANGES.find(r => r.value === timeRange);
  return range?.financialPeriod || 'tactical';
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

  if (monthsBack === null) {
    return {
      dateFrom: new Date(1900, 0, 1),
      dateTo: new Date(1900, 11, 31),
    };
  }

  const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - (monthsBack * 2), 1);
  const previousPeriodEnd = new Date(now.getFullYear(), now.getMonth() - monthsBack, 0);

  return {
    dateFrom: previousPeriodStart,
    dateTo: previousPeriodEnd,
  };
}