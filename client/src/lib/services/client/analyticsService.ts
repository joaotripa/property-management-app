import {
  KPIMetrics,
  PropertyKPIMetrics,
  ExpenseBreakdownData,
  PropertyRankingData,
  ChartsResponse,
} from "@/lib/db/analytics/queries";
import { DataGranularity, AnyTimeSeriesData } from "@/lib/types/granularity";
import { ApiChartsResponse } from "@/lib/types/api-dtos";
import {
  transformApiChartsResponse,
  DataTransformationError
} from "@/lib/utils/dataTransform";

class AnalyticsServiceError extends Error {
  constructor(public message: string, public status?: number, public details?: unknown) {
    super(message);
    this.name = 'AnalyticsServiceError';
  }
}

const API_BASE = '/api/analytics';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

async function handleApiResponse<T>(response: Response): Promise<T> {
  let data;

  try {
    data = await response.json();
  } catch (parseError) {
    throw new AnalyticsServiceError(
      `Failed to parse response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
      response.status,
      { parseError, responseText: await response.text().catch(() => 'Unable to read response text') }
    );
  }

  if (!response.ok) {
    const errorMessage = data.error || `API request failed with status ${response.status}`;
    const statusText = response.statusText || 'Unknown error';

    throw new AnalyticsServiceError(
      `${errorMessage} (${statusText})`,
      response.status,
      {
        originalError: data.error,
        statusText,
        details: data.details,
        url: response.url
      }
    );
  }

  return data;
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (value instanceof Date) {
        searchParams.set(key, value.toISOString().split('T')[0]); // YYYY-MM-DD format
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

async function makeResilientApiCall(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT,
  retries: number = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const isNetworkError = error instanceof Error && (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch')
      );

      if (isAbortError) {
        const timeoutError = new AnalyticsServiceError(
          `Request timeout after ${timeout}ms`,
          408,
          { attempt: attempt + 1, maxRetries: retries + 1 }
        );

        if (isLastAttempt) {
          throw timeoutError;
        }

        console.warn(`Request timeout on attempt ${attempt + 1}, retrying...`);
        continue;
      }

      if (isNetworkError && !isLastAttempt) {
        console.warn(`Network error on attempt ${attempt + 1}, retrying...`, error);
        // Exponential backoff: wait 1s, then 2s, then 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      // If not a retryable error or last attempt, throw
      throw new AnalyticsServiceError(
        error instanceof Error ? error.message : 'Unknown network error',
        undefined,
        { attempt: attempt + 1, maxRetries: retries + 1, originalError: error }
      );
    }
  }

  // This should never be reached
  throw new AnalyticsServiceError('Unexpected error in makeResilientApiCall');
}

export interface AnalyticsFilters {
  propertyId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  monthsBack?: number | null; // null for full history
  granularity?: DataGranularity;
  timeRange?: string; // Finance time range identifier
}

export interface KPIResponse {
  portfolio: KPIMetrics;
  properties: PropertyKPIMetrics[];
}

// Note: ChartsResponse is now imported from queries.ts

export interface PropertyComparisonResponse {
  propertyRanking: PropertyRankingData[];
  propertyKPIs: PropertyKPIMetrics[];
  sortBy: string;
  totalProperties: number;
}

/**
 * Get portfolio and property KPI metrics
 */
export async function getAnalyticsKPIs(
  filters: AnalyticsFilters & { includePropertyDetails?: boolean } = {}
): Promise<KPIResponse> {
  try {
    const queryParams = {
      propertyId: filters.propertyId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      includePropertyDetails: filters.includePropertyDetails || false,
    };

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE}/kpis${queryString ? `?${queryString}` : ''}`;
    
    const response = await makeResilientApiCall(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleApiResponse<KPIResponse>(response);
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      throw error;
    }
    throw new AnalyticsServiceError(
      'Failed to fetch analytics KPIs',
      undefined,
      error
    );
  }
}

/**
 * Get chart data for analytics dashboard
 */
export async function getAnalyticsCharts(
  filters: AnalyticsFilters & { chartType?: 'cashflow' | 'expenses' | 'growth' } = {}
): Promise<ChartsResponse> {
  try {
    const queryParams = {
      propertyId: filters.propertyId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      monthsBack: filters.monthsBack,
      timeRange: filters.timeRange,
      chartType: filters.chartType,
      granularity: filters.granularity,
    };

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE}/charts${queryString ? `?${queryString}` : ''}`;

    const response = await makeResilientApiCall(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Get raw API response
    const apiResponse = await handleApiResponse<ApiChartsResponse>(response);

    // Transform API response to internal format
    const transformedResponse = transformApiChartsResponse(apiResponse);

    return transformedResponse;
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      throw error;
    }
    if (error instanceof DataTransformationError) {
      throw new AnalyticsServiceError(
        `Data transformation failed: ${error.message}`,
        undefined,
        { transformationError: error, originalData: error.originalData }
      );
    }
    throw new AnalyticsServiceError(
      'Failed to fetch analytics charts',
      undefined,
      error
    );
  }
}

/**
 * Get property comparison and ranking data
 */
export async function getPropertyComparison(
  filters: {
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: 'cashFlow' | 'roi' | 'totalIncome' | 'totalExpenses';
    includeKPIs?: boolean;
  } = {}
): Promise<PropertyComparisonResponse> {
  try {
    const queryParams = {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      sortBy: filters.sortBy || 'cashFlow',
      includeKPIs: filters.includeKPIs || false,
    };

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE}/property-comparison${queryString ? `?${queryString}` : ''}`;
    
    const response = await makeResilientApiCall(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleApiResponse<PropertyComparisonResponse>(response);
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      throw error;
    }
    throw new AnalyticsServiceError(
      'Failed to fetch property comparison data',
      undefined,
      error
    );
  }
}

/**
 * Get cash flow trend data specifically
 * Returns properly transformed data with Date objects
 */
export async function getCashFlowTrend(
  filters: AnalyticsFilters = {}
): Promise<AnyTimeSeriesData[]> {
  try {
    const chartData = await getAnalyticsCharts({
      ...filters,
      chartType: 'cashflow',
    });

    // Return weekly data if available and requested, otherwise monthly
    if (filters.granularity === 'weekly' && chartData.weeklyCashFlowTrend) {
      return chartData.weeklyCashFlowTrend;
    }

    return chartData.cashFlowTrend || [];
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      throw error;
    }
    if (error instanceof DataTransformationError) {
      throw new AnalyticsServiceError(
        `Failed to transform cash flow data: ${error.message}`,
        undefined,
        { transformationError: error, originalData: error.originalData }
      );
    }
    throw new AnalyticsServiceError(
      'Failed to fetch cash flow trend',
      undefined,
      error
    );
  }
}

/**
 * Get expense breakdown data specifically
 */
export async function getExpenseBreakdown(
  filters: AnalyticsFilters = {}
): Promise<ExpenseBreakdownData[]> {
  try {
    const chartData = await getAnalyticsCharts({
      ...filters,
      chartType: 'expenses',
    });
    
    return chartData.expenseBreakdown || [];
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      throw error;
    }
    throw new AnalyticsServiceError(
      'Failed to fetch expense breakdown',
      undefined,
      error
    );
  }
}


export { AnalyticsServiceError };