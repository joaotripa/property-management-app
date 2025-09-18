import { PropertyOption } from "@/types/transactions";
import { Property } from "@/types/properties";
import { UpdatePropertyInput, ErrorResponse } from "@/lib/validations/property";

interface PropertiesResponse {
  success: boolean;
  properties: PropertyOption[];
  message?: string;
  count?: number;
}

interface PropertyResponse {
  success: boolean;
  property?: Property;
  message?: string;
}

interface UpdatePropertyResponse {
  success: boolean;
  property?: Property;
  message?: string;
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

export async function getPropertyById(id: string, signal?: AbortSignal): Promise<Property | null> {
  try {
    const response = await fetch(`/api/properties/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new PropertiesServiceError(
        `Failed to fetch property: ${response.statusText}`,
        response.status
      );
    }

    const data: PropertyResponse = await response.json();

    if (!data.success) {
      throw new PropertiesServiceError(
        data.message || 'Failed to fetch property'
      );
    }

    return data.property || null;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return null;
    }

    if (error instanceof PropertiesServiceError) {
      throw error;
    }

    throw new PropertiesServiceError(
      'Network error while fetching property'
    );
  }
}

export async function updateProperty(id: string, data: UpdatePropertyInput, signal?: AbortSignal): Promise<Property> {
  try {
    const response = await fetch(`/api/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Failed to update property: ${response.statusText}`;

      try {
        const errorData: ErrorResponse = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }

        if (errorData.errors) {
          const fieldErrors = Object.entries(errorData.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
          errorMessage += ` (${fieldErrors})`;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new PropertiesServiceError(errorMessage, response.status);
    }

    const responseData: UpdatePropertyResponse = await response.json();

    if (!responseData.success) {
      throw new PropertiesServiceError(
        responseData.message || 'Failed to update property'
      );
    }

    if (!responseData.property) {
      throw new PropertiesServiceError('Property data missing from response');
    }

    return responseData.property;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new PropertiesServiceError('Request cancelled', 0);
    }

    if (error instanceof PropertiesServiceError) {
      throw error;
    }

    throw new PropertiesServiceError(
      'Network error while updating property'
    );
  }
}

export async function deleteProperty(id: string, signal?: AbortSignal): Promise<void> {
  try {
    const response = await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Failed to delete property: ${response.statusText}`;

      try {
        const errorData: ErrorResponse = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new PropertiesServiceError(errorMessage, response.status);
    }

    const data = await response.json();

    if (!data.success) {
      throw new PropertiesServiceError(
        data.message || 'Failed to delete property'
      );
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new PropertiesServiceError('Request cancelled', 0);
    }

    if (error instanceof PropertiesServiceError) {
      throw error;
    }

    throw new PropertiesServiceError(
      'Network error while deleting property'
    );
  }
}

export interface DeletePropertyResult {
  success: boolean;
  message: string;
  transactionCount?: number;
}

/**
 * Deletes a property and all its associated data
 * This is a three-step process:
 * 1. Delete all transactions associated with the property
 * 2. Delete all images associated with the property
 * 3. Delete the property itself
 */
export async function deletePropertyWithTransactions(
  propertyId: string,
  propertyName: string
): Promise<DeletePropertyResult> {
  try {
    // Step 1: Delete all transactions associated with the property
    const transactionsResponse = await fetch(
      `/api/transactions/property/${propertyId}`,
      {
        method: "DELETE",
      }
    );

    if (!transactionsResponse.ok) {
      const errorData = await transactionsResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete property transactions");
    }

    const transactionsData = await transactionsResponse.json();
    const transactionCount = transactionsData.count || 0;

    // Step 2: Delete all images associated with the property
    try {
      const imagesResponse = await fetch(`/api/properties/${propertyId}/images`, {
        method: "DELETE",
      });

      if (!imagesResponse.ok) {
        const errorData = await imagesResponse.json().catch(() => ({}));
        console.warn("Failed to delete property images:", errorData.message);
        // Don't fail the entire operation if image deletion fails
      }
    } catch (imageError) {
      console.warn("Error deleting property images:", imageError);
      // Continue with property deletion even if image deletion fails
    }

    // Step 3: Delete the property itself
    const propertyResponse = await fetch(`/api/properties/${propertyId}`, {
      method: "DELETE",
    });

    if (!propertyResponse.ok) {
      const errorData = await propertyResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete property");
    }

    return {
      success: true,
      message: `Property "${propertyName}" and ${transactionCount} associated transactions deleted successfully`,
      transactionCount,
    };
  } catch (error) {
    console.error("Error in deletePropertyWithTransactions:", error);

    return {
      success: false,
      message: error instanceof Error
        ? error.message
        : "Failed to delete property. Please try again.",
    };
  }
}