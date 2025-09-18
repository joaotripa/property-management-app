import {
  TransactionQueryInput,
  TransactionFormOutput,
  TransactionListResponse,
  TransactionResponse,
  TransactionStatsResponse,
  transactionQuerySchema,
} from "@/lib/validations/transaction";
import { Transaction } from "@/types/transactions";

class TransactionsServiceError extends Error {
  constructor(public message: string, public status?: number, public details?: unknown) {
    super(message);
    this.name = 'TransactionsServiceError';
  }
}

const API_BASE = '/api/transactions';

async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new TransactionsServiceError(
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
      if (Array.isArray(value)) {
        searchParams.set(key, value.join(','));
      } else if (value instanceof Date) {
        searchParams.set(key, value.toISOString());
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

export async function getTransactions(
  filters: Partial<TransactionQueryInput> = {}
): Promise<TransactionListResponse> {
  try {
    const validatedFilters = transactionQuerySchema.parse(filters);
    const queryString = buildQueryString(validatedFilters);
    const url = `${API_BASE}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleApiResponse<TransactionListResponse>(response);
  } catch (error) {
    if (error instanceof TransactionsServiceError) {
      throw error;
    }
    throw new TransactionsServiceError(
      'Failed to fetch transactions',
      undefined,
      error
    );
  }
}

export async function createTransaction(
  data: TransactionFormOutput
): Promise<TransactionResponse> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: data.amount,
        type: data.type,
        description: data.description,
        transactionDate: data.transactionDate.toISOString(),
        isRecurring: data.isRecurring,
        propertyId: data.propertyId,
        categoryId: data.categoryId,
      }),
    });
    
    return await handleApiResponse<TransactionResponse>(response);
  } catch (error) {
    if (error instanceof TransactionsServiceError) {
      throw error;
    }
    throw new TransactionsServiceError(
      'Failed to create transaction',
      undefined,
      error
    );
  }
}

export async function updateTransaction(
  id: string,
  data: TransactionFormOutput
): Promise<TransactionResponse> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: data.amount,
        type: data.type,
        description: data.description,
        transactionDate: data.transactionDate.toISOString(),
        isRecurring: data.isRecurring,
        propertyId: data.propertyId,
        categoryId: data.categoryId,
      }),
    });
    
    return await handleApiResponse<TransactionResponse>(response);
  } catch (error) {
    if (error instanceof TransactionsServiceError) {
      throw error;
    }
    throw new TransactionsServiceError(
      'Failed to update transaction',
      undefined,
      error
    );
  }
}

export async function deleteTransaction(id: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleApiResponse<{ message: string }>(response);
  } catch (error) {
    if (error instanceof TransactionsServiceError) {
      throw error;
    }
    throw new TransactionsServiceError(
      'Failed to delete transaction',
      undefined,
      error
    );
  }
}

export async function getTransactionStats(
  filters: Partial<TransactionQueryInput> = {}
): Promise<TransactionStatsResponse> {
  try {
    const validatedFilters = transactionQuerySchema.parse(filters);
    const queryString = buildQueryString(validatedFilters);
    const url = `/api/transactions/stats${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleApiResponse<TransactionStatsResponse>(response);
  } catch (error) {
    if (error instanceof TransactionsServiceError) {
      throw error;
    }
    throw new TransactionsServiceError(
      'Failed to fetch transaction statistics',
      undefined,
      error
    );
  }
}

export async function getTransaction(id: string): Promise<Transaction> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await handleApiResponse<{ transaction: Transaction }>(response);
    return data.transaction;
  } catch (error) {
    if (error instanceof TransactionsServiceError) {
      throw error;
    }
    throw new TransactionsServiceError(
      'Failed to fetch transaction',
      undefined,
      error
    );
  }
}

export { TransactionsServiceError };