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
  Edit,
  Home,
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
import { TransactionsPagination } from "@/components/dashboard/transactions/TransactionsPagination";
import { usePropertyTransactionsQuery } from "@/hooks/queries/usePropertyTransactionsQuery";
import { CategoryOption, TransactionFilters as TransactionFiltersType } from "@/types/transactions";
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
import { formatCurrency, formatPercentage } from "@/lib/utils/formatting";
import { Separator } from "@/components/ui/separator";

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
  const [currentMonthMetrics, setCurrentMonthMetrics] = useState<{
    income: number;
    expenses: number;
    cashFlow: number;
    roi: number;
  } | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<TransactionFiltersType>({});

  const { data, isLoading, error } = usePropertyTransactionsQuery(
    property?.id,
    filters,
    page,
    pageSize
  );

  const transactions = data?.transactions || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.currentPage || 1;

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
    setCurrentMonthMetrics(null);
    setLoadingMetrics(true);
    setPage(1);
    setFilters({});

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

      try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const dateFrom = firstDayOfMonth.toISOString();
        const dateTo = now.toISOString();

        const [currentMonthResponse, lifetimeResponse] = await Promise.all([
          fetch(
            `/api/analytics/kpis?propertyId=${property.id}&dateFrom=${dateFrom}&dateTo=${dateTo}&includePropertyDetails=true`
          ),
          fetch(
            `/api/analytics/kpis?propertyId=${property.id}&includePropertyDetails=true`
          ),
        ]);

        if (!currentMonthResponse.ok || !lifetimeResponse.ok) {
          throw new Error("Failed to fetch metrics");
        }

        const currentMonthData = await currentMonthResponse.json();
        const lifetimeData = await lifetimeResponse.json();

        const currentMetrics = currentMonthData.properties?.[0];
        const lifetimeMetrics = lifetimeData.properties?.[0];

        if (currentMetrics || lifetimeMetrics) {
          setCurrentMonthMetrics({
            income: currentMetrics?.totalIncome || 0,
            expenses: currentMetrics?.totalExpenses || 0,
            cashFlow: currentMetrics?.cashFlow || 0,
            roi: lifetimeMetrics?.roi || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load property metrics:", error);
        setCurrentMonthMetrics(null);
      } finally {
        setLoadingMetrics(false);
      }
    };

    loadData();
  }, [isOpen, property]);

  if (!property) return null;

  const currentProperty = editProperty || refreshedProperty || property;
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
                          ? formatCurrency(currentProperty.purchasePrice)
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Information */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Rental Information</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3">
                    <div className="flex flex-col gap-2 p-6 items-center">
                      <p className="text-sm text-muted-foreground">
                        Expected Monthly Rent
                      </p>
                      <p className="text-3xl font-semibold">
                        {formatCurrency(currentProperty.rent)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 p-6 items-center ">
                      <p className="text-sm text-muted-foreground">
                        Current Tenants
                      </p>
                      <p className="text-3xl font-semibold">
                        {currentProperty.tenants}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 p-6 items-center">
                      <p className="text-sm text-muted-foreground">
                        Availability
                      </p>
                      <Badge
                        variant={
                          currentProperty.occupancy ===
                          OccupancyStatus.AVAILABLE
                            ? "secondary"
                            : "default"
                        }
                        className={`w-fit ${
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
                </CardContent>
              </Card>

              {/* Current Month Financial Performance */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Current Month Performance</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3">
                    <div className="flex flex-col gap-2 p-6 items-center">
                      <p className="text-sm text-muted-foreground">Income</p>
                      <p className="text-3xl font-semibold ">
                        {formatCurrency(currentMonthMetrics?.income || 0)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 p-6 items-center">
                      <p className="text-sm text-muted-foreground">Expenses</p>
                      <p className="text-3xl font-semibold">
                        {formatCurrency(currentMonthMetrics?.expenses || 0)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 p-6 items-center">
                      <p className="text-sm text-muted-foreground">Cash Flow</p>
                      <p
                        className={`text-3xl font-semibold ${
                          (currentMonthMetrics?.cashFlow || 0) >= 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {(currentMonthMetrics?.cashFlow || 0) >= 0 ? "+" : "-"}
                        {formatCurrency(
                          Math.abs(currentMonthMetrics?.cashFlow || 0)
                        )}
                      </p>
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
                    filters={filters}
                    onFiltersChange={setFilters}
                    availableCategories={availableCategories}
                    availableProperties={[]}
                    showPropertyFilter={false}
                  />

                  {/* Transaction Table */}
                  <div className="mt-4">
                    {error ? (
                      <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
                        <p className="text-sm text-destructive">{error.message}</p>
                      </div>
                    ) : (
                      <TransactionTableWithActions
                        transactions={transactions}
                        loading={isLoading}
                        showPropertyColumn={false}
                        emptyMessage={`No transactions found for ${currentProperty.name}`}
                        onEdit={undefined}
                        onDelete={undefined}
                      />
                    )}

                    {/* Transaction Pagination */}
                    {totalCount > 0 && (
                      <TransactionsPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(newSize) => {
                          setPageSize(newSize);
                          setPage(1);
                        }}
                        loading={isLoading}
                      />
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
