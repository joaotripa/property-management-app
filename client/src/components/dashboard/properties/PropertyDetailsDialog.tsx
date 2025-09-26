"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PropertyImage } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft, ChevronRight, Trash2 } from "lucide-react";
import { PropertyEditForm } from "./PropertyEditForm";
import { PropertyDetailsView } from "./PropertyDetailsView";
import { FileWithPreview } from "@/components/ui/multi-image-upload";
import { usePropertyTransactionsQuery } from "@/hooks/queries/usePropertyTransactionsQuery";
import { Property } from "@/types/properties";
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
  onSave: () => void;
  onDelete?: () => void | Promise<void>;
}

export function PropertyDetailsDialog({
  property,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: PropertyDetailsDialogProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [refreshedProperty, setRefreshedProperty] = useState<Property | null>(
    null
  );
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentMonthMetrics, setCurrentMonthMetrics] = useState<{
    income: number;
    expenses: number;
    cashFlow: number;
    roi: number;
  } | null>(null);

  const {
    data: transactions = [],
    isLoading,
    error,
  } = usePropertyTransactionsQuery(property?.id);

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

    const loadData = async () => {
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
      }
    };

    loadData();
  }, [isOpen, property]);

  if (!property) return null;

  const currentProperty = editProperty || refreshedProperty || property;

  const refreshPropertyData = async () => {
    if (!property?.id) return;
    try {
      const freshProperty = await getPropertyById(property.id);
      if (freshProperty) {
        setRefreshedProperty(freshProperty);
        onSave();
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
      await updateProperty(property.id, data);

      onSave();

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

  const handleNavigateToTransactions = (url: string) => {
    onClose();
    router.push(url);
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
            <PropertyDetailsView
              property={currentProperty}
              propertyImages={propertyImages}
              loadingImages={loadingImages}
              currentMonthMetrics={currentMonthMetrics}
              transactions={transactions}
              isLoadingTransactions={isLoading}
              transactionError={error}
              onNavigateToTransactions={handleNavigateToTransactions}
            />
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
