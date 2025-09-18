"use client";

import { useState, useEffect } from "react";
import type { PropertyImage } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Euro,
  Users,
  Edit,
  Home,
  Percent,
  ArrowLeft,
  ChevronRight,
  Trash2,
  LandPlot,
  MapPinHouse,
  Building2,
  Globe,
} from "lucide-react";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { PropertyEditForm } from "./PropertyEditForm";
import { FileWithPreview } from "@/components/ui/multi-image-upload";
import { TransactionTableWithActions } from "@/components/dashboard/transactions/TransactionTableWithActions";
import { TransactionFilters } from "@/components/dashboard/filters/TransactionFilters";
import { usePropertyTransactions } from "@/hooks/usePropertyTransactions";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { CategoryOption } from "@/types/transactions";
import { Property } from "@/types/properties";
import { OccupancyStatus } from "@prisma/client";
import { DeletePropertyConfirmDialog } from "./DeletePropertyConfirmDialog";
import {
  updateProperty,
  getPropertyById,
  PropertiesServiceError,
} from "@/lib/services/client/propertiesService";
import {
  uploadPropertyImages,
  getPropertyImages,
  updatePropertyCoverImage,
} from "@/lib/services/client/imageService";
import { ImageServiceError } from "@/lib/services/shared/imageUtils";
import { UpdatePropertyInput } from "@/lib/validations/property";
import { toast } from "sonner";

interface PropertyDetailsDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
  onDelete?: () => void | Promise<void>;
}

