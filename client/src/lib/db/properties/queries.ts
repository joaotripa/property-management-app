import { prisma } from "@/lib/prisma";
import { PropertyFilters, propertyFiltersSchema } from "@/lib/validations/property";
import { Property } from "@/types/properties";
import { Prisma } from "@prisma/client";

/**
 * Get all properties for a user with optional filtering
 */
export async function getUserProperties(
  userId: string,
  filters: PropertyFilters = {}
): Promise<Property[]> {
  try {
    // Validate filters
    const validatedFilters = propertyFiltersSchema.parse(filters);
    
    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      userId,
      deletedAt: null,
    };

    // Apply filters
    if (validatedFilters.type) {
      where.type = validatedFilters.type;
    }

    if (validatedFilters.occupancy) {
      where.occupancy = validatedFilters.occupancy;
    }

    if (validatedFilters.minRent || validatedFilters.maxRent) {
      where.rent = {};
      if (validatedFilters.minRent) {
        where.rent.gte = validatedFilters.minRent;
      }
      if (validatedFilters.maxRent) {
        where.rent.lte = validatedFilters.maxRent;
      }
    }

    if (validatedFilters.search) {
      where.OR = [
        {
          name: {
            contains: validatedFilters.search,
            mode: 'insensitive',
          },
        },
        {
          address: {
            contains: validatedFilters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        country: true,
        purchasePrice: true,
        type: true,
        rent: true,
        occupancy: true,
        tenants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform Decimal rent to number and handle null values for frontend
    return properties.map((property) => ({
      ...property,
      rent: Number(property.rent),
      city: property.city,
      country: property.country,
      purchasePrice: property.purchasePrice ? Number(property.purchasePrice) : null,
    })) as Property[];
  } catch (error) {
    console.error('Error fetching user properties:', error);
    throw new Error('Failed to fetch properties');
  }
}

/**
 * Get a single property by ID for a user
 */
export async function getPropertyById(
  propertyId: string,
  userId: string
): Promise<Property | null> {
  try {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        country: true,
        purchasePrice: true,
        type: true,
        rent: true,
        occupancy: true,
        tenants: true,
      },
    });

    if (!property) {
      return null;
    }

    // Transform Decimal rent to number and handle null values for frontend
    return {
      ...property,
      rent: Number(property.rent),
      city: property.city,
      country: property.country,
      purchasePrice: property.purchasePrice != null ? Number(property.purchasePrice) : null,
    } as Property;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw new Error('Failed to fetch property');
  }
}

/**
 * Get basic property options for dropdowns/filters
 */
export async function getPropertyOptions(userId: string) {
  try {
    const properties = await prisma.property.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        address: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return properties;
  } catch (error) {
    console.error('Error fetching property options:', error);
    throw new Error('Failed to fetch property options');
  }
}

/**
 * Get property statistics for a user
 */
export async function getPropertyStats(userId: string) {
  try {
    const [totalProperties, occupiedProperties, totalRent, averageRent] = await Promise.all([
      prisma.property.count({
        where: {
          userId,
          deletedAt: null,
        },
      }),
      prisma.property.count({
        where: {
          userId,
          deletedAt: null,
          occupancy: "OCCUPIED",
        },
      }),
      prisma.property.aggregate({
        where: {
          userId,
          deletedAt: null,
          occupancy: "OCCUPIED",
        },
        _sum: {
          rent: true,
        },
      }),
      prisma.property.aggregate({
        where: {
          userId,
          deletedAt: null,
        },
        _avg: {
          rent: true,
        },
      }),
    ]);

    const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

    return {
      totalProperties,
      occupiedProperties,
      availableProperties: totalProperties - occupiedProperties,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      totalRent: Number(totalRent._sum.rent || 0),
      averageRent: Number(averageRent._avg.rent || 0),
    };
  } catch (error) {
    console.error('Error fetching property statistics:', error);
    throw new Error('Failed to fetch property statistics');
  }
}