import { prisma } from "@/lib/prisma";
// Note: Avoid importing model types directly to prevent stale client type issues

/**
 * Get all images for a property (not deleted)
 */
export async function getPropertyImages(propertyId: string) {
  try {
    const images = await prisma.propertyImage.findMany({
      where: {
        propertyId,
        deletedAt: null,
      },
      orderBy: [
        { isCover: 'desc' }, // Cover image first
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return images;
  } catch (error) {
    console.error("Error fetching property images:", error);
    throw new Error("Failed to fetch property images");
  }
}

/**
 * Get cover image for a property
 */
export async function getPropertyCoverImage(propertyId: string) {
  try {
    const coverImage = await prisma.propertyImage.findFirst({
      where: {
        propertyId,
        isCover: true,
        deletedAt: null,
      },
    });

    // If no cover image found, get the first available image
    if (!coverImage) {
      const firstImage = await prisma.propertyImage.findFirst({
        where: {
          propertyId,
          deletedAt: null,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      });

      return firstImage;
    }

    return coverImage;
  } catch (error) {
    console.error("Error fetching property cover image:", error);
    throw new Error("Failed to fetch property cover image");
  }
}

/**
 * Get a specific property image by ID
 */
export async function getPropertyImageById(imageId: string) {
  try {
    const image = await prisma.propertyImage.findFirst({
      where: {
        id: imageId,
        deletedAt: null,
      },
    });

    return image;
  } catch (error) {
    console.error("Error fetching property image:", error);
    throw new Error("Failed to fetch property image");
  }
}

/**
 * Check if a property has any images
 */
export async function hasPropertyImages(propertyId: string): Promise<boolean> {
  try {
    const count = await prisma.propertyImage.count({
      where: {
        propertyId,
        deletedAt: null,
      },
    });

    return count > 0;
  } catch (error) {
    console.error("Error checking property images:", error);
    return false;
  }
}

/**
 * Get property images with detailed data (for management interfaces)
 */
export async function getPropertyImagesDetailed(propertyId: string) {
  try {
    const images = await prisma.propertyImage.findMany({
      where: {
        propertyId,
        deletedAt: null,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { isCover: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return images;
  } catch (error) {
    console.error("Error fetching detailed property images:", error);
    throw new Error("Failed to fetch detailed property images");
  }
}