export function PropertyDetailsDialog({
  property,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: PropertyDetailsDialogProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [refreshedProperty, setRefreshedProperty] = useState<Property | null>(
    null
  );
  const [availableCategories, setAvailableCategories] = useState<
    CategoryOption[]
  >([]);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { filters, setFilters } = useTransactionFilters({
    propertyId: property?.id,
  });

  const { transactions, loading, error, totalCount } = usePropertyTransactions(
    property?.id,
    filters
  );

  useEffect(() => {
    if (!isOpen) {
      setMode("view");
      setEditProperty(null);
      setRefreshedProperty(null);
    }
  }, [isOpen, property?.id]);

  useEffect(() => {
    if (!isOpen || !property) return;

    setPropertyImages([]);
    setLoadingImages(true);

    const loadData = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setAvailableCategories(data.categories);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setAvailableCategories([]);
      }

      try {
        const images = await getPropertyImages(property.id);
        setPropertyImages(images);
      } catch (error) {
        console.error("Failed to load property images:", error);
        setPropertyImages([]);
      } finally {
        setLoadingImages(false);
      }
    };

    loadData();
  }, [isOpen, property]);

  if (!property) return null;

  const currentProperty = editProperty || refreshedProperty || property;
  const occupancyRate =
    currentProperty.occupancy === OccupancyStatus.OCCUPIED ? 100 : 0;
  const city = currentProperty.city || null;
  const country = currentProperty.country || null;

  const refreshPropertyData = async () => {
    if (!property?.id) return;
    try {
      const freshProperty = await getPropertyById(property.id);
      if (freshProperty) {
        setRefreshedProperty(freshProperty);
        onSave(freshProperty);
      }
    } catch (error) {
      console.error("Failed to refresh property data:", error);
    }
  };

  const handleEdit = () => {
    setEditProperty({ ...currentProperty });
    setMode("edit");
  };

  const handleBackToView = () => {
    setMode("view");
    setEditProperty(null);
  };

  const handleSave = async (
    data: UpdatePropertyInput,
    newImages?: FileWithPreview[],
    coverImageIndex: number = 0,
    hasCoverImageChanged?: boolean,
    selectedCoverImageFilename?: string
  ) => {
    if (!editProperty || !property) return;

    try {
      const updatedProperty = await updateProperty(property.id, data);

      onSave(updatedProperty);

      if (
        hasCoverImageChanged &&
        !newImages?.length &&
        selectedCoverImageFilename
      ) {
        try {
          await updatePropertyCoverImage(
            property.id,
            selectedCoverImageFilename
          );

          const images = await getPropertyImages(property.id);
          setPropertyImages(images);
        } catch (error) {
          console.error("Failed to update cover image:", error);
          toast.warning("Property updated but failed to update cover image");
        }
      }

      if (newImages && newImages.length > 0) {
        const existingImageCount = propertyImages.length;
        let finalCoverImageIndex = 0;

        if (coverImageIndex >= existingImageCount) {
          finalCoverImageIndex = coverImageIndex - existingImageCount;
        } else if (existingImageCount === 0) {
          finalCoverImageIndex = 0;
        } else {
          finalCoverImageIndex = -1;
        }

        await uploadPropertyImages(
          property.id,
          newImages,
          finalCoverImageIndex
        );

        try {
          const images = await getPropertyImages(property.id);
          setPropertyImages(images);
        } catch (error) {
          console.error("Failed to reload property images:", error);
        }
      }

      await refreshPropertyData();

      toast.success("Property updated successfully");

      setMode("view");
      setEditProperty(null);
    } catch (error) {
      console.error("Error saving property:", error);

      let errorMessage = "Failed to save property changes";
      if (
        error instanceof PropertiesServiceError ||
        error instanceof ImageServiceError
      ) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setMode("view");
    setEditProperty(null);
  };

  const handleDeleteProperty = async () => {
    try {
      await onDelete?.();
    } catch (error) {
      console.error("Error in delete callback:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col p-6 gap-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mode === "edit" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToView}
                    className="p-1 hover:bg-primary"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span
                    className={
                      mode === "view" ? "text-foreground font-semibold" : ""
                    }
                  >
                    Property Details
                  </span>
                  {mode === "edit" && (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-foreground font-semibold">
                        Edit Property
                      </span>
                    </>
                  )}
                </div>
              </div>
              {mode === "view" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="hover:bg-primary"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Content based on active mode */}
          {mode === "view" ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Images Carousel */}
              <div className="flex flex-col gap-4">
                <ImageCarousel
                  images={propertyImages}
                  propertyName={currentProperty.name}
                  className="w-full"
                  aspectRatio="video"
                  showThumbnails={propertyImages.length > 1}
                  isLoading={loadingImages}
                />
              </div>

              {/* Property Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Property Name
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {currentProperty.name}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <LandPlot className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Property Type
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {currentProperty.type}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <MapPinHouse className="w-4 h-4" />
                        <span className="text-sm font-medium">Address</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {currentProperty.address}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm font-medium">City</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {city}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-medium">Country</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {country}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Purchase Price
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {currentProperty.purchasePrice
                          ? `€${currentProperty.purchasePrice.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial & Occupancy Information */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Rental Information</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-2">
                        <Euro className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Monthly Rent
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-center">
                        €{currentProperty.rent}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Current Tenants
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-center">
                        {currentProperty.tenants}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-2">
                        <Percent className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Occupancy Rate
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-center">
                        {occupancyRate}%
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-center gap-2">
                        <span className="text-sm font-medium">
                          Availability
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <Badge
                          variant={
                            currentProperty.occupancy ===
                            OccupancyStatus.AVAILABLE
                              ? "secondary"
                              : "default"
                          }
                          className={`${
                            currentProperty.occupancy ===
                            OccupancyStatus.AVAILABLE
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {currentProperty.occupancy}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Details */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {/* Transaction Filters */}
                  <TransactionFilters
                    onFiltersChange={setFilters}
                    showPropertyFilter={false}
                    initialPropertyId={currentProperty.id}
                    availableCategories={availableCategories}
                    initialFilters={filters}
                  />

                  {/* Transaction Table */}
                  <div className="mt-4">
                    {error ? (
                      <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    ) : (
                      <TransactionTableWithActions
                        transactions={transactions}
                        loading={loading}
                        showPropertyColumn={false}
                        emptyMessage={`No transactions found for ${currentProperty.name}`}
                        onEdit={undefined}
                        onDelete={undefined}
                      />
                    )}

                    {/* Transaction Summary */}
                    {!loading && transactions.length > 0 && (
                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Showing {transactions.length} of {totalCount}{" "}
                          transactions
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <PropertyEditForm
              property={currentProperty}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </DialogContent>

      <DeletePropertyConfirmDialog
        property={property}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteProperty}
        onCloseParent={onClose}
      />
    </Dialog>
  );
}
