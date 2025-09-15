"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PropertyType, OccupancyStatus } from "@prisma/client";
import { Property } from "@/types/properties";
import {
  basePropertySchema,
  UpdatePropertyInput,
} from "@/lib/validations/property";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiImageUpload,
  FileWithPreview,
  ExistingImageItem,
} from "@/components/ui/multi-image-upload";
import { Save, X, Loader2 } from "lucide-react";
import { toCamelCase } from "@/lib/utils";
import { Loading } from "@/components/ui/loading";
import {
  getPropertyImageData,
  deletePropertyImage,
  ImageServiceError,
} from "@/lib/services/imageService";

const getPropertyTypeOptions = () => {
  return Object.values(PropertyType).map((type) => ({
    value: type,
    label: toCamelCase(type),
  }));
};

interface PropertyEditFormProps {
  property: Property;
  onSave: (
    data: UpdatePropertyInput,
    images?: FileWithPreview[],
    coverImageIndex?: number,
    hasCoverImageChanged?: boolean
  ) => Promise<void>;
  onCancel: () => void;
  onChange?: (property: Property) => void;
}

export function PropertyEditForm({
  property,
  onSave,
  onCancel,
  onChange,
}: PropertyEditFormProps) {
  const [newImages, setNewImages] = useState<FileWithPreview[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImageItem[]>([]);
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState<Set<string>>(new Set());
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [initialCoverImageIndex, setInitialCoverImageIndex] = useState(0);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const propertyTypeOptions = getPropertyTypeOptions();

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

  useEffect(() => {
    const loadExistingImages = async () => {
      if (!property.id) return;

      setIsLoadingImages(true);
      setImageError(null);

      try {
        const imageData = await getPropertyImageData(property.id);
        const existingImageItems: ExistingImageItem[] = imageData.map(
          (imgData) => ({
            url: imgData.url,
            id: imgData.filename,
            isExisting: true as const,
          })
        );
        setExistingImages(existingImageItems);

        const coverImageIndex = imageData.findIndex((img) => img.isCover);
        if (coverImageIndex !== -1) {
          setCoverImageIndex(coverImageIndex);
          setInitialCoverImageIndex(coverImageIndex);
        } else {
          setCoverImageIndex(0);
          setInitialCoverImageIndex(0);
        }
      } catch (error) {
        console.error("Failed to load existing images:", error);

        let errorMessage = "Failed to load existing images";
        if (error instanceof ImageServiceError) {
          errorMessage = error.message;
        }

        setImageError(errorMessage);
      } finally {
        setIsLoadingImages(false);
      }
    };

    loadExistingImages();
  }, [property.id]);

  const handleRemoveExistingImage = (imageId: string) => {
    setImageError(null);

    // Stage the image for deletion - don't call API immediately
    setRemovedExistingImageIds(prev => new Set(prev).add(imageId));

    // Find the index of the removed image in the visible images list
    const visibleImages = existingImages.filter(img => !removedExistingImageIds.has(img.id));
    const removedImageIndex = visibleImages.findIndex(img => img.id === imageId);

    // Adjust cover image index if necessary
    if (removedImageIndex === coverImageIndex && coverImageIndex > 0) {
      setCoverImageIndex(0);
    } else if (removedImageIndex < coverImageIndex) {
      setCoverImageIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleCoverImageChange = (index: number) => {
    // Only update local state - don't save to database until form save
    setCoverImageIndex(index);
  };


  const handleCancel = () => {
    // Reset staged deletions when canceling
    setRemovedExistingImageIds(new Set());
    setNewImages([]);
    setImageError(null);
    onCancel();
  };

  const handleSave = form.handleSubmit(async (data) => {
    setIsSaving(true);
    try {
      // Check if cover image has changed from initial state
      const hasCoverImageChanged = coverImageIndex !== initialCoverImageIndex;

      // Save the property with new images first
      await onSave(data, newImages, coverImageIndex, hasCoverImageChanged);

      // Process staged deletions after successful save
      if (removedExistingImageIds.size > 0) {
        const deletionPromises = Array.from(removedExistingImageIds).map(async (imageId) => {
          try {
            await deletePropertyImage(property.id!, imageId);
          } catch (error) {
            console.error(`Failed to delete image ${imageId}:`, error);
            // Continue with other deletions even if one fails
          }
        });

        await Promise.all(deletionPromises);
      }

      // Reset states
      setNewImages([]);
      setRemovedExistingImageIds(new Set());
      setCoverImageIndex(0);

      // Reload images from server to get the updated state
      try {
        const imageData = await getPropertyImageData(property.id!);
        const existingImageItems: ExistingImageItem[] = imageData.map(
          (imgData) => ({
            url: imgData.url,
            id: imgData.filename,
            isExisting: true as const,
          })
        );
        setExistingImages(existingImageItems);

        const newCoverImageIndex = imageData.findIndex((img) => img.isCover);
        if (newCoverImageIndex !== -1) {
          setCoverImageIndex(newCoverImageIndex);
          setInitialCoverImageIndex(newCoverImageIndex);
        } else {
          setCoverImageIndex(0);
          setInitialCoverImageIndex(0);
        }
      } catch (error) {
        console.error("Failed to reload images after save:", error);
      }
    } catch (error) {
      console.error("Error saving property:", error);
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
          {/* Property Information */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSaving}
                          placeholder="Enter property name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSaving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isSaving}
                            placeholder="Enter property address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rent (€)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          disabled={isSaving}
                          placeholder="Enter monthly rent"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price (€)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          disabled={isSaving}
                          placeholder="Enter purchase price"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tenants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Tenants</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          disabled={isSaving}
                          placeholder="Number of tenants"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupancy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupancy Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSaving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select occupancy status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={OccupancyStatus.AVAILABLE}>
                            Available
                          </SelectItem>
                          <SelectItem value={OccupancyStatus.OCCUPIED}>
                            Occupied
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Images */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Property Images</CardTitle>
            <CardDescription>
              Upload new images for this property. Existing images will be
              preserved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingImages ? (
              <div className="flex items-center justify-center p-6">
                <Loading />
              </div>
            ) : (
              <MultiImageUpload
                files={newImages}
                onFilesChange={setNewImages}
                existingImages={existingImages.filter(img => !removedExistingImageIds.has(img.id))}
                onRemoveExistingImage={handleRemoveExistingImage}
                coverImageIndex={coverImageIndex}
                onCoverImageChange={handleCoverImageChange}
                error={imageError}
                maxFiles={10}
                disabled={isSaving}
              />
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
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
