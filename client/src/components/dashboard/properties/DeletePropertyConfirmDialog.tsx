"use client";

import { useState } from "react";
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
import { deletePropertyWithTransactions } from "@/lib/services/client/propertiesService";

import { trackEvent } from "@/lib/analytics/tracker";
import { PROPERTY_EVENTS } from "@/lib/analytics/events";
import { useUserProperties } from "@/hooks/useUserProperties";

interface DeletePropertyConfirmDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  onCloseParent?: () => void;
}

export function DeletePropertyConfirmDialog({
  property,
  isOpen,
  onClose,
  onConfirm,
  onCloseParent,
}: DeletePropertyConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [operationStatus, setOperationStatus] = useState<string>("");
  const { properties } = useUserProperties();

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!property) return;

    setIsDeleting(true);
    try {
      setOperationStatus("Deleting property...");
      const result = await deletePropertyWithTransactions(
        property.id,
        property.name
      );

      if (result.success) {
        setOperationStatus("Refreshing property data...");
        await onConfirm();

        trackEvent(PROPERTY_EVENTS.PROPERTY_DELETED, {
          property_count: Math.max(0, properties.length - 1),
        });

        toast.success(result.message);
        onClose();
        onCloseParent?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Unexpected error deleting property:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
      setOperationStatus("");
    }
  };

  if (!property) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={isDeleting ? undefined : onClose}>
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
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {operationStatus || "Deleting..."}
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
