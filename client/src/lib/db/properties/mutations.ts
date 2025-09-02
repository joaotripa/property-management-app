import { prisma } from "@/lib/prisma";
import { 
  CreatePropertyInput, 
  UpdatePropertyInput,
  basePropertySchema,
  updatePropertySchema 
} from "@/lib/validations/property";
import { Property } from "@/types/properties";
import { generateUUID } from "@/lib/utils";
import { OccupancyStatus } from "@prisma/client";

/**
 * Create a new property for a user
 */
export async function createProperty(
  userId: string,
  input: CreatePropertyInput
): Promise<Property> {
  try {
    const validatedInput = basePropertySchema.parse(input);
    
    const property = await prisma.property.create({
      data: {
        id: generateUUID(),
        userId,
        name: validatedInput.name,
        address: validatedInput.address,
        type: validatedInput.type,
        rent: validatedInput.rent,
        occupancy: validatedInput.occupancy,
        tenants: validatedInput.tenants,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        type: true,
        rent: true,
        occupancy: true,
        tenants: true,
      },
    });

    return {
      ...property,
      rent: Number(property.rent),
    };
  } catch (error) {
    console.error('Error creating property:', error);
    throw new Error('Failed to create property');
  }
}

/**
 * Update an existing property for a user
 */
export async function updateProperty(
  userId: string,
  input: UpdatePropertyInput
): Promise<Property> {
  try {
    // Validate input
    const validatedInput = updatePropertySchema.parse(input);
    
    // Check if property exists and belongs to user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: validatedInput.id,
        userId,
        deletedAt: null,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or access denied');
    }

    const property = await prisma.property.update({
      where: {
        id: validatedInput.id,
      },
      data: {
        name: validatedInput.name,
        address: validatedInput.address,
        type: validatedInput.type,
        rent: validatedInput.rent,
        occupancy: validatedInput.occupancy,
        tenants: validatedInput.tenants,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        address: true,
        type: true,
        rent: true,
        occupancy: true,
        tenants: true,
      },
    });

    // Transform Decimal rent to number for frontend
    return {
      ...property,
      rent: Number(property.rent),
    };
  } catch (error) {
    console.error('Error updating property:', error);
    throw new Error('Failed to update property');
  }
}

/**
 * Soft delete a property using deletedAt timestamp
 */
export async function deleteProperty(
  propertyId: string,
  userId: string
): Promise<void> {
  try {
    // Check if property exists and belongs to user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId,
        deletedAt: null,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or access denied');
    }

    // Always use soft delete to preserve data integrity
    await prisma.property.update({
      where: {
        id: propertyId,
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    throw new Error('Failed to delete property');
  }
}

/**
 * Restore a soft-deleted property
 */
export async function restoreProperty(
  propertyId: string,
  userId: string
): Promise<Property> {
  try {
    // Check if property exists and belongs to user (including soft-deleted)
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId,
        deletedAt: {
          not: null,
        },
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or access denied');
    }

    const property = await prisma.property.update({
      where: {
        id: propertyId,
      },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        address: true,
        type: true,
        rent: true,
        occupancy: true,
        tenants: true,
      },
    });

    // Transform Decimal rent to number for frontend
    return {
      ...property,
      rent: Number(property.rent),
    };
  } catch (error) {
    console.error('Error restoring property:', error);
    throw new Error('Failed to restore property');
  }
}

/**
 * Update property occupancy status
 */
export async function updatePropertyOccupancy(
  propertyId: string,
  userId: string,
  occupancy: OccupancyStatus,
  tenantCount?: number
): Promise<Property> {
  try {
    // Check if property exists and belongs to user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId,
        deletedAt: null,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or access denied');
    }

    // Determine tenant count based on occupancy
    let finalTenantCount = tenantCount;
    if (occupancy === "AVAILABLE" && finalTenantCount === undefined) {
      finalTenantCount = 0;
    } else if (occupancy === "OCCUPIED" && finalTenantCount === undefined) {
      finalTenantCount = existingProperty.tenants;
    }

    const property = await prisma.property.update({
      where: {
        id: propertyId,
      },
      data: {
        occupancy,
        tenants: finalTenantCount !== undefined ? finalTenantCount : existingProperty.tenants,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        address: true,
        type: true,
        rent: true,
        occupancy: true,
        tenants: true,
      },
    });

    // Transform Decimal rent to number for frontend
    return {
      ...property,
      rent: Number(property.rent),
    };
  } catch (error) {
    console.error('Error updating property occupancy:', error);
    throw new Error('Failed to update property occupancy');
  }
}