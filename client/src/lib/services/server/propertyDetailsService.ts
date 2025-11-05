import { getPropertyById } from "@/lib/db/properties/queries";
import { getPropertyImages } from "@/lib/db/propertyImages/queries";
import { getMonthlyMetrics, type MonthlyMetricsData } from "@/lib/db/monthlyMetrics/queries";
import { getTransactions } from "@/lib/db/transactions/queries";
import type { Property } from "@/types/properties";
import type { PropertyImage } from "@prisma/client";
import type { Transaction } from "@/types/transactions";

export interface PropertyDetailsData {
  property: Property;
  images: PropertyImage[];
  currentMonthMetrics: MonthlyMetricsData | null;
  recentTransactions: Transaction[];
}

/**
 * Server-side service to fetch all property details data in parallel
 *
 * This function aggregates all data needed for the property details page:
 * - Property metadata
 * - Property images
 * - Current month financial metrics
 * - Recent transactions (last 25)
 *
 * All queries run in parallel for optimal performance.
 *
 * @param propertyId - The ID of the property to fetch
 * @param userId - The ID of the user (for authorization)
 * @returns Complete property details data ready for SSR hydration
 */
export async function getPropertyDetailsData(
  propertyId: string,
  userId: string
): Promise<PropertyDetailsData> {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const [property, images, monthlyMetricsArray, transactionsData] = await Promise.all([
      getPropertyById(propertyId, userId),
      getPropertyImages(propertyId),
      getMonthlyMetrics(
        userId,
        propertyId,
        new Date(currentYear, currentMonth - 1, 1),
        new Date(currentYear, currentMonth, 0)
      ),
      getTransactions(userId, {
        propertyId,
        limit: 25,
        offset: 0,
        sortBy: "transactionDate",
        sortOrder: "desc",
      }),
    ]);

    if (!property) {
      throw new Error("Property not found");
    }

    const currentMonthMetrics = monthlyMetricsArray.find(
      m => m.year === currentYear && m.month === currentMonth
    ) ?? null;

    return {
      property,
      images,
      currentMonthMetrics,
      recentTransactions: transactionsData.transactions,
    };
  } catch (error) {
    console.error("Error fetching property details data:", error);
    throw new Error("Failed to fetch property details data");
  }
}
