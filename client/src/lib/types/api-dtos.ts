/**
 * API Data Transfer Objects (DTOs)
 * These interfaces match the exact structure returned by API endpoints
 * where dates are serialized as ISO strings, not Date objects
 */

import { DataGranularity } from './granularity';

export interface ApiBaseTimeSeriesData {
  income: number;
  expenses: number;
  cashFlow: number;
  cumulativeCashFlow: number;
  granularity: DataGranularity;
  periodStart: string; 
  period: string;
}

export interface ApiDailyData extends ApiBaseTimeSeriesData {
  granularity: 'daily';
  day: string; 
  dayOfWeek: number;
  dayOfYear: number;
}

export interface ApiWeeklyData extends ApiBaseTimeSeriesData {
  granularity: 'weekly';
  week: string; 
  weekStart: string; 
  year: number;
  weekNum: number;
}

export interface ApiMonthlyData extends ApiBaseTimeSeriesData {
  granularity: 'monthly';
  month: string; 
  year: number;
  monthNum: number;
}

export interface ApiYearlyData extends ApiBaseTimeSeriesData {
  granularity: 'yearly';
  year: number;
  yearString: string; 
}

export type ApiAnyTimeSeriesData = ApiDailyData | ApiWeeklyData | ApiMonthlyData | ApiYearlyData;

export interface ApiCashFlowTrendData extends ApiMonthlyData {
  month: string;
  year: number;
  monthNum: number;
}

export interface ApiWeeklyCashFlowTrendData extends ApiWeeklyData {
  week: string; 
  weekStart: string; 
  year: number;
  weekNum: number;
}

export interface ApiChartsResponse {
  cashFlowTrend?: ApiCashFlowTrendData[];
  weeklyCashFlowTrend?: ApiWeeklyCashFlowTrendData[];
  expenseBreakdown?: {
    categoryName: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }[];
}

export function isApiWeeklyData(data: unknown): data is ApiWeeklyData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'granularity' in data &&
    (data as { granularity?: string }).granularity === 'weekly' &&
    'week' in data &&
    'weekStart' in data
  );
}

export function isApiMonthlyData(data: unknown): data is ApiMonthlyData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'granularity' in data &&
    (data as { granularity?: string }).granularity === 'monthly' &&
    'month' in data
  );
}

export function isApiDailyData(data: unknown): data is ApiDailyData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'granularity' in data &&
    (data as { granularity?: string }).granularity === 'daily' &&
    'day' in data
  );
}

export function isApiYearlyData(data: unknown): data is ApiYearlyData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'granularity' in data &&
    (data as { granularity?: string }).granularity === 'yearly' &&
    'year' in data
  );
}