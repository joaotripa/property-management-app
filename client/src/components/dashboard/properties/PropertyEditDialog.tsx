"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PropertyEditForm } from "./edit/PropertyEditForm";
import { Property } from "@/types/properties";
import type { PropertyImage } from "@prisma/client";

interface PropertyEditDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  existingImages?: PropertyImage[];
}

export function PropertyEditDialog({
  property,
  isOpen,
  onClose,
  existingImages = [],
}: PropertyEditDialogProps) {
  if (!property) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>
        <PropertyEditForm
          property={property}
          existingImages={existingImages}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
