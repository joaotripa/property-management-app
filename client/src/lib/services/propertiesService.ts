import { PropertyOption } from "@/types/transactions";

interface PropertiesResponse {
  success: boolean;
  properties: PropertyOption[];
  message?: string;
  count?: number;
}

export class PropertiesServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'PropertiesServiceError';
  }
}

export async function getProperties(signal?: AbortSignal): Promise<PropertyOption[]> {
  try {
    const response = await fetch('/api/properties', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new PropertiesServiceError(
        `Failed to fetch properties: ${response.statusText}`,
        response.status
      );
    }

    const data: PropertiesResponse = await response.json();

    if (!data.success) {
      throw new PropertiesServiceError(
        data.message || 'Failed to fetch properties'
      );
    }

    return data.properties || [];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      // Request was cancelled, don't throw
      return [];
    }
    
    if (error instanceof PropertiesServiceError) {
      throw error;
    }
    
    throw new PropertiesServiceError(
      'Network error while fetching properties'
    );
  }
}