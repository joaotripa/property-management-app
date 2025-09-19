import { getUserProperties, getPropertyStats } from "@/lib/db/properties/queries";
import { Property } from "@/types/properties";

interface PropertyStats {
  totalProperties: number;
  occupiedProperties: number;
  availableProperties: number;
  occupancyRate: number;
  totalRent: number;
  averageRent: number;
}

interface PropertiesData {
  properties: Property[];
  stats: PropertyStats;
}

/**
 * Server-side service to fetch all properties data
 * Fetches both properties and stats in parallel for optimal performance
 */
export async function getPropertiesData(userId: string): Promise<PropertiesData> {
  try {
    // Fetch properties and stats in parallel for better performance
    const [properties, stats] = await Promise.all([
      getUserProperties(userId),
      getPropertyStats(userId)
    ]);

    return {
      properties,
      stats
    };
  } catch (error) {
    console.error('Error fetching properties data:', error);
    throw new Error('Failed to fetch properties data');
  }
}