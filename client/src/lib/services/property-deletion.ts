/**
 * Property deletion service
 * Handles the complete deletion process for properties and their associated transactions
 */

export interface DeletePropertyResult {
  success: boolean;
  message: string;
  transactionCount?: number;
}

/**
 * Deletes a property and all its associated transactions
 * This is a two-step process:
 * 1. Delete all transactions associated with the property
 * 2. Delete the property itself
 */
export async function deletePropertyWithTransactions(
  propertyId: string,
  propertyName: string
): Promise<DeletePropertyResult> {
  try {
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