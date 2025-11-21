"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Property } from "@/types/properties";
import { basePropertySchema, UpdatePropertyInput } from "@/lib/validations/property";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Save, X, Loader2 } from "lucide-react";
import { deletePropertyImage, getPropertyImages } from "@/lib/services/client/imageService";
import type { PropertyImage } from "@prisma/client";
import {
  useUpdateProperty,
  useUploadPropertyImages,
  useUpdateCoverImage,
} from "@/hooks/queries/usePropertyQueries";
import { FileWithPreview } from "@/components/ui/multi-image-upload";
import { useCoverImageManager } from "@/hooks/useCoverImageManager";
import { PropertyBasicInfoForm } from "./PropertyBasicInfoForm";
import { PropertyFinancialForm } from "./PropertyFinancialForm";
import { PropertyImagesManager } from "./PropertyImagesManager";

interface PropertyEditFormProps {
  property: Property;
  existingImages?: PropertyImage[];
  onChange?: (property: Property) => void;
}

export function PropertyEditForm({
  property,
  existingImages = [],
  onChange,
}: PropertyEditFormProps) {
  const router = useRouter();
  const updatePropertyMutation = useUpdateProperty();
  const uploadImagesMutation = useUploadPropertyImages();
  const updateCoverImageMutation = useUpdateCoverImage();

  const [newImages, setNewImages] = useState<FileWithPreview[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    removedExistingImageIds,
    coverImageIndex,
    hasCoverImageChanged,
    visibleImages,
    handleRemoveExistingImage,
    handleCoverImageChange,
    resetState,
    updateFromServer,
  } = useCoverImageManager(existingImages);

  const form = useForm<UpdatePropertyInput>({
    resolver: zodResolver(
      basePropertySchema.extend({
        id: z.uuid(),
      })
    ),
    defaultValues: {
      id: property.id!,
      name: property.name || "",
      address: property.address || "",
      type: property.type,
      rent: property.rent || 0,
      tenants: property.tenants || 0,
      occupancy: property.occupancy,
      purchasePrice: property.purchasePrice || undefined,
    },
  });

  const handleCancel = () => {
    setNewImages([]);
    setImageError(null);
    router.push(`/dashboard/properties/${property.id}`);
  };

  const handleSave = form.handleSubmit(async (data) => {
    setIsSaving(true);
    try {
      let selectedCoverImageFilename: string | undefined;
      if (hasCoverImageChanged && coverImageIndex < visibleImages.length) {
        selectedCoverImageFilename = visibleImages[coverImageIndex].id;
      }

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

      if (removedExistingImageIds.size > 0) {
        const deletionPromises = Array.from(removedExistingImageIds).map(
          async (imageId) => {
            try {
              await deletePropertyImage(property.id!, imageId);
            } catch (error) {
              console.error(`Failed to delete image ${imageId}:`, error);
            }
          }
        );

        await Promise.all(deletionPromises);
      }

      setNewImages([]);
      resetState();

      try {
        const imageData = await getPropertyImages(property.id!);
        updateFromServer(imageData);
      } catch (error) {
        console.error("Failed to reload images after save:", error);
      }

      router.push(`/dashboard/properties/${property.id}`);
    } catch (error) {
      console.error("Error saving property:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  });

  const formValues = form.watch();
  useEffect(() => {
    if (onChange) {
      const updatedProperty: Property = {
        ...property,
        ...formValues,
      };
      onChange(updatedProperty);
    }
  }, [formValues, onChange, property]);

  return (
    <Form {...form}>
      <form onSubmit={handleSave} className="flex flex-col space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PropertyBasicInfoForm form={form} isSaving={isSaving} />
          <PropertyFinancialForm form={form} isSaving={isSaving} />
        </div>

        <PropertyImagesManager
          newImages={newImages}
          onNewImagesChange={setNewImages}
          existingImages={visibleImages}
          onRemoveExistingImage={handleRemoveExistingImage}
          coverImageIndex={coverImageIndex}
          onCoverImageChange={handleCoverImageChange}
          imageError={imageError}
          isSaving={isSaving}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="hover:bg-destructive hover:border-destructive"
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            className="hover:bg-primary/90 hover:border-primary"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
