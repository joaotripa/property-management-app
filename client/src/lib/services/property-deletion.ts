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