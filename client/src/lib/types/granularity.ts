/**
 * Extensible granularity system for time-series data
 * This modular system allows easy addition of new granularities (daily, yearly)
 */

export type DataGranularity = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface BaseTimeSeriesData {
  income: number;
  expenses: number;
  netIncome: number;
  cumulativeNetIncome: number; 
}

export interface TimeSeriesData<T extends DataGranularity> extends BaseTimeSeriesData {
  granularity: T;
  periodStart: Date;
  period: string;
}

export interface DailyData extends TimeSeriesData<'daily'> {
  day: string; 
  dayOfWeek: number;
  dayOfYear: number;
}

export interface WeeklyData extends TimeSeriesData<'weekly'> {
  week: string; 
  weekStart: Date;
  year: number;
  weekNum: number;
}

export interface MonthlyData extends TimeSeriesData<'monthly'> {
  month: string; 
  year: number;
  monthNum: number;
}

export interface YearlyData extends TimeSeriesData<'yearly'> {
  year: number;
  yearString: string; 
}

export type AnyTimeSeriesData = DailyData | WeeklyData | MonthlyData | YearlyData;

export function isDailyData(data: AnyTimeSeriesData): data is DailyData {
  return data.granularity === 'daily' && 'day' in data;
}

export function isWeeklyData(data: AnyTimeSeriesData): data is WeeklyData {
  return data.granularity === 'weekly' && 'week' in data;
}

export function isMonthlyData(data: AnyTimeSeriesData): data is MonthlyData {
  return data.granularity === 'monthly' && 'month' in data;
}

export function isYearlyData(data: AnyTimeSeriesData): data is YearlyData {
  return data.granularity === 'yearly' && 'year' in data;
}

export interface GranularityConfig {
  granularity: DataGranularity;
  maxPeriods: number; 
  label: string;
  formatKey: string; 
}

export const GRANULARITY_RULES: Record<DataGranularity, GranularityConfig> = {
  daily: {
    granularity: 'daily',
    maxPeriods: 7, 
    label: 'Daily',
    formatKey: 'day'
  },
  weekly: {
    granularity: 'weekly',
    maxPeriods: 12, 
    label: 'Weekly',
    formatKey: 'weekStart'
  },
  monthly: {
    granularity: 'monthly',
    maxPeriods: 24, 
    label: 'Monthly',
    formatKey: 'month'
  },
  yearly: {
    granularity: 'yearly',
    maxPeriods: 10, 
    label: 'Yearly',
    formatKey: 'year'
  }
};

export function selectOptimalGranularity(monthsBack: number | null): DataGranularity {
  if (monthsBack === null) {
    return 'yearly'; 
  }

  if (monthsBack <= 1) { 
    return 'weekly';
  } else if (monthsBack <= 3) { 
    return 'weekly';
  } else if (monthsBack <= 12) { 
    return 'monthly';
  } else if (monthsBack <= 36) { 
    return 'monthly';
  } else {
    return 'yearly';
  }
}

export function selectFinanceGranularity(timeRange: string): DataGranularity {
  switch (timeRange) {
    case 'current': 
      return 'weekly';
    case 'quarter':
      return 'weekly';
    case 'semester':
      return 'monthly';
    case 'year': 
      return 'monthly';
    case 'full': 
      return 'yearly';
    default:
      return 'monthly'; 
  }
}

export function validateGranularityTimeRange(
  granularity: DataGranularity,
  monthsBack: number | null
): { valid: boolean; error?: string } {
  if (monthsBack === null) {
    return { valid: true };
  }

  switch (granularity) {
    case 'daily':
      if (monthsBack > 0.25) {
        return { valid: false, error: 'Daily granularity is only supported for up to 1 week' };
      }
      break;
    case 'weekly':
      if (monthsBack > 6) { 
        return { valid: false, error: 'Weekly granularity is only supported for up to 6 months' };
      }
      break;
    case 'monthly':
      if (monthsBack > 36) { 
        return { valid: false, error: 'Monthly granularity is only supported for up to 3 years' };
      }
      break;
    case 'yearly':
      break;
  }

  return { valid: true };
}

export const GRANULARITY_FORMATTERS: Record<DataGranularity, (data: AnyTimeSeriesData) => string> = {
  daily: (data) => {
    if (isDailyData(data)) {
      return data.periodStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    }
    return '';
  },
  weekly: (data) => {
    if (isWeeklyData(data)) {
      return data.weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    }
    return '';
  },
  monthly: (data) => {
    if (isMonthlyData(data)) {
      return data.periodStart.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit"
      });
    }
    return '';
  },
  yearly: (data) => {
    if (isYearlyData(data)) {
      return data.year.toString();
    }
    return '';
  }
};

export function formatDataLabel(data: AnyTimeSeriesData): string {
  const formatter = GRANULARITY_FORMATTERS[data.granularity];
  return formatter(data);
}