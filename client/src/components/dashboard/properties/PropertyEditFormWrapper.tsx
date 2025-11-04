"use client";

import { useRouter } from "next/navigation";
import { PropertyEditForm } from "./PropertyEditForm";
import type { Property } from "@/types/properties";
import type { PropertyImage } from "@prisma/client";
import type { UpdatePropertyInput } from "@/lib/validations/property";
import type { FileWithPreview } from "@/components/ui/multi-image-upload";
import {
  useUpdateProperty,
  useUploadPropertyImages,
  useUpdateCoverImage,
} from "@/hooks/queries/usePropertyQueries";

interface PropertyEditFormWrapperProps {
  property: Property;
  existingImages: PropertyImage[];
}

export function PropertyEditFormWrapper({
  property,
  existingImages,
}: PropertyEditFormWrapperProps) {
  const router = useRouter();
  const updatePropertyMutation = useUpdateProperty();
  const uploadImagesMutation = useUploadPropertyImages();
  const updateCoverImageMutation = useUpdateCoverImage();

  const handleSave = async (
    data: UpdatePropertyInput,
    newImages?: FileWithPreview[],
    coverImageIndex: number = 0,
    hasCoverImageChanged?: boolean,
    selectedCoverImageFilename?: string
  ) => {
    try {
      await updatePropertyMutation.mutateAsync({ id: property.id, data });

      if (
        hasCoverImageChanged &&
        !newImages?.length &&
        selectedCoverImageFilename
      ) {
        await updateCoverImageMutation.mutateAsync({
          propertyId: property.id,
          filename: selectedCoverImageFilename,
        });
      }

      if (newImages && newImages.length > 0) {
        const existingImageCount = existingImages.length;
        let finalCoverImageIndex = 0;

        if (coverImageIndex >= existingImageCount) {
          finalCoverImageIndex = coverImageIndex - existingImageCount;
        } else if (existingImageCount === 0) {
          finalCoverImageIndex = 0;
        } else {
          finalCoverImageIndex = -1;
        }

        await uploadImagesMutation.mutateAsync({
          propertyId: property.id,
          images: newImages,
          coverImageIndex: finalCoverImageIndex,
        });
      }

      router.push(`/dashboard/properties/${property.id}`);
    } catch (error) {
      console.error("Error saving property:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/properties/${property.id}`);
  };

  return (
    <PropertyEditForm
      property={property}
      existingImages={existingImages}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
