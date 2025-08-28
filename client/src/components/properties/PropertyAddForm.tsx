"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertyType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Loader2 } from "lucide-react";
import { toCamelCase } from "@/lib/utils";
import { Property } from "@/types/properties";
import { 
  type CreatePropertyResponse 
} from "@/lib/validations/property";
import { z } from "zod";
import { 
  uploadPropertyImage, 
  validateImageFile, 
  createFilePreview
} from "@/lib/file-uploads";
import { FileUpload } from "@/components/ui/file-upload";

// Form-specific schema for input handling (all strings from form inputs)
const propertyFormInputSchema = z.object({
  name: z.string().min(1, "Property name is required").trim(),
  address: z.string().min(1, "Address is required").trim(),
  type: z.nativeEnum(PropertyType),
  rent: z.string().min(1, "Monthly rent is required"),
  tenants: z.string().min(1, "Number of tenants is required"),
  occupancy: z.enum(["Available", "Occupied"]),
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const propertyTypeOptions = getPropertyTypeOptions();

  const form = useForm<PropertyFormInput>({
    resolver: zodResolver(propertyFormInputSchema),
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
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = form;

  // Watch form values for real-time updates
  const watchedType = watch("type");
  const watchedOccupancy = watch("occupancy");

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || "Invalid file");
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    
    // Create preview
    try {
      const preview = await createFilePreview(file);
      setImagePreview(preview);
    } catch (error) {
      console.error('Error creating preview:', error);
      setUploadError("Failed to create preview");
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setUploadError(null);
  };

  const onSubmit = async (data: PropertyFormInput) => {
    try {
      setIsLoading(true);

      // Transform form data to API data (convert strings to numbers)
      const apiData = {
        name: data.name,
        address: data.address,
        type: data.type,
        rent: parseFloat(data.rent),
        tenants: parseInt(data.tenants, 10),
        occupancy: data.occupancy,
      };

      // Validate the transformed data
      if (isNaN(apiData.rent) || apiData.rent <= 0) {
        throw new Error("Please enter a valid rent amount");
      }
      if (isNaN(apiData.tenants) || apiData.tenants < 0) {
        throw new Error("Please enter a valid number of tenants");
      }

      // First, create the property to get the ID
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      const result: CreatePropertyResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create property");
      }

      if (!result.success || !result.property) {
        throw new Error("Invalid response from server");
      }

      const createdProperty = result.property;

      // Upload image if file is selected, using the property ID
      if (selectedFile) {
        try {
          await uploadPropertyImage(selectedFile, createdProperty.id);
          // Note: We don't need to update the property with image URL since we retrieve it dynamically
        } catch (error) {
          // Image upload failed, but property was created successfully
          console.error("Image upload failed:", error);
          // Could show a warning to the user that the property was created but image upload failed
        }
      }

      onSave(createdProperty);
    } catch (error) {
      console.error("Error creating property:", error);
      // In a real app, you'd want to show a toast notification here
      alert(error instanceof Error ? error.message : "Failed to create property");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (value: PropertyType) => {
    setValue("type", value, { shouldValidate: true });
  };

  const handleOccupancyChange = (value: "Available" | "Occupied") => {
    setValue("occupancy", value, { shouldValidate: true });
    
    // Reset tenants to 0 when property becomes available
    if (value === "Available") {
      setValue("tenants", "0", { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Information */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter property name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Property Type *</Label>
                <Select
                  value={watchedType}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger
                    className={errors.type ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Enter full address"
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
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
              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent (€) *</Label>
                <Input
                  id="rent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="50000"
                  {...register("rent")}
                  placeholder="0.00"
                  className={errors.rent ? "border-destructive" : ""}
                />
                {errors.rent && (
                  <p className="text-sm text-destructive">{errors.rent.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenants">Current Tenants *</Label>
                <Input
                  id="tenants"
                  type="number"
                  min="0"
                  max="100"
                  {...register("tenants")}
                  disabled={watchedOccupancy === "Available"}
                  placeholder="0"
                  className={errors.tenants ? "border-destructive" : ""}
                />
                {errors.tenants && (
                  <p className="text-sm text-destructive">{errors.tenants.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="occupancy">Occupancy Status *</Label>
                <Select
                  value={watchedOccupancy}
                  onValueChange={handleOccupancyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupancy status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
                {errors.occupancy && (
                  <p className="text-sm text-destructive">{errors.occupancy.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Upload */}
      <FileUpload
        onFileSelect={handleFileSelect}
        onFileRemove={handleRemoveFile}
        preview={imagePreview}
        isUploading={isLoading && selectedFile !== null}
        uploadProgress={uploadProgress}
        error={uploadError}
        disabled={isLoading || isSubmitting}
        label="Property Image"
        description="Click to upload or drag and drop"
      />

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
          {(isLoading || isSubmitting) ? (
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
  );
}