import type { Property as PrismaProperty } from "@prisma/client";
import type { Property } from "@/types/properties";

type PrismaPropertyWithImages = PrismaProperty & {
  images?: Array<{ url: string | null }>;
};

/**
 * Transforms Prisma Decimal fields to numbers for frontend use
 * This ensures type safety without assertions
 *
 * Prisma uses Decimal type for financial fields (rent, purchasePrice, marketValue)
 * but the frontend expects plain numbers for calculations and display.
 *
 * Also extracts coverImageUrl from images relation if provided.
 */
export function transformPrismaProperty(prismaProperty: PrismaPropertyWithImages): Property {
  const coverImageUrl = prismaProperty.images?.[0]?.url ?? null;

  return {
    id: prismaProperty.id,
    name: prismaProperty.name,
    address: prismaProperty.address,
    city: prismaProperty.city,
    state: prismaProperty.state,
    zipCode: prismaProperty.zipCode,
    country: prismaProperty.country,
    type: prismaProperty.type,
    rent: Number(prismaProperty.rent),
    occupancy: prismaProperty.occupancy,
    tenants: prismaProperty.tenants,
    purchasePrice: prismaProperty.purchasePrice ? Number(prismaProperty.purchasePrice) : null,
    marketValue: prismaProperty.marketValue ? Number(prismaProperty.marketValue) : null,
    isActive: prismaProperty.isActive,
    createdAt: prismaProperty.createdAt,
    updatedAt: prismaProperty.updatedAt,
    deletedAt: prismaProperty.deletedAt,
    userId: prismaProperty.userId,
    coverImageUrl,
  };
}

/**
 * Transform array of Prisma properties
 */
export function transformPrismaProperties(properties: PrismaPropertyWithImages[]): Property[] {
  return properties.map(transformPrismaProperty);
}
