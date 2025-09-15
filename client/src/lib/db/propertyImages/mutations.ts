import { prisma } from "@/lib/prisma";
import { PropertyImage } from "@prisma/client";
import { generateUUID } from "@/lib/utils";
import {
  CreatePropertyImageInput,
  BulkCreatePropertyImagesInput,
  createPropertyImageSchema,
  bulkCreatePropertyImagesSchema,
} from "./validation";

/**
 * Create a new property image
 */
export async function createPropertyImage(
  input: CreatePropertyImageInput
): Promise<PropertyImage> {
  try {
    const validatedInput = createPropertyImageSchema.parse(input);

    // If this is set as cover image, remove cover status from other images
    if (validatedInput.isCover) {
      await prisma.propertyImage.updateMany({
        where: {
          propertyId: validatedInput.propertyId,
          isCover: true,
          deletedAt: null,
        },
        data: {
          isCover: false,
        },
      });
    }

    const propertyImage = await prisma.propertyImage.create({
      data: {
        id: generateUUID(),
        propertyId: validatedInput.propertyId,
        filename: validatedInput.filename,
        url: validatedInput.url,
        isCover: validatedInput.isCover,
        sortOrder: validatedInput.sortOrder,
      },
    });

    return propertyImage;
  } catch (error) {
    console.error("Error creating property image:", error);
    throw new Error("Failed to create property image");
  }
}


/**
 * Soft delete a property image
 */
export async function deletePropertyImage(imageId: string): Promise<void> {
  try {
    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error("Image not found");
    }

    await prisma.propertyImage.update({
      where: { id: imageId },
      data: {
        deletedAt: new Date(),
      },
    });

    // If this was the cover image, set another image as cover
    if (image.isCover) {
      const nextImage = await prisma.propertyImage.findFirst({
        where: {
          propertyId: image.propertyId,
          deletedAt: null,
          id: { not: imageId },
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      });

      if (nextImage) {
        await prisma.propertyImage.update({
          where: { id: nextImage.id },
          data: { isCover: true },
        });
      }
    }
  } catch (error) {
    console.error("Error deleting property image:", error);
    throw new Error("Failed to delete property image");
  }
}

/**
 * Create multiple property images at once
 */
export async function bulkCreatePropertyImages(
  input: BulkCreatePropertyImagesInput
): Promise<PropertyImage[]> {
  try {
    const validatedInput = bulkCreatePropertyImagesSchema.parse(input);

    // Check if any of the images should be cover
    const hasCoverImage = validatedInput.images.some(img => img.isCover);

    // If we're adding a cover image, remove cover status from existing images
    if (hasCoverImage) {
      await prisma.propertyImage.updateMany({
        where: {
          propertyId: validatedInput.propertyId,
          isCover: true,
          deletedAt: null,
        },
        data: {
          isCover: false,
        },
      });
    }

    // Create all images
    const imagesToCreate = validatedInput.images.map((image, index) => ({
      id: generateUUID(),
      propertyId: validatedInput.propertyId,
      filename: image.filename,
      url: image.url,
      isCover: image.isCover,
      sortOrder: image.sortOrder ?? index,
    }));

    await prisma.propertyImage.createMany({
      data: imagesToCreate,
      skipDuplicates: true,
    });

    // Return the created images
    const createdImages = await prisma.propertyImage.findMany({
      where: {
        propertyId: validatedInput.propertyId,
        id: {
          in: imagesToCreate.map(img => img.id),
        },
      },
      orderBy: [
        { isCover: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return createdImages;
  } catch (error) {
    console.error("Error bulk creating property images:", error);
    throw new Error("Failed to create property images");
  }
}

/**
 * Update image sort order
 */
export async function updateImageSortOrder(
  imageId: string,
  sortOrder: number
): Promise<PropertyImage> {
  try {
    const updatedImage = await prisma.propertyImage.update({
      where: { id: imageId },
      data: { sortOrder },
    });

    return updatedImage;
  } catch (error) {
    console.error("Error updating image sort order:", error);
    throw new Error("Failed to update image sort order");
  }
}

/**
 * Update which image is the cover image for a property by image filename
 */
export async function updatePropertyImageCover(
  propertyId: string,
  imageFilename: string
): Promise<void> {
  try {
    // Find the target image by filename
    const targetImage = await prisma.propertyImage.findFirst({
      where: {
        propertyId,
        filename: imageFilename,
        deletedAt: null,
      },
    });

    if (!targetImage) {
      throw new Error(`Image not found: ${imageFilename}`);
    }

    // Use a transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      // First, remove cover status from all images for this property
      await tx.propertyImage.updateMany({
        where: {
          propertyId,
          deletedAt: null,
        },
        data: {
          isCover: false,
        },
      });

      // Then set the target image as cover
      await tx.propertyImage.update({
        where: {
          id: targetImage.id,
        },
        data: {
          isCover: true,
        },
      });
    });
  } catch (error) {
    console.error("Error updating property image cover:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update property image cover");
  }
}

/**
 * Soft delete all images for a property
 */
export async function softDeleteAllPropertyImages(propertyId: string): Promise<{ count: number }> {
  try {
    const result = await prisma.propertyImage.updateMany({
      where: {
        propertyId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return { count: result.count };
  } catch (error) {
    console.error("Error soft deleting property images:", error);
    throw new Error("Failed to soft delete property images");
  }
}