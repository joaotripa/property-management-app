"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Property } from "@/types/properties";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useDeletePropertyWithTransactions } from "@/hooks/queries/usePropertyQueries";

import { trackEvent } from "@/lib/analytics/tracker";
import { PROPERTY_EVENTS } from "@/lib/analytics/events";

interface DeletePropertyConfirmDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: (wasSuccessful?: boolean) => void;
}

export function DeletePropertyConfirmDialog({
  property,
  isOpen,
  onClose,
}: DeletePropertyConfirmDialogProps) {
  const { mutate: deleteProperty, isPending } =
    useDeletePropertyWithTransactions();

  const handleConfirm = () => {
    if (!property) return;

    deleteProperty(
      { id: property.id, name: property.name },
      {
        onSuccess: (result) => {
          if (result.success) {
            trackEvent(PROPERTY_EVENTS.PROPERTY_DELETED);
            toast.success(result.message);
            onClose(true);
          } else {
            toast.error(result.message || "Failed to delete property");
          }
        },
        onError: (error) => {
          console.error("Unexpected error deleting property:", error);
          toast.error("An unexpected error occurred. Please try again.");
        },
      }
    );
  };

  if (!property) return null;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose(false);
        }
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="flex flex-col gap-4 text-left">
            <span className="bg-warning/10 p-4 mt-3 rounded-md border-l-4 border-warning w-full text-sm text-warning-foreground">
              <strong>Warning Message:</strong> This operation will also delete
              all transactions associated with this property.
            </span>
            <span className="block text-foreground/80">
              Are you sure you want to delete the property{" "}
              <span className="font-semibold">&quot;{property.name}&quot;</span>
              ?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Property"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
