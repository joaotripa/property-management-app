import { prisma } from "@/lib/prisma";
import { propertyIdSchema } from "@/lib/validations/property";
import { Prisma } from "@prisma/client";

/**
 * Validate if a user has access to a specific property
 */
export async function validatePropertyAccess(
  propertyId: string,
  userId: string
): Promise<boolean> {
  try {
    // Validate propertyId format
    const validatedPropertyId = propertyIdSchema.parse(propertyId);
    
    const property = await prisma.property.findFirst({
      where: {
        id: validatedPropertyId,
        userId,
        isActive: true,
      },
    });

    return !!property;
  } catch (error) {
    console.error('Error validating property access:', error);
    return false;
  }
}

/**
 * Check if a property name is unique for a user (case-insensitive)
 */
export async function isPropertyNameUnique(
  name: string,
  userId: string,
  excludePropertyId?: string
): Promise<boolean> {
  try {
    const where: Prisma.PropertyWhereInput = {
      userId,
      isActive: true,
      name: {
        equals: name.trim(),
        mode: 'insensitive',
      },
    };

    // Exclude current property when updating
    if (excludePropertyId) {
      where.NOT = {
        id: excludePropertyId,
      };
    }

    const existingProperty = await prisma.property.findFirst({
      where,
    });

    return !existingProperty;
  } catch (error) {
    console.error('Error checking property name uniqueness:', error);
    return false;
  }
}

/**
 * Validate if a property exists and is active
 */
export async function validatePropertyExists(
  propertyId: string
): Promise<boolean> {
  try {
    // Validate propertyId format
    const validatedPropertyId = propertyIdSchema.parse(propertyId);
    
    const property = await prisma.property.findFirst({
      where: {
        id: validatedPropertyId,
        isActive: true,
      },
    });

    return !!property;
  } catch (error) {
    console.error('Error validating property existence:', error);
    return false;
  }
}

/**
 * Check if a property has any associated transactions
 */
export async function hasPropertyTransactions(
  propertyId: string,
  userId: string
): Promise<boolean> {
  try {
    // Validate propertyId format
    const validatedPropertyId = propertyIdSchema.parse(propertyId);
    
    const transactionCount = await prisma.transaction.count({
      where: {
        propertyId: validatedPropertyId,
        userId,
      },
    });

    return transactionCount > 0;
  } catch (error) {
    console.error('Error checking property transactions:', error);
    return false;
  }
}

/**
 * Get property ownership information
 */
export async function getPropertyOwnership(
  propertyId: string
): Promise<{ userId: string; isActive: boolean } | null> {
  try {
    // Validate propertyId format
    const validatedPropertyId = propertyIdSchema.parse(propertyId);
    
    const property = await prisma.property.findUnique({
      where: {
        id: validatedPropertyId,
      },
      select: {
        userId: true,
        isActive: true,
      },
    });

    return property;
  } catch (error) {
    console.error('Error getting property ownership:', error);
    return null;
  }
}

/**
 * Validate property data constraints
 */
export async function validatePropertyConstraints(
  propertyId: string,
  userId: string
): Promise<{
  canDelete: boolean;
  canUpdate: boolean;
  hasTransactions: boolean;
  reason?: string;
}> {
  try {
    // Check if user has access
    const hasAccess = await validatePropertyAccess(propertyId, userId);
    if (!hasAccess) {
      return {
        canDelete: false,
        canUpdate: false,
        hasTransactions: false,
        reason: 'Property not found or access denied',
      };
    }

    // Check for transactions
    const hasTransactions = await hasPropertyTransactions(propertyId, userId);
    
    return {
      canDelete: true, // Can always soft delete
      canUpdate: true, // Can always update
      hasTransactions,
    };
  } catch (error) {
    console.error('Error validating property constraints:', error);
    return {
      canDelete: false,
      canUpdate: false,
      hasTransactions: false,
      reason: 'Error validating property constraints',
    };
  }
}