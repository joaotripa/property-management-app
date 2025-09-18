import {
  KPIMetrics,
  PropertyKPIMetrics,
  CashFlowTrendData,
  ExpenseBreakdownData,
  PropertyRankingData,
} from "@/lib/db/analytics/queries";

class AnalyticsServiceError extends Error {
  constructor(public message: string, public status?: number, public details?: unknown) {
    super(message);
    this.name = 'AnalyticsServiceError';
  }
}

const API_BASE = '/api/analytics';

async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new AnalyticsServiceError(
      data.error || `API request failed with status ${response.status}`,
      response.status,
      data.details
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

export interface AnalyticsFilters {
  propertyId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  monthsBack?: number;
}

export interface KPIResponse {
  portfolio: KPIMetrics;
  properties: PropertyKPIMetrics[];
}

export interface ChartsResponse {
  cashFlowTrend?: CashFlowTrendData[];
  expenseBreakdown?: ExpenseBreakdownData[];
}

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
    
    const response = await fetch(url, {
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
      monthsBack: filters.monthsBack || 12,
      chartType: filters.chartType,
    };

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE}/charts${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleApiResponse<ChartsResponse>(response);
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      throw error;
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
    sortBy?: 'netIncome' | 'roi' | 'totalIncome' | 'totalExpenses';
    includeKPIs?: boolean;
  } = {}
): Promise<PropertyComparisonResponse> {
  try {
    const queryParams = {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      sortBy: filters.sortBy || 'netIncome',
      includeKPIs: filters.includeKPIs || false,
    };

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE}/property-comparison${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
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
 */
export async function getCashFlowTrend(
  filters: AnalyticsFilters = {}
): Promise<CashFlowTrendData[]> {
  try {
    const chartData = await getAnalyticsCharts({
      ...filters,
      chartType: 'cashflow',
    });
    
    return chartData.cashFlowTrend || [];
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      throw error;
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