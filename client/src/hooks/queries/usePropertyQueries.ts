import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProperty,
  updateProperty,
  deleteProperty,
  deletePropertyWithTransactions,
} from "@/lib/services/client/propertiesService";
import {
  getPropertyImages,
  uploadPropertyImages,
  updatePropertyCoverImage,
} from "@/lib/services/client/imageService";
import { UpdatePropertyInput, CreatePropertyInput } from "@/lib/validations/property";
import { FileWithPreview } from "@/components/ui/multi-image-upload";
import { toast } from "sonner";
import type { Property } from "@/types/properties";
import { transformPrismaProperties } from "@/lib/utils/prisma-transforms";
import { QUERY_OPTIONS } from "./queryConfig";
import type { PropertyImage } from "@prisma/client";

/**
 * Hierarchical query keys for property-related queries
 * Following ARCHITECTURE.md pattern for organized cache management
 */
export const PROPERTY_QUERY_KEYS = {
  all: ["properties"] as const,
  lists: () => [...PROPERTY_QUERY_KEYS.all, "list"] as const,
  detail: (id: string) => [...PROPERTY_QUERY_KEYS.all, "detail", id] as const,
  images: (id: string) => [...PROPERTY_QUERY_KEYS.all, "images", id] as const,
  transactions: (id: string) => [...PROPERTY_QUERY_KEYS.all, "transactions", id] as const,
  analytics: {
    all: (id: string) => [...PROPERTY_QUERY_KEYS.all, "analytics", id] as const,
    metrics: (propertyId: string, dateFrom?: string, dateTo?: string) =>
      [...PROPERTY_QUERY_KEYS.all, "analytics", propertyId, "metrics", { dateFrom, dateTo }] as const,
  },
} as const;

async function fetchProperties(): Promise<Property[]> {
  const response = await fetch("/api/properties");

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }

  const data = await response.json();
  return transformPrismaProperties(data.properties);
}

/**
 * Query hook for properties list
 *
 * @param initialData - Optional SSR data passed from server component
 * @returns Query result with properties list
 */
export function usePropertiesQuery(initialData?: Property[]) {
  return useQuery<Property[]>({
    queryKey: PROPERTY_QUERY_KEYS.lists(),
    queryFn: fetchProperties,
    initialData,
    ...QUERY_OPTIONS.properties,
  });
}

/**
 * Query hook for property images
 *
 * @param propertyId - The property ID
 * @param options - Optional query options (initialData, enabled)
 * @returns Query result with property images
 */
export function usePropertyImages(
  propertyId: string,
  options?: { initialData?: PropertyImage[]; enabled?: boolean }
) {
  return useQuery({
    queryKey: PROPERTY_QUERY_KEYS.images(propertyId),
    queryFn: () => getPropertyImages(propertyId),
    initialData: options?.initialData,
    enabled: options?.enabled ?? !!propertyId,
    ...QUERY_OPTIONS.images,
  });
}

/**
 * Mutation hook for creating a new property
 *
 * Invalidates:
 * - Properties list (to show new property)
 *
 * @returns Mutation function and state
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePropertyInput) => {
      return await createProperty(data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.lists() });
      toast.success("Property created successfully");
    },

    onError: (error) => {
      console.error("Error creating property:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create property");
    },
  });
}

/**
 * Mutation hook for updating a property
 *
 * Invalidates:
 * - Properties list (to reflect updates)
 * - Specific property detail (to refresh single property view)
 * - Property analytics (financial data may have changed)
 *
 * @returns Mutation function and state
 */
export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePropertyInput;
    }) => {
      return await updateProperty(id, data);
    },

    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.analytics.all(id),
      });
      toast.success("Property updated successfully");
    },

    onError: (error) => {
      console.error("Error updating property:", error);
      toast.error("Failed to update property");
    },
  });
}

/**
 * Mutation hook for deleting a property
 *
 * Note: This is a simple delete. For deleting with transactions,
 * use useDeletePropertyWithTransactions instead.
 *
 * Invalidates:
 * - Properties list (to remove deleted property)
 *
 * @returns Mutation function and state
 */
export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteProperty(id);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.lists() });
      toast.success("Property deleted successfully");
    },

    onError: (error) => {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    },
  });
}

/**
 * Mutation hook for deleting a property with all associated data
 *
 * This is a comprehensive delete that removes:
 * - All transactions
 * - All images
 * - The property itself
 *
 * Invalidates:
 * - Properties list
 * - Property detail
 * - Property transactions
 * - Property analytics
 * - Property images
 *
 * @returns Mutation function and state
 */
export function useDeletePropertyWithTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return await deletePropertyWithTransactions(id, name);
    },

    onSuccess: (result, { id }) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.lists() });
        queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.detail(id) });
        queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.transactions(id) });
        queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.analytics.all(id) });
        queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.images(id) });
      }
    },

    onError: (error) => {
      console.error("Error deleting property with transactions:", error);
    },
  });
}

/**
 * Mutation hook for uploading property images
 *
 * Invalidates:
 * - Property images (to show new images)
 * - Properties list (cover image may have changed)
 *
 * @returns Mutation function and state
 */
export function useUploadPropertyImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      images,
      coverImageIndex,
    }: {
      propertyId: string;
      images: FileWithPreview[];
      coverImageIndex: number;
    }) => {
      return await uploadPropertyImages(propertyId, images, coverImageIndex);
    },

    onSuccess: (data, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.images(propertyId),
      });
      queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.lists() });
    },

    onError: (error) => {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    },
  });
}

/**
 * Mutation hook for updating property cover image
 *
 * Invalidates:
 * - Property images (to reflect cover image change)
 * - Properties list (cover image changed)
 *
 * @returns Mutation function and state
 */
export function useUpdateCoverImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      filename,
    }: {
      propertyId: string;
      filename: string;
    }) => {
      return await updatePropertyCoverImage(propertyId, filename);
    },

    onSuccess: (data, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.images(propertyId),
      });
      queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.lists() });
    },

    onError: (error) => {
      console.error("Error updating cover image:", error);
      toast.error("Failed to update cover image");
    },
  });
}
