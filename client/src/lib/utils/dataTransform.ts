/**
 * Centralized data transformation utilities
 * Converts API DTOs to internal application types with proper error handling
 */

import {
  ApiAnyTimeSeriesData,
  ApiWeeklyCashFlowTrendData,
  ApiCashFlowTrendData,
  ApiChartsResponse,
  isApiWeeklyData,
  isApiMonthlyData,
  isApiDailyData,
  isApiYearlyData
} from '@/lib/types/api-dtos';

import {
  AnyTimeSeriesData,
  DailyData,
  YearlyData
} from '@/lib/types/granularity';

import {
  WeeklyCashFlowTrendData,
  CashFlowTrendData,
  ChartsResponse
} from '@/lib/db/analytics/queries';

export class DataTransformationError extends Error {
  constructor(message: string, public originalData?: unknown) {
    super(message);
    this.name = 'DataTransformationError';
  }
}

/**
 * Safely parse an ISO date string to Date object
 */
function parseISODate(dateString: string): Date {
  if (typeof dateString !== 'string') {
    throw new DataTransformationError(`Expected string date, got ${typeof dateString}: ${dateString}`);
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new DataTransformationError(`Invalid date string: ${dateString}`);
  }

  return date;
}

/**
 * Transform API base time series data to internal format
 */
function transformBaseTimeSeriesData(apiData: ApiAnyTimeSeriesData): {
  income: number;
  expenses: number;
  netIncome: number;
  cumulativeNetIncome: number;
  granularity: typeof apiData.granularity;
  periodStart: Date;
  period: string;
} {
  if (typeof apiData.income !== 'number' || isNaN(apiData.income)) {
    throw new DataTransformationError(`Invalid income value: ${apiData.income}`, apiData);
  }
  if (typeof apiData.expenses !== 'number' || isNaN(apiData.expenses)) {
    throw new DataTransformationError(`Invalid expenses value: ${apiData.expenses}`, apiData);
  }
  if (typeof apiData.netIncome !== 'number' || isNaN(apiData.netIncome)) {
    throw new DataTransformationError(`Invalid netIncome value: ${apiData.netIncome}`, apiData);
  }
  if (typeof apiData.cumulativeNetIncome !== 'number' || isNaN(apiData.cumulativeNetIncome)) {
    throw new DataTransformationError(`Invalid cumulativeNetIncome value: ${apiData.cumulativeNetIncome}`, apiData);
  }

  return {
    income: apiData.income,
    expenses: apiData.expenses,
    netIncome: apiData.netIncome,
    cumulativeNetIncome: apiData.cumulativeNetIncome,
    granularity: apiData.granularity,
    periodStart: parseISODate(apiData.periodStart),
    period: apiData.period
  };
}

/**
 * Transform API weekly data to internal WeeklyData
 */
export function transformApiWeeklyData(apiData: ApiWeeklyCashFlowTrendData): WeeklyCashFlowTrendData {
  if (!isApiWeeklyData(apiData)) {
    throw new DataTransformationError('Data is not valid API weekly data', apiData);
  }

  const base = transformBaseTimeSeriesData(apiData);

  return {
    ...base,
    granularity: 'weekly',
    week: apiData.week,
    weekStart: parseISODate(apiData.weekStart),
    year: apiData.year,
    weekNum: apiData.weekNum
  } as WeeklyCashFlowTrendData;
}

/**
 * Transform API monthly data to internal MonthlyData
 */
export function transformApiMonthlyData(apiData: ApiCashFlowTrendData): CashFlowTrendData {
  if (!isApiMonthlyData(apiData)) {
    throw new DataTransformationError('Data is not valid API monthly data', apiData);
  }

  const base = transformBaseTimeSeriesData(apiData);

  return {
    ...base,
    granularity: 'monthly',
    month: apiData.month,
    year: apiData.year,
    monthNum: apiData.monthNum
  } as CashFlowTrendData;
}

/**
 * Transform API daily data to internal DailyData
 */
export function transformApiDailyData(apiData: unknown): DailyData {
  if (!isApiDailyData(apiData)) {
    throw new DataTransformationError('Data is not valid API daily data', apiData);
  }

  const base = transformBaseTimeSeriesData(apiData);

  return {
    ...base,
    granularity: 'daily',
    day: apiData.day,
    dayOfWeek: apiData.dayOfWeek,
    dayOfYear: apiData.dayOfYear
  } as DailyData;
}

/**
 * Transform API yearly data to internal YearlyData
 */
export function transformApiYearlyData(apiData: unknown): YearlyData {
  if (!isApiYearlyData(apiData)) {
    throw new DataTransformationError('Data is not valid API yearly data', apiData);
  }

  const base = transformBaseTimeSeriesData(apiData);

  return {
    ...base,
    granularity: 'yearly',
    year: apiData.year,
    yearString: apiData.yearString
  } as YearlyData;
}

/**
 * Transform any API time series data to internal format
 */
export function transformApiTimeSeriesData(apiData: ApiAnyTimeSeriesData): AnyTimeSeriesData {
  try {
    switch (apiData.granularity) {
      case 'weekly':
        return transformApiWeeklyData(apiData as ApiWeeklyCashFlowTrendData);
      case 'monthly':
        return transformApiMonthlyData(apiData as ApiCashFlowTrendData);
      case 'daily':
        return transformApiDailyData(apiData);
      case 'yearly':
        return transformApiYearlyData(apiData);
      default:
        throw new DataTransformationError(`Unsupported granularity: ${(apiData as { granularity?: string }).granularity}`, apiData);
    }
  } catch (error) {
    if (error instanceof DataTransformationError) {
      throw error;
    }
    throw new DataTransformationError(
      `Failed to transform time series data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      apiData
    );
  }
}

/**
 * Transform API charts response to internal format
 */
export function transformApiChartsResponse(apiResponse: ApiChartsResponse): ChartsResponse {
  const result: ChartsResponse = {};

  try {
    if (apiResponse.cashFlowTrend) {
      result.cashFlowTrend = apiResponse.cashFlowTrend.map(transformApiMonthlyData);
    }

    if (apiResponse.weeklyCashFlowTrend) {
      result.weeklyCashFlowTrend = apiResponse.weeklyCashFlowTrend.map(transformApiWeeklyData);
    }

    if (apiResponse.expenseBreakdown) {
      result.expenseBreakdown = apiResponse.expenseBreakdown;
    }

    return result;
  } catch (error) {
    if (error instanceof DataTransformationError) {
      throw error;
    }
    throw new DataTransformationError(
      `Failed to transform charts response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      apiResponse
    );
  }
}

/**
 * Transform array of API time series data with error resilience
 */
export function transformApiTimeSeriesArray(
  apiDataArray: ApiAnyTimeSeriesData[]
): { data: AnyTimeSeriesData[]; errors: DataTransformationError[] } {
  const data: AnyTimeSeriesData[] = [];
  const errors: DataTransformationError[] = [];

  for (const apiData of apiDataArray) {
    try {
      const transformed = transformApiTimeSeriesData(apiData);
      data.push(transformed);
    } catch (error) {
      if (error instanceof DataTransformationError) {
        errors.push(error);
      } else {
        errors.push(new DataTransformationError(
          `Unexpected error transforming data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          apiData
        ));
      }
    }
  }

  return { data, errors };
}