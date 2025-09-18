/**
 * Base service error class for consistent error handling across all services
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * Specific service error classes
 */
export class TransactionsServiceError extends ServiceError {
  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'TransactionsServiceError';
  }
}

export class PropertiesServiceError extends ServiceError {
  constructor(message: string, statusCode?: number) {
    super(message, statusCode);
    this.name = 'PropertiesServiceError';
  }
}

export class CategoriesServiceError extends ServiceError {
  constructor(message: string, statusCode?: number) {
    super(message, statusCode);
    this.name = 'CategoriesServiceError';
  }
}

export class AnalyticsServiceError extends ServiceError {
  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'AnalyticsServiceError';
  }
}

export class ActivityServiceError extends ServiceError {
  constructor(message: string, statusCode?: number) {
    super(message, statusCode);
    this.name = 'ActivityServiceError';
  }
}

/**
 * Generic API response handler with consistent error handling
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ServiceError(
      data.error || `API request failed with status ${response.status}`,
      response.status,
      data.details
    );
  }

  return data;
}

/**
 * Generic fetch wrapper with standard error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  signal?: AbortSignal
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal,
      ...options,
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ServiceError('Request cancelled', 0);
    }

    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError(
      error instanceof Error ? error.message : 'Network error occurred'
    );
  }
}