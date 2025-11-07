"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertyType, OccupancyStatus } from "@/types/properties";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { toCamelCase } from "@/lib/utils/index";
import { propertyFormInputSchema, PropertyFormInput, CreatePropertyInput } from "@/lib/validations/property";
import { uploadPropertyImages } from "@/lib/services/client/imageService";
import { validatePropertyFiles } from "@/lib/services/shared/imageUtils";
import {
  MultiImageUpload,
  type FileWithPreview,
} from "@/components/ui/multi-image-upload";
import { useCreateProperty } from "@/hooks/queries/usePropertyQueries";
import { trackEvent } from "@/lib/analytics/tracker";
import { PROPERTY_EVENTS } from "@/lib/analytics/events";
import { Loading } from "@/components/ui/loading";

const getPropertyTypeOptions = () => {
  return Object.values(PropertyType).map((type) => ({
    value: type,
    label: toCamelCase(type),
  }));
};

interface PropertyAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyAdded: () => void;
}

export function PropertyAddDialog({
  isOpen,
  onClose,
  onPropertyAdded,
}: PropertyAddDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const propertyTypeOptions = getPropertyTypeOptions();

  const createPropertyMutation = useCreateProperty();

  const form = useForm<PropertyFormInput>({
    resolver: zodResolver(propertyFormInputSchema),
    mode: "all" as const,
    defaultValues: {
      name: "",
      address: "",
      type: PropertyType.APARTMENT,
      rent: "",
      tenants: "0",
      occupancy: OccupancyStatus.AVAILABLE,
    },
  });

  const {
    handleSubmit,
    watch,
    reset,
    formState: { isValid },
  } = form;

  const watchedOccupancy = watch("occupancy");

  const handleFilesChange = (files: FileWithPreview[]) => {
    const fileList = files.map((f) => f.file);
    const validation = validatePropertyFiles(fileList);

    if (!validation.isValid) {
      setUploadError(validation.errors.join(", "));
      return;
    }

    setUploadError(null);
    setSelectedFiles(files);

    if (coverImageIndex >= files.length) {
      setCoverImageIndex(0);
    }
  };

  const handleCoverImageChange = (index: number) => {
    setCoverImageIndex(index);
  };

  const handleClose = () => {
    if (!createPropertyMutation.isPending) {
      reset();
      setSelectedFiles([]);
      setCoverImageIndex(0);
      setUploadError(null);
      onClose();
    }
  };

  const onSubmit = handleSubmit(async (formData: PropertyFormInput) => {
    try {
      setUploadError(null);

      // Transform form data to API input format
      const data: CreatePropertyInput = {
        name: formData.name,
        address: formData.address,
        type: formData.type,
        rent: parseFloat(formData.rent),
        tenants: parseInt(formData.tenants, 10),
        occupancy: formData.occupancy,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      };

      const createdProperty = await createPropertyMutation.mutateAsync(data);

      trackEvent(PROPERTY_EVENTS.PROPERTY_CREATED);

      if (selectedFiles.length > 0) {
        try {
          await uploadPropertyImages(
            createdProperty.id,
            selectedFiles,
            coverImageIndex
          );
          toast.success("Property created successfully!");
        } catch (error) {
          console.error("Image upload failed:", error);
          setUploadError("Property created, but some images failed to upload");
          toast.success(
            "Property created, but some images failed to upload. Please try to add them later."
          );
        }
      } else {
        toast.success("Property created successfully!");
      }

      onPropertyAdded();
      handleClose();
    } catch (error) {
      console.error("Error creating property:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create property. Please try again later.";
      toast.error(errorMessage);
    }
  });

  const handleOccupancyChange = (value: OccupancyStatus) => {
    if (value === OccupancyStatus.AVAILABLE) {
      form.setValue("tenants", "0", { shouldValidate: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col p-6 gap-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-foreground font-semibold">
                  Add New Property
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Property Information</CardTitle>
                  </CardHeader>
                  <CardContent className="gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter property name" {...field} />
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
                            <FormLabel>Property Type *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {propertyTypeOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
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
                              <FormLabel>Address *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter full address"
                                  {...field}
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

                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Rental Information</CardTitle>
                  </CardHeader>
                  <CardContent className="gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <FormField
                        control={form.control}
                        name="rent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Monthly Rent (€) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="50000"
                                placeholder="0.00"
                                {...field}
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
                            <FormLabel>Current Tenants *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                disabled={
                                  watchedOccupancy === OccupancyStatus.AVAILABLE
                                }
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="occupancy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Occupancy Status *</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleOccupancyChange(
                                    value as OccupancyStatus
                                  );
                                }}
                                value={field.value}
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
                    </div>
                  </CardContent>
                </Card>
              </div>

              <MultiImageUpload
                files={selectedFiles}
                onFilesChange={handleFilesChange}
                coverImageIndex={coverImageIndex}
                onCoverImageChange={handleCoverImageChange}
                isUploading={createPropertyMutation.isPending}
                error={uploadError}
                disabled={createPropertyMutation.isPending}
                label="Property Images"
                description="Add up to 10 images for your property. The first image will be used as the cover photo."
                maxFiles={10}
                maxSize={5 * 1024 * 1024}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={createPropertyMutation.isPending}
                  className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPropertyMutation.isPending || !isValid}
                  className="hover:bg-primary/90"
                >
                  {createPropertyMutation.isPending ? (
                    <Loading loadingText="Creating..." />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Property
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
