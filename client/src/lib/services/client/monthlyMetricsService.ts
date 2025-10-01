/**
 * Client-side service for monthly metrics operations
 */

interface ReconcileRequest {
  propertyId?: string;
  fromDate?: string;
  toDate?: string;
  cleanup?: boolean;
  validate?: boolean;
}

interface ReconcileResponse {
  message: string;
  result: {
    validation?: {
      isValid: boolean;
      stored?: Record<string, unknown>;
      calculated?: Record<string, unknown>;
      differences?: Record<string, unknown>;
    };
    recalculation?: {
      type: 'property' | 'user';
      propertyId?: string;
      updated?: number;
      updatedProperties?: number;
      updatedMonths?: number;
    };
    cleanup?: {
      deleted: number;
    };
  };
  timestamp: string;
}

interface ValidationResponse {
  validation: {
    isValid: boolean;
    stored?: Record<string, unknown>;
    calculated?: Record<string, unknown>;
    differences?: Record<string, unknown>;
  };
  timestamp: string;
}

interface StatusResponse {
  status: {
    overview: {
      totalMonthlyMetrics: number;
      propertiesWithMetrics: number;
      metricsWithZeroValues: number;
      totalTransactions: number;
    };
    dateRange: {
      earliestMetrics: string | null;
      latestMetrics: string | null;
      earliestTransaction: string | null;
      latestTransaction: string | null;
      lastUpdated: string | null;
    };
    recentMetrics: Array<{
      propertyId: string;
      propertyName: string;
      period: string;
      totalIncome: number;
      totalExpenses: number;
      cashFlow: number;
      transactionCount: number;
      updatedAt: string;
    }>;
    properties: Array<{
      propertyId: string;
      metricsCount: number;
    }>;
  };
  timestamp: string;
}

/**
 * Reconcile monthly metrics (recalculate and fix inconsistencies)
 */
export async function reconcileMonthlyMetrics(
  request: ReconcileRequest = {}
): Promise<ReconcileResponse> {
  const response = await fetch('/api/admin/monthly-metrics/reconcile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Validate monthly metrics for a specific property and month
 */
export async function validateMonthlyMetrics(
  propertyId: string,
  year: number,
  month: number
): Promise<ValidationResponse> {
  const params = new URLSearchParams({
    propertyId,
    year: year.toString(),
    month: month.toString(),
  });

  const response = await fetch(`/api/admin/monthly-metrics/reconcile?${params}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get monthly metrics status and statistics
 */
export async function getMonthlyMetricsStatus(
  propertyId?: string
): Promise<StatusResponse> {
  const params = new URLSearchParams();
  if (propertyId) {
    params.append('propertyId', propertyId);
  }

  const response = await fetch(`/api/admin/monthly-metrics/status?${params}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Reconcile metrics for all properties (full reconciliation)
 */
export async function reconcileAllMetrics(options: {
  fromDate?: Date;
  toDate?: Date;
  cleanup?: boolean;
} = {}): Promise<ReconcileResponse> {
  return reconcileMonthlyMetrics({
    fromDate: options.fromDate?.toISOString(),
    toDate: options.toDate?.toISOString(),
    cleanup: options.cleanup,
  });
}

/**
 * Reconcile metrics for a specific property
 */
export async function reconcilePropertyMetrics(
  propertyId: string,
  options: {
    fromDate?: Date;
    toDate?: Date;
    cleanup?: boolean;
    validate?: boolean;
  } = {}
): Promise<ReconcileResponse> {
  return reconcileMonthlyMetrics({
    propertyId,
    fromDate: options.fromDate?.toISOString(),
    toDate: options.toDate?.toISOString(),
    cleanup: options.cleanup,
    validate: options.validate,
  });
}

/**
 * Quick health check for monthly metrics
 */
export async function checkMetricsHealth(): Promise<{
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
}> {
  try {
    const status = await getMonthlyMetricsStatus();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for common issues
    if (status.status.overview.totalMonthlyMetrics === 0) {
      issues.push('No monthly metrics found');
      recommendations.push('Run a full reconciliation to populate metrics');
    }

    if (status.status.overview.metricsWithZeroValues > 0) {
      issues.push(`${status.status.overview.metricsWithZeroValues} metrics with zero values`);
      recommendations.push('Consider cleaning up empty metrics');
    }

    const hasTransactions = status.status.overview.totalTransactions > 0;
    const hasMetrics = status.status.overview.totalMonthlyMetrics > 0;

    if (hasTransactions && !hasMetrics) {
      issues.push('Transactions exist but no monthly metrics found');
      recommendations.push('Run reconciliation to generate missing metrics');
    }

    if (status.status.dateRange.earliestTransaction && !status.status.dateRange.earliestMetrics) {
      issues.push('Transactions exist without corresponding metrics');
      recommendations.push('Run full reconciliation to generate all metrics');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations,
    };
  } catch {
    return {
      isHealthy: false,
      issues: ['Failed to check metrics health'],
      recommendations: ['Check system logs and API connectivity'],
    };
  }
}