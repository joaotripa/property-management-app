"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertyType } from "@prisma/client";
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
import { Save, X, Loader2 } from "lucide-react";
import { toCamelCase } from "@/lib/utils";
import { Property } from "@/types/properties";
import { type CreatePropertyResponse, type ErrorResponse } from "@/lib/validations/property";
import { z } from "zod";
import {
  uploadPropertyImages,
  validatePropertyFiles,
} from "@/lib/supabase/uploads";
import {
  MultiImageUpload,
  type FileWithPreview,
} from "@/components/ui/multi-image-upload";

const propertyFormInputSchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .min(2, "Property name must be at least 2 characters")
    .max(100, "Property name must be less than 100 characters")
    .trim(),
  address: z
    .string()
    .min(1, "Address is required")
    .min(2, "Address must be at least 2 characters")
    .max(200, "Address must be less than 200 characters")
    .trim(),
  type: z.nativeEnum(PropertyType, {
    message: "Please select a valid property type",
  }),
  rent: z.string().min(1, "Monthly rent is required"),
  tenants: z.string().min(1, "Number of tenants is required"),
  occupancy: z.enum(["Available", "Occupied"], {
    message: "Please select a valid occupancy status",
  }),
  image: z.string().optional(),
});

type PropertyFormInput = z.infer<typeof propertyFormInputSchema>;

const getPropertyTypeOptions = () => {
  return Object.values(PropertyType).map((type) => ({
    value: type,
    label: toCamelCase(type),
  }));
};

interface PropertyAddFormProps {
  onSave: (property: Property) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PropertyAddForm({
  onSave,
  onCancel,
  isSubmitting = false,
}: PropertyAddFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const propertyTypeOptions = getPropertyTypeOptions();

  const form = useForm<PropertyFormInput>({
    resolver: zodResolver(propertyFormInputSchema),
    mode: 'all',
    defaultValues: {
      name: "",
      address: "",
      type: PropertyType.APARTMENT,
      rent: "",
      tenants: "0",
      occupancy: "Available",
      image: "",
    },
  });

  const {
    handleSubmit,
    watch,
    setError,
    clearErrors,
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

    setUploadProgress(new Array(files.length).fill(0));

    if (coverImageIndex >= files.length) {
      setCoverImageIndex(0);
    }
  };

  const handleCoverImageChange = (index: number) => {
    setCoverImageIndex(index);
  };

  const handleUploadProgress = (fileIndex: number, progress: number) => {
    setUploadProgress((prev) => {
      const newProgress = [...prev];
      newProgress[fileIndex] = progress;
      return newProgress;
    });
  };

  const onSubmit = async (data: PropertyFormInput) => {
    try {
      setIsLoading(true);
      setApiError(null);
      clearErrors();

      const apiData = {
        name: data.name,
        address: data.address,
        type: data.type,
        rent: parseFloat(data.rent),
        tenants: parseInt(data.tenants, 10),
        occupancy: data.occupancy,
      };

      if (isNaN(apiData.rent) || apiData.rent <= 0) {
        setError("rent", { message: "Please enter a valid rent amount" });
        return;
      }
      if (isNaN(apiData.tenants) || apiData.tenants < 0) {
        setError("tenants", { message: "Please enter a valid number of tenants" });
        return;
      }

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorResult: ErrorResponse = await response.json();
        
        // Handle validation errors from API
        if (response.status === 400 && errorResult.errors) {
          // Map API field errors to form errors
          Object.entries(errorResult.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(field as keyof PropertyFormInput, { 
                message: messages[0] 
              });
            }
          });
          setApiError("Please fix the validation errors below");
        } else {
          setApiError(errorResult.message || "Failed to create property");
        }
        return;
      }

      const result: CreatePropertyResponse = await response.json();

      if (!result.success || !result.property) {
        setApiError("Invalid response from server");
        return;
      }

      const createdProperty = result.property;

      if (selectedFiles.length > 0) {
        try {
          const files = selectedFiles.map((f) => f.file);
          await uploadPropertyImages(
            files,
            createdProperty.id,
            coverImageIndex,
            handleUploadProgress
          );
        } catch (error) {
          console.error("Image upload failed:", error);
          setUploadError("Property created, but some images failed to upload");
        }
      }

      onSave(createdProperty);
    } catch (error) {
      console.error("Error creating property:", error);
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to create property. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOccupancyChange = (value: "Available" | "Occupied") => {
    if (value === "Available") {
      form.setValue("tenants", "0", { shouldValidate: true });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-6">
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
                    <FormLabel>Property Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter property name"
                        {...field}
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
                    <FormLabel>Property Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

        {/* Rental Information */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Rental Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent (€) *</FormLabel>
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
                        disabled={watchedOccupancy === "Available"}
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
                          handleOccupancyChange(value as "Available" | "Occupied");
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select occupancy status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Occupied">Occupied</SelectItem>
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

      {/* Image Upload */}
      <MultiImageUpload
        files={selectedFiles}
        onFilesChange={handleFilesChange}
        coverImageIndex={coverImageIndex}
        onCoverImageChange={handleCoverImageChange}
        isUploading={isLoading}
        uploadProgress={uploadProgress}
        error={uploadError}
        disabled={isLoading || isSubmitting}
        label="Property Images"
        description="Add up to 10 images for your property. The first image will be used as the cover photo."
        maxFiles={10}
        maxSize={5 * 1024 * 1024}
      />

      {/* Error Display */}
      {apiError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
          <div className="text-sm text-destructive font-medium">
            {apiError}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
          className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isSubmitting || !isValid}
          className="hover:bg-primary/90"
        >
          {isLoading || isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
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
  );
}
