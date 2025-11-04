import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProperty,
  deleteProperty,
  deletePropertyWithTransactions,
} from "@/lib/services/client/propertiesService";
import {
  getPropertyImages,
  uploadPropertyImages,
  updatePropertyCoverImage,
} from "@/lib/services/client/imageService";
import { UpdatePropertyInput } from "@/lib/validations/property";
import { FileWithPreview } from "@/components/ui/multi-image-upload";
import { toast } from "sonner";
import type { Property } from "@/types/properties";
import { transformPrismaProperty, transformPrismaProperties } from "@/lib/utils/prisma-transforms";

export const PROPERTY_QUERY_KEYS = {
  all: ["properties"] as const,
  lists: () => [...PROPERTY_QUERY_KEYS.all, "list"] as const,
  detail: (id: string) => [...PROPERTY_QUERY_KEYS.all, "detail", id] as const,
  images: (id: string) =>
    [...PROPERTY_QUERY_KEYS.all, "images", id] as const,
  transactions: (id: string) =>
    [...PROPERTY_QUERY_KEYS.all, "transactions", id] as const,
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

async function fetchPropertyById(propertyId: string): Promise<Property> {
  const response = await fetch(`/api/properties/${propertyId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Property not found");
    }
    throw new Error("Failed to fetch property");
  }

  const data = await response.json();
  return transformPrismaProperty(data.property);
}

export function usePropertiesQuery(initialData?: Property[]) {
  return useQuery<Property[]>({
    queryKey: PROPERTY_QUERY_KEYS.lists(),
    queryFn: fetchProperties,
    initialData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function usePropertyQuery(
  propertyId: string,
  options?: { initialData?: Property; enabled?: boolean }
) {
  return useQuery<Property>({
    queryKey: PROPERTY_QUERY_KEYS.detail(propertyId),
    queryFn: () => fetchPropertyById(propertyId),
    initialData: options?.initialData,
    enabled: options?.enabled ?? !!propertyId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function usePropertyImages(propertyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROPERTY_QUERY_KEYS.images(propertyId),
    queryFn: () => getPropertyImages(propertyId),
    enabled: options?.enabled ?? !!propertyId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

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
    },

    onError: (error) => {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    },
  });
}

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
    },

    onError: (error) => {
      console.error("Error updating cover image:", error);
      toast.error("Failed to update cover image");
    },
  });
}

