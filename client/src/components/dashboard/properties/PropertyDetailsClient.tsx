"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import { PropertyDetailsView } from "./PropertyDetailsView";
import { DeletePropertyConfirmDialog } from "./DeletePropertyConfirmDialog";
import { Loading } from "@/components/ui/loading";
import { Property } from "@/types/properties";
import { usePropertyImages } from "@/hooks/queries/usePropertyQueries";
import { usePropertyCurrentMonthMetrics } from "@/hooks/queries/usePropertyAnalytics";
import { usePropertyTransactionsQuery } from "@/hooks/queries/usePropertyTransactionsQuery";

interface PropertyDetailsClientProps {
  initialProperty: Property;
  canMutate?: boolean;
}

export function PropertyDetailsClient({
  initialProperty,
  canMutate = true,
}: PropertyDetailsClientProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: propertyImages = [],
    isLoading: isLoadingImages,
    error: imagesError,
  } = usePropertyImages(initialProperty.id);

  const { data: currentMonthMetrics = null } = usePropertyCurrentMonthMetrics(
    initialProperty.id
  );

  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionError,
  } = usePropertyTransactionsQuery(initialProperty.id);

  const isLoadingAny = isLoadingImages || isLoadingTransactions;

  if (imagesError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">Failed to load property images</p>
        <Button
          onClick={() => router.push("/dashboard/properties")}
          variant="outline"
        >
          Back to Properties
        </Button>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/dashboard/properties/${initialProperty.id}/edit`);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClose = (wasSuccessful?: boolean) => {
    setIsDeleteDialogOpen(false);
    if (wasSuccessful === true) {
      router.push("/dashboard/properties");
    }
  };

  const handleNavigateToTransactions = (url: string) => {
    router.push(url);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/properties")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              disabled={!canMutate}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={!canMutate}
              className="hover:bg-primary"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Content */}
        <PropertyDetailsView
          property={initialProperty}
          propertyImages={propertyImages}
          loadingImages={isLoadingImages}
          currentMonthMetrics={currentMonthMetrics}
          transactions={transactions}
          isLoadingTransactions={isLoadingTransactions}
          transactionError={transactionError}
          onNavigateToTransactions={handleNavigateToTransactions}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeletePropertyConfirmDialog
        property={initialProperty}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteClose}
      />
    </>
  );
}
