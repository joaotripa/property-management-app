import { z } from "zod";

/**
 * Schema for creating a new property image
 */
export const createPropertyImageSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  filename: z.string().min(1, "Filename is required"),
  url: z.string().url("Invalid URL format"),
  isCover: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

/**
 * Schema for bulk creating property images
 */
export const bulkCreatePropertyImagesSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  images: z.array(z.object({
    filename: z.string().min(1, "Filename is required"),
    url: z.string().url("Invalid URL format"),
    isCover: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
  })).min(1, "At least one image is required"),
});

export type CreatePropertyImageInput = z.infer<typeof createPropertyImageSchema>;
export type BulkCreatePropertyImagesInput = z.infer<typeof bulkCreatePropertyImagesSchema>;