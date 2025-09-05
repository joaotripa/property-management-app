import { CategoryOption } from "@/types/transactions";

interface CategoriesResponse {
  categories: CategoryOption[];
}

export class CategoriesServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'CategoriesServiceError';
  }
}

export async function getCategories(signal?: AbortSignal): Promise<CategoryOption[]> {
  try {
    const response = await fetch('/api/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new CategoriesServiceError(
        `Failed to fetch categories: ${response.statusText}`,
        response.status
      );
    }

    const data: CategoriesResponse = await response.json();
    
    return data.categories || [];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      // Request was cancelled, don't throw
      return [];
    }
    
    if (error instanceof CategoriesServiceError) {
      throw error;
    }
    
    throw new CategoriesServiceError(
      'Network error while fetching categories'
    );
  }
